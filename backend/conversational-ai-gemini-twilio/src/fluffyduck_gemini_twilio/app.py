"""Main application module for the Gemini-Twilio integration."""

from quart import Quart, websocket, request, Response
import json
import base64
import struct
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import time
from .config import SYSTEM_PROMPT
import requests
from twilio.rest import Client as TwilioClient

# Load environment variables
load_dotenv()

app = Quart(__name__)

# In-memory store for Twilio transcription snippets keyed by CallSid
transcription_store: dict[str, list[str]] = {}

# ---------------------------------------------------------------------------
# System Prompt (Catering Menu)
# ---------------------------------------------------------------------------

class GeminiTwilio:
    """Handles the integration between Twilio and Google Gemini."""

    def __init__(self):
        """Initialize the Gemini-Twilio integration."""
        # Initialize the Google Cloud GenAI SDK
        api_key = os.getenv("GENAI_API_KEY")
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = genai.Client(
                vertexai=True,
                project=os.getenv("GOOGLE_CLOUD_PROJECT"),
                location=os.getenv("GOOGLE_CLOUD_LOCATION"),
            )
        # Use the Live model variant so we can leverage the new low-latency
        # bidirectional streaming capabilities (voices, VAD, session resume…)
        self.model_id = "gemini-2.0-flash-live-001"

        # Session configuration with system prompt
        self.config = {
            "response_modalities": ["AUDIO", "TEXT"],
            "system_instruction": types.Content(parts=[types.Part(text=SYSTEM_PROMPT)]),
        }
        self.stream_sid = None
        self._last_activity = time.time()
        self.transcript: list[str] = []  # store assistant messages for debugging

    # ---------------------------------------------------------------------
    # Twilio → Gemini helpers
    # ---------------------------------------------------------------------

    async def _twilio_to_gemini(self, session):
        """Read Twilio media events and forward the audio to Gemini."""
        from google.genai import types  # local import to avoid hard dep if not used

        while True:
            message = await websocket.receive()
            data = json.loads(message)

            # Update activity timestamp on every inbound frame from Twilio
            self._last_activity = time.time()

            if data["event"] == "start":
                self.stream_sid = data["start"]["streamSid"]
                self.call_sid = data["start"].get("callSid")
                print(f"Stream started – {self.stream_sid}")

            elif data["event"] == "media":
                try:
                    import asyncio

                    # Heavy processing happens in a worker thread to keep the
                    # event loop responsive (prevents WebSocket ping timeouts).
                    audio_data = await asyncio.to_thread(
                        base64.b64decode, data["media"]["payload"]
                    )

                    pcm_8k = await asyncio.to_thread(ulaw_to_pcm, audio_data)

                    pcm_16k = await asyncio.to_thread(upsample_to_16k, pcm_8k)

                    # 4. Send to Gemini
                    try:
                        await session.send_realtime_input(
                            media=types.Blob(
                                data=pcm_16k, mime_type="audio/pcm;rate=16000"
                            )
                        )
                    except Exception as send_err:
                        print(f"Gemini session closed: {send_err}")
                        break
                except Exception as exc:
                    print(f"Error handling Twilio media packet: {exc}")

            elif data["event"] == "stop":
                # Break the loop so the task exits; Gemini session continues
                print("Stream stopped – closing Twilio reader loop")
                break

    # ---------------------------------------------------------------------
    # Gemini → Twilio helpers
    # ---------------------------------------------------------------------

    def _gemini_audio_to_twilio_payload(self, audio_data: bytes) -> str:
        """Convert 24-kHz PCM from Gemini to Base64 µ-law payload for Twilio."""
        # 1. Down-sample 24-kHz → 8-kHz 16-bit PCM
        pcm_8k = downsample_to_8k(audio_data)

        # 2. Convert to µ-law codec
        mulaw_audio = pcm_to_ulaw(pcm_8k)

        # 3. Base64 encode for Twilio JSON transport
        return base64.b64encode(mulaw_audio).decode("utf-8")

    async def _gemini_to_twilio(self, session):
        """Continuously read Gemini responses and forward audio to Twilio."""
        while True:
            async for response in session.receive():
                if response.data is not None and self.stream_sid is not None:
                    try:
                        import asyncio
                        payload = await asyncio.to_thread(
                            self._gemini_audio_to_twilio_payload, response.data
                        )
                        twilio_msg = {
                            "event": "media",
                            "streamSid": self.stream_sid,
                            "media": {"payload": payload},
                        }
                        await websocket.send(json.dumps(twilio_msg))
                    except Exception as exc:
                        print(f"Error sending audio back to Twilio: {exc}")

                # Track activity for keep-alive logic
                self._last_activity = time.time()

                # Log when Gemini completes a turn
                if response.server_content and response.server_content.turn_complete:
                    # Capture any text Gemini produced for transcript
                    if response.text:
                        self.transcript.append(f"Assistant: {response.text}")
                    print("Gemini turn complete – awaiting user input…")

            # If we exit the inner async for loop the turn is complete; continue to wait for next turn

    async def gemini_websocket(self):
        """Establish Gemini session and shuttle audio between Twilio and Gemini."""
        import asyncio

        print("New websocket connection established")

        async with self.client.aio.live.connect(model=self.model_id, config=self.config) as session:
            try:
                twilio_task = asyncio.create_task(self._twilio_to_gemini(session))
                gemini_task = asyncio.create_task(self._gemini_to_twilio(session))

                async def keep_alive():
                    """Send a heartbeat every 25 s of inactivity so session stays alive."""
                    import websockets
                    while True:
                        try:
                            await asyncio.sleep(25)
                            if time.time() - self._last_activity > 24:
                                await session.send_client_content(
                                    turns={"parts": [{"text": "."}]},
                                    turn_complete=True,
                                )
                        except (websockets.exceptions.ConnectionClosed, RuntimeError):
                            # Session closed – exit keep-alive loop quietly
                            break

                keep_alive_task = asyncio.create_task(keep_alive())

                await asyncio.gather(twilio_task, gemini_task)

                keep_alive_task.cancel()
            except Exception as e:
                print(f"Unexpected error in gemini_websocket: {e}")
            finally:
                # Dump transcript for debugging
                fname = f"transcript_{int(time.time())}.txt"
                try:
                    with open(fname, "w", encoding="utf-8") as fp:
                        if self.transcript:
                            fp.write("\n".join(self.transcript))
                            # Append any Twilio transcription snippets
                            if hasattr(self, "call_sid") and self.call_sid in transcription_store:
                                fp.write("\n--- Twilio Speech Transcript ---\n")
                                fp.write("\n".join(transcription_store[self.call_sid]))
                        else:
                            fp.write("(No textual content captured – audio-only session)")
                    print(f"Transcript saved to {fname}")
                except Exception as file_err:
                    print(f"Failed to write transcript: {file_err}")

                print("Closing session")
                await websocket.close(code=200)
                await session.close()

@app.websocket('/gemini')
async def talk_to_gemini():
    """WebSocket endpoint for Gemini-Twilio integration."""
    await GeminiTwilio().gemini_websocket()

def create_app():
    """Create and configure the Quart application."""
    # Attempt to update Twilio webhook on startup
    _update_twilio_webhook()
    return app

if __name__ == "__main__":
    app.run(
        host=os.getenv('HOST', 'localhost'),
        port=int(os.getenv('PORT', 8080))
    )

# ---------------------------------------------------------------------------
# µ‑law (G.711) helpers                                                       
# These pure‑Python helpers replace the audioop C‑extension so the code works 
# on runtimes that don't ship audioop (PyPy, musl builds, etc.).              
# ---------------------------------------------------------------------------

_ULAW_BIAS = 0x84
_ULAW_CLIP = 32635


def _ulaw_decode_byte(b: int) -> int:
    """Decode one µ‑law byte to a signed 16‑bit PCM sample."""
    b = ~b & 0xFF
    sign = b & 0x80
    exponent = (b & 0x70) >> 4
    mantissa = b & 0x0F
    sample = ((mantissa << 3) + _ULAW_BIAS) << exponent
    sample -= _ULAW_BIAS
    return -sample if sign else sample


def ulaw_to_pcm(data: bytes) -> bytes:
    """Convert µ‑law bytes to little‑endian 16‑bit PCM bytes."""
    pcm_samples = [_ulaw_decode_byte(b) for b in data]
    return struct.pack("<%dh" % len(pcm_samples), *pcm_samples)


def _ulaw_encode_sample(sample: int) -> int:
    sign = 0x80 if sample < 0 else 0x00
    if sample < 0:
        sample = -sample
    if sample > _ULAW_CLIP:
        sample = _ULAW_CLIP
    sample += _ULAW_BIAS
    exponent = 7
    exp_mask = 0x4000
    while exponent > 0 and not (sample & exp_mask):
        exponent -= 1
        exp_mask >>= 1
    mantissa = (sample >> (exponent + 3)) & 0x0F
    ulaw_byte = ~(sign | (exponent << 4) | mantissa) & 0xFF
    return ulaw_byte


def pcm_to_ulaw(pcm: bytes) -> bytes:
    """Convert little‑endian 16‑bit PCM bytes to µ‑law bytes."""
    n = len(pcm) // 2
    samples = struct.unpack("<%dh" % n, pcm)
    return bytes(_ulaw_encode_sample(s) for s in samples)

# ---------------------------------------------------------------------------
# Simple re-sampling helpers (8 kHz ↔︎ 16 kHz ↔︎ 24 kHz)
#  These naïve algorithms duplicate or drop samples.  For production you might
#  switch to a proper DSP library (e.g. `samplerate` or `scipy.signal`).
# ---------------------------------------------------------------------------


def upsample_to_16k(pcm_8k: bytes) -> bytes:
    """Up-sample 8 kHz PCM → 16 kHz.

    If SciPy is available we use `resample_poly` for better quality,
    otherwise we fall back to simple duplication.
    """
    try:
        import numpy as np  # type: ignore
        from scipy.signal import resample_poly  # type: ignore

        samples = np.frombuffer(pcm_8k, dtype="<i2")
        up = resample_poly(samples, 2, 1).astype("<i2")
        return up.tobytes()
    except Exception:
        n = len(pcm_8k) // 2
        samples = struct.unpack("<%dh" % n, pcm_8k)
        up = [s for sample in samples for s in (sample, sample)]
        return struct.pack("<%dh" % (n * 2), *up)


def downsample_to_8k(pcm_24k: bytes) -> bytes:
    """Down-sample 24 kHz PCM → 8 kHz.

    Prefers `resample_poly` (factor 1/3) if SciPy is present.
    """
    try:
        import numpy as np  # type: ignore
        from scipy.signal import resample_poly  # type: ignore

        samples = np.frombuffer(pcm_24k, dtype="<i2")
        down = resample_poly(samples, 1, 3).astype("<i2")
        return down.tobytes()
    except Exception:
        n = len(pcm_24k) // 2
        samples = struct.unpack("<%dh" % n, pcm_24k)
        down = samples[::3]
        return struct.pack("<%dh" % len(down), *down)

# ---------------------------------------------------------------------------
# Twilio transcription webhook
# ---------------------------------------------------------------------------

@app.route("/twilio/transcription", methods=["POST"])
async def twilio_transcription():
    """Receive transcription events from Twilio and store them."""
    # Twilio sends application/x-www-form-urlencoded by default
    form = await request.form
    call_sid = form.get("CallSid") or form.get("callsid")
    # Prefer Real-Time Transcription (\<Start><Transcription>) payload if available
    text = None
    if form.get("TranscriptionData"):
        try:
            data = json.loads(form["TranscriptionData"])
            # Incoming key can be Transcript or transcript depending on casing
            text = data.get("Transcript") or data.get("transcript")
            # Only store final utterances when Twilio marks them as final
            final_flag = form.get("Final", "true").lower()
            if final_flag == "false":
                text = None  # skip interim results
        except Exception:
            pass
    # Fall back to older transcription keys
    if not text:
        text = form.get("TranscriptionText") or form.get("SpeechResult") or form.get("transcription_text")

    if call_sid and text:
        transcription_store.setdefault(call_sid, []).append(text)
        print(f"[Twilio STT] {call_sid}: {text}")
    return Response(status=204)

# ---------------------------------------------------------------------------
# Twilio / ngrok helper to automatically update voice webhook
# ---------------------------------------------------------------------------

def _update_twilio_webhook():
    """Detect active ngrok tunnel and update Twilio phone webhook."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    phone_sid = os.getenv("TWILIO_PHONE_SID")

    if not all([account_sid, auth_token, phone_sid]):
        print("Twilio credentials not set – skip automatic webhook update")
        return

    try:
        ngrok_resp = requests.get("http://127.0.0.1:4040/api/tunnels", timeout=2)
        tunnels = ngrok_resp.json()["tunnels"]
        public_https = next(t["public_url"] for t in tunnels if t["proto"] == "https")
        webhook_url = f"{public_https}/twilio/inbound_call"

        twilio_client = TwilioClient(account_sid, auth_token)
        twilio_client.incoming_phone_numbers(phone_sid).update(voice_url=webhook_url, voice_method="POST")
        print(f"Updated Twilio voice webhook to {webhook_url}")
    except Exception as err:
        print(f"Could not update Twilio webhook automatically: {err}")

# ---------------------------------------------------------------------------
# Simple TwiML endpoint so we don't need a TwiML Bin
# ---------------------------------------------------------------------------

from twilio.twiml.voice_response import VoiceResponse, Connect, Start


@app.route("/twilio/inbound_call", methods=["GET", "POST"])
async def inbound_call():
    host = request.host.split(":")[0]
    resp = VoiceResponse()
    # Enable Twilio Real-Time Transcription for the caller (inbound track)
    start = resp.start()
    start.transcription(
        status_callback_url=f"https://{host}/twilio/transcription",
        track="inbound_track",
        partial_results="false",
    )

    connect = Connect()
    connect.stream(url=f"wss://{host}/gemini")
    resp.append(connect)
    return Response(str(resp), mimetype="application/xml") 