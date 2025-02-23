from dotenv import load_dotenv
import os
import fal_client
import base64
# Load environment variables from .env file
load_dotenv()
api_key = os.getenv("FAL_KEY")

if not api_key:
    raise ValueError("FAL API key is missing. Add it to your .env file.")

fal_client.api_key = api_key


def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print(log["message"])

# Path to the input image
image_path = "input/test.jpeg"

# Open and encode the image as Base64
with open(image_path, "rb") as image_file:
    image_data = base64.b64encode(image_file.read()).decode("utf-8")

result = fal_client.subscribe(
    "fal-ai/flux-pro/v1.1-ultra-finetuned",
    arguments={
        "prompt": "Enhance this image and improve its quality.",  # ✅ Add a required prompt
        "image": image_data,  # ✅ Ensure the image is sent as a Base64 string
        "num_images": 1,
        "enable_safety_checker": True,
        "safety_tolerance": "2",
        "output_format": "jpeg",
        "aspect_ratio": "16:9",
        "finetune_id": "abc",
        "finetune_strength": 0.4
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)

print(result)
