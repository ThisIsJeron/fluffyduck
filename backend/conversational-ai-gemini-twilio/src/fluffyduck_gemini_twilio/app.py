"""Main application module for the Gemini-Twilio integration."""

from quart import Quart, websocket
import json
import base64
import audioop
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
        self.model_id = "gemini-2.0-flash-exp"
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
                pcm_audio = audioop.ulaw2lin(decoded_audio, 2)
                yield pcm_audio
            elif data['event'] == 'stop':
                print("Stream stopped")

    def convert_audio_to_mulaw(self, audio_data: bytes) -> str:
        """Convert audio data to mulaw format."""
        data, _ = audioop.ratecv(audio_data, 2, 1, 24000, 8000, None)
        mulaw_audio = audioop.lin2ulaw(data, 2)
        encoded_audio = base64.b64encode(mulaw_audio).decode('utf-8')
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