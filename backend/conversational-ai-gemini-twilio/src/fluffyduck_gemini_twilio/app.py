"""Main application module for the Gemini-Twilio integration."""

from quart import Quart, websocket
import json
import base64
import struct
from google import genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Quart(__name__)

class GeminiTwilio:
    """Handles the integration between Twilio and Google Gemini."""

    def __init__(self):
        """Initialize the Gemini-Twilio integration."""
        # Initialize the Google Cloud GenAI SDK
        self.client = genai.Client(
            vertexai=True,
            project=os.getenv('GOOGLE_CLOUD_PROJECT'),
            location=os.getenv('GOOGLE_CLOUD_LOCATION')
        )
        self.model_id = "gemini-2.0-flash-001"
        self.config = {"response_modalities": ["AUDIO"]}
        self.stream_sid = None

    async def twilio_audio_stream(self):
        """Handle incoming Twilio audio stream."""
        while True:
            message = await websocket.receive()
            data = json.loads(message)
            if data['event'] == 'start':
                self.stream_sid = data['start']['streamSid']
                print(f"Stream started - {self.stream_sid}")
            elif data['event'] == 'media':
                audio_data = data['media']['payload']
                decoded_audio = base64.b64decode(audio_data)
                pcm_audio = ulaw_to_pcm(decoded_audio)
                yield pcm_audio
            elif data['event'] == 'stop':
                print("Stream stopped")

    def convert_audio_to_mulaw(self, audio_data: bytes) -> str:
        """Convert audio data to mulaw format."""
        # NOTE: Gemini returns 24‑kHz 16‑bit PCM; Twilio expects 8‑kHz µ‑law.
        # Down‑sampling is not handled here; assume incoming PCM is 8‑kHz.
        mulaw_audio = pcm_to_ulaw(audio_data)
        encoded_audio = base64.b64encode(mulaw_audio).decode("utf-8")
        return encoded_audio

    async def gemini_websocket(self):
        """Handle the Gemini WebSocket connection."""
        print("New websocket connection established")
        async with self.client.aio.live.connect(model=self.model_id, config=self.config) as session:
            try:
                async for response in session.start_stream(stream=self.twilio_audio_stream(), mime_type='audio/pcm'):
                    if data := response.data:
                        message = {
                            "event": "media",
                            "streamSid": self.stream_sid,
                            "media": {
                                "payload": self.convert_audio_to_mulaw(data)
                            }
                        }
                        print(message)
                        await websocket.send(json.dumps(message))
            except Exception as e:
                print(f'Unexpected error in gemini_websocket: {e}')
            finally:
                print('Closing session')
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