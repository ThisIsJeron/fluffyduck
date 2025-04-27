"""Main application module for the Gemini-Twilio integration."""

from quart import Quart, websocket
import json
import base64
import struct
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
import time
from .config import SYSTEM_PROMPT

# Load environment variables
load_dotenv()

app = Quart(__name__)

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
            "response_modalities": ["AUDIO"],
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