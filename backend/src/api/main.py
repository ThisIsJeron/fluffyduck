from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import json
from pydantic import BaseModel
import fal_client
import os
from dotenv import load_dotenv
import base64
from io import BytesIO
# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="FluffyDuck API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fluffyduck.vercel.app",  # Replace with your frontend URL
        "http://localhost:5173",          # For local development
        "*"                               # Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for FAL API key
FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    raise ValueError("FAL_KEY not found in environment variables")

fal_client.api_key = FAL_KEY  # Set the API key for fal_client

# Pydantic models
class CampaignRequest(BaseModel):
    name: str
    description: str
    target_audience: str
    cadence: str
    platforms: List[str]

class ImageGenerationResponse(BaseModel):
    generated_images: List[str]
    prompt: str
    style_used: str

async def process_image_for_fal(image: UploadFile) -> str:
    """Convert uploaded image to base64 for FAL API"""
    try:
        contents = await image.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        return f"data:image/{image.content_type.split('/')[-1]};base64,{base64_image}"
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        raise

async def generate_marketing_variations(
    name: str,
    description: str,
    target_audience: str,
    platforms: List[str],
    reference_image_data: str
) -> Dict:
    """Generate marketing-enhanced variations of the provided image"""
    try:
        # Get style for primary platform
        primary_platform = platforms[0]
        style_modifiers = {
            'Instagram': "professional marketing style, instagram-worthy, engaging, high-quality",
            'LinkedIn': "professional, corporate style, business-appropriate, polished",
            'Facebook': "social media optimized, engaging, community-focused, appealing",
            'Twitter': "attention-grabbing, impactful, shareable, crisp"
        }
        style = style_modifiers.get(primary_platform, "professional marketing")

        # Construct prompt focused on enhancing the existing image
        prompt = (
            f"Enhance this image for {primary_platform} marketing. "
            f"Make it more professional and marketable while maintaining its original content and theme. "
            f"Target audience: {target_audience}. "
            f"Campaign: {name}. {description}. "
            f"Style: {style}. "
            "Improve lighting, composition, and visual appeal. "
            "Keep the main subject and theme but make it more polished and professional."
        )

        print(f"Using prompt: {prompt}")

        # Configure generation parameters
        arguments = {
            "prompt": prompt,
            "negative_prompt": "different subject, different composition, text overlay, watermark, low quality, blurry, distorted",
            "image_size": "square_hd",
            "num_inference_steps": 50,
            "guidance_scale": 7.5,
            "num_images": 3,
            "scheduler": "DPM++ 2M Karras",
            "image_guidance_scale": 1.5,
            "reference_image": reference_image_data,
            "reference_weight": 0.8
        }

        print("Calling FAL API...")
        
        result = fal_client.subscribe(
            "fal-ai/stable-diffusion-v15",
            arguments=arguments,
            with_logs=True
        )
        
        print(f"FAL API Response: {result}")

        if isinstance(result, dict) and 'images' in result:
            return {
                'generated_images': [img['url'] for img in result['images']],
                'prompt': prompt,
                'style_used': style
            }
        else:
            raise ValueError(f"Invalid response format from Fal.ai: {result}")

    except Exception as e:
        print(f"Error enhancing image: {str(e)}")
        raise

@app.post("/api/generate-campaign", response_model=ImageGenerationResponse)
async def generate_campaign(
    campaign: str = Form(...),
    reference_image: UploadFile = File(...)
):
    """Generate marketing-enhanced variations of the uploaded image"""
    try:
        # Parse campaign data
        print(f"Received campaign data: {campaign}")
        campaign_data = json.loads(campaign)
        campaign_request = CampaignRequest(**campaign_data)

        # Process the uploaded image
        print(f"Processing reference image: {reference_image.filename}")
        reference_image_data = await process_image_for_fal(reference_image)

        # Generate enhanced variations
        result = await generate_marketing_variations(
            name=campaign_request.name,
            description=campaign_request.description,
            target_audience=campaign_request.target_audience,
            platforms=campaign_request.platforms,
            reference_image_data=reference_image_data
        )
        
        print(f"Generation result: {result}")
        return result
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON format in campaign data"
        )
    except Exception as e:
        print(f"Error in generate_campaign: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating campaign: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "FluffyDuck API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "marketing-image-enhancer",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)