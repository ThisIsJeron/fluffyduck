# Gemini-Twilio Conversational Agent

A Python application that creates a bridge between Twilio Voice Calls and Google Gemini AI, enabling real-time voice conversations powered by AI. This component is part of the FluffyDuck project's backend services.

## Prerequisites

- Python 3.7+
- Google Cloud Platform Account
- Twilio Account
- ngrok (for local development)

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

3. Install the package in development mode:
   ```bash
   pip install -e ".[dev]"
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

1. Start the Quart server:
   ```bash
   python run.py
   ```

2. In a separate terminal, start ngrok:
   ```bash
   ngrok http 8080
   ```

3. Copy the HTTPS URL from ngrok and update your Twilio configuration:
   - Create a TwiML Bin with the following content:
     ```xml
     <?xml version="1.0" encoding="UTF-8"?>
     <Response>
         <Connect>
             <Stream url="wss://YOUR_NGROK_URL/gemini" />
         </Connect>
     </Response>
     ```
   - Replace `YOUR_NGROK_URL` with your ngrok URL (change https:// to wss://)
   - Configure your Twilio phone number to use this TwiML Bin

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

## Testing

1. Call your Twilio phone number
2. Speak into the phone
3. Listen for Gemini's response

## Integration with FluffyDuck

This component is designed to work alongside other FluffyDuck services. It handles voice interactions through Twilio and processes them using Google Gemini's AI capabilities.

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that ngrok is running and accessible
- Verify Twilio configuration is correct
- Monitor the Quart server logs for errors

## License

MIT License 