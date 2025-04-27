# Gemini-Twilio Conversational Agent

A Python application that creates a bridge between Twilio Voice Calls and Google Gemini AI, enabling real-time voice conversations powered by AI. This component is part of the FluffyDuck project's backend services.

## Prerequisites

- Python 3.9+ (required by the `google-genai` Live SDK)
- Google Cloud Platform Project with the Gemini API enabled and a service-account that has Vertex AI `GenerativeAiUser` access.
- Twilio Account with a voice-capable phone number.
- `ngrok` (or another tunnel) for local development.

> **Tip**  If you only need quick testing you can use a Google API key instead of a service account by switching `vertexai=True` to `api_key="YOUR_KEY"` in `app.py`.

## Setup

1. Navigate to the component directory:
   ```bash
   cd backend/conversational-ai-gemini-twilio
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies (including the latest Live-API SDK):
   ```bash
   pip install -U google-genai               # Live-API
   pip install -e ".[dev]"  # local package + dev tools
   ```

4. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

5. Edit `.env` with your:
   - Google Cloud Project ID
   - Twilio Account SID and Auth Token
   - Twilio Phone Number
   - Server configuration (host and port)

## Running the Component

1. Ensure environment variables are set (see `.env.example`).  At minimum you need:

   ```env
   GOOGLE_CLOUD_PROJECT=<your-gcp-project>
   GOOGLE_CLOUD_LOCATION=us-central1   # or europe-west4, etc.
   HOST=0.0.0.0                        # let Quart listen on all interfaces
   PORT=8080
   ```

2. Start the Quart server:
   ```bash
   python run.py
   ```

3. In a second terminal start ngrok and expose the port:
   ```bash
   ngrok http 8080
   ```

4. Point your Twilio number to the WebSocket endpoint:

   Create a **TwiML Bin** containing:

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <Response>
       <Connect>
           <Stream url="wss://YOUR_NGROK_SUBDOMAIN.ngrok-free.app/gemini" />
       </Connect>
   </Response>
   ```

   Replace `YOUR_NGROK_SUBDOMAIN` with the HTTPS host output by ngrok (note the `wss://` scheme).

   Finally, configure the Twilio phone number **Voice Webhook** to "TwiML Bin → your-bin".

When you dial the number you should see:

```text
WebSocket connection established
Stream started – <TWILIO_STREAM_SID>
```

Bidirectional audio will start flowing between Twilio (8 kHz µ-law) and Gemini (16/24 kHz PCM).  The code does a basic up/down-sampling in pure Python – swap in a DSP lib for production quality.

## Development

The project uses modern Python packaging standards with `pyproject.toml`. Development tools include:

- `black` for code formatting
- `isort` for import sorting
- `mypy` for type checking
- `ruff` for linting
- `pytest` for testing

To run the development tools:

```bash
# Format code
black src tests

# Sort imports
isort src tests

# Type checking
mypy src tests

# Linting
ruff check src tests

# Run tests
pytest
```

## Project Structure

```
conversational-ai-gemini-twilio/
├── src/
│   └── fluffyduck_gemini_twilio/
│       ├── __init__.py
│       └── app.py
├── tests/
├── .env.example
├── pyproject.toml
├── run.py
└── README.md
```

## Testing / Demo Flow

1. Call your Twilio number from any phone.
2. Speak – Twilio streams µ-law audio to the server, which forwards it to Gemini.
3. Gemini responds; the server transcodes the 24 kHz PCM back to µ-law and Twilio plays it to you in real time.

Try interrupting Gemini mid-sentence – the Live-API will cancel the generation and listen again.

## Integration with FluffyDuck

This component is designed to work alongside other FluffyDuck services. It handles voice interactions through Twilio and processes them using Google Gemini's AI capabilities.

## Troubleshooting

│ Symptom                               │ Common Cause / Fix                                 │
│---------------------------------------│----------------------------------------------------│
│ Call hangs up immediately              │ Twilio cannot reach `wss://…/gemini` – re-check    │
│                                        │ ngrok tunnel and TwiML Bin URL                    │
│ No audio from Gemini                   │ Make sure `google-genai` is ≥ 0.5, check GCP IAM   │
│                                        │ role and that the Gemini API is enabled           │
│ Audio quality is garbled               │ Replace naive resampler with a proper DSP (SciPy) │
│ Server shows `PermissionDenied`        │ ADC creds missing ‑ `gcloud auth application-default login` │

Enable Quart debug logs with `export QUART_ENV=development` for verbose output.

## License

MIT License 