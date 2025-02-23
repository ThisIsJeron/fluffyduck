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
        "https://fluffyduck.vercel.app",
        "http://localhost:5173",
        "*"  # Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Check for FAL API key
FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    raise ValueError("FAL_KEY not found in environment variables")

fal_client.api_key = FAL_KEY

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

async def enhance_marketing_image(
    name: str,
    description: str,
    target_audience: str,
    platforms: List[str],
    reference_image_data: str
) -> Dict:
    """Enhance existing marketing images to make them more professional and platform-appropriate"""
    try:
        # Get style for primary platform
        primary_platform = platforms[0]
        style_modifiers = {
            'Instagram': (
                "enhance this professional photo, maintain original composition, "
                "make it instagram-worthy, improve lighting and colors, "
                "high-end photography style, no AI artifacts, premium quality"
            ),
            'LinkedIn': (
                "enhance this professional photo, maintain original composition, "
                "corporate style, premium business look, high-end photography style, "
                "no AI artifacts, professional lighting"
            ),
            'Facebook': (
                "enhance this professional photo, maintain original composition, "
                "social media optimized, premium look, high-end photography style, "
                "no AI artifacts, engaging visuals"
            ),
            'Twitter': (
                "enhance this professional photo, maintain original composition, "
                "attention-grabbing, premium quality, high-end photography style, "
                "no AI artifacts, crisp details"
            )
        }
        style = style_modifiers.get(primary_platform, "professional photography enhancement")

        # Construct prompt focused on enhancing the existing image
        prompt = (
            f"Enhance this photo while preserving its original content and composition. "
            f"Make it look like a professionally taken photograph. "
            f"Target audience: {target_audience}. "
            f"Style: {style}. "
            "Improve lighting, color grading, and overall quality. "
            "Keep it natural and authentic looking, avoid artificial AI-generated appearance. "
            "Make it look like it was taken by a professional photographer with high-end equipment. "
            "Ensure natural skin tones and realistic textures. "
            "Maintain authentic details and professional composition."
        )

        # Configure enhancement parameters
        # Configure enhancement parameters
        arguments = {
            "prompt": prompt,
            "negative_prompt": (
                "artificial, fake, generated, distorted, low quality, blurry, oversaturated, "
                "unrealistic, cartoon, illustration, painting, drawing, text, watermark, "
                "AI artifacts, unnatural colors, poor lighting, bad composition, "
                "artificial textures, synthetic look"
            ),
            "image_size": "square_hd",
            "num_inference_steps": 50,     # Changed from 75 to 50 (maximum allowed)
            "guidance_scale": 8.5,
            "num_images": 3,
            "scheduler": "DPM++ 2M Karras",
            "image_guidance_scale": 1.8,
            "reference_image": reference_image_data,
            "reference_weight": 0.9
        }

        print("Calling FAL API for image enhancement...")
        print(f"Using prompt: {prompt}")
        
        result = fal_client.subscribe(
            "fal-ai/stable-diffusion-v15",
            arguments=arguments,
            with_logs=True
        )
        
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
    """Enhance marketing images while maintaining their original essence"""
    try:
        # Parse campaign data
        print(f"Received campaign data: {campaign}")
        campaign_data = json.loads(campaign)
        campaign_request = CampaignRequest(**campaign_data)

        # Process the uploaded image
        print(f"Processing reference image: {reference_image.filename}")
        reference_image_data = await process_image_for_fal(reference_image)

        # Enhance the image
        result = await enhance_marketing_image(
            name=campaign_request.name,
            description=campaign_request.description,
            target_audience=campaign_request.target_audience,
            platforms=campaign_request.platforms,
            reference_image_data=reference_image_data
        )
        
        print(f"Enhancement result: {result}")
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