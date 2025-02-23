from openai import OpenAI
from toolhouse import Toolhouse
from google import genai
import psycopg2, os, requests, logging
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class PatientBillingInfo:
    patient_first_name: str
    patient_last_name: str
    email: str
    phone_number: str
    reason_for_visit: str
    portal_link: str


def respond_to_incoming_call_with_elevenlabs(phone="+19038516387") -> dict:
    """
    Respond to an incoming call using the ElevenLabs API for voice interaction.

    Args:
    phone (str): The phone number of the incoming call.

    Returns:
    dict: The response from the ElevenLabs API.
    """
    headers = {
        'Authorization': 'sk_509ca4cac517288d93f20d79119a45fcb577a5db151270e8'
    }
    prompt = f"""
    Hello, thank you for calling [Restaurant Name]. How can I assist you with your reservation today?

    *[Wait for response]*  
    **(AI Agent should respond with: "Sure," "Of course," or "Absolutely," before continuing.)**

    Could you please provide the date and time you would like to make the reservation for?

    *[Wait for response]*  
    **(AI Agent should respond with: "Great choice," "Sounds perfect," or "Excellent," before continuing.)**

    Do you have a preference for indoor or outdoor seating?

    *[Wait for response]*  
    **(AI Agent should respond with: "Noted," "Thank you for letting us know," or "We'll take care of that," before continuing.)**

    Lastly, are there any special requests or dietary restrictions we should be aware of?

    *[Wait for response]*  
    **(AI Agent should respond with: "Thank you for sharing," "We'll accommodate that," or "Understood," before continuing.)**

    Thank you for choosing [Restaurant Name]. We look forward to your visit. Have a wonderful day!
    """

    data = {
        "phone_number": phone,
        "from": None,
        "task": prompt,
        "model": "enhanced",
        "language": "en",
        "voice": "nat",
        "voice_settings": {},
        "pathway_id": None,
        "local_dialing": False,
        "max_duration": 12,
        "answered_by_enabled": False,
        "wait_for_greeting": False,
        "record": False,
        "amd": False,
        "interruption_threshold": 80,
        "voicemail_message": None,
        "temperature": None,
        "transfer_phone_number": None,
        "transfer_list": {},
        "metadata": None,
        "pronunciation_guide": [],
        "start_time": None,
        "request_data": {},
        "tools": [],
        "dynamic_data": [],
        "analysis_preset": None,
        "analysis_schema": {},
        "webhook": None,
        "calendly": {}
    }

    try:
        response = requests.post('https://api.elevenlabs.io/v1/calls', json=data, headers=headers)
        response.raise_for_status()
        logging.info("ElevenLabs API call successful.")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error while calling ElevenLabs API: {e}")
        return {}
    
#send_prompt_to_bland_ai(prompt)


