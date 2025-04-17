"""Entry point for running the Gemini-Twilio application."""

from fluffyduck_gemini_twilio.app import create_app
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    app = create_app()
    app.run(
        host=os.getenv('HOST', 'localhost'),
        port=int(os.getenv('PORT', 8080))
    ) 