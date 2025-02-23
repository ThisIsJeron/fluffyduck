from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import json
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
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

# Initialize FAL client
import fal_client
import os
from dotenv import load_dotenv

load_dotenv()

FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    raise ValueError("FAL_KEY not found in environment variables")

async def generate_images_with_fal(
    name: str,
    description: str,
    target_audience: str,
    platforms: List[str],
    reference_image_url: Optional[str] = None
) -> Dict:
    """Generate images using FAL.ai"""
    try:
        # Customize style based on platform
        style_modifiers = {
            'Instagram': "instagram-style, vibrant, engaging, square format",
            'LinkedIn': "professional, corporate, clean design",
            'Facebook': "social media optimized, engaging, community focused",
            'Twitter': "attention-grabbing, concise, shareable"
        }
        
        # Get style for primary platform
        primary_platform = platforms[0]
        style = style_modifiers.get(primary_platform, "professional marketing")

        # Construct detailed prompt
        prompt = (
            f"Create a professional {primary_platform} marketing image for {target_audience}. "
            f"Campaign: {name}. {description}. "
            f"Style: High-quality, professional photography, {style}. "
            "Make it authentic and engaging, avoid artificial or stock photo look. "
            "Ensure the image matches the brand message and resonates with the target audience."
        )

        # Configure generation parameters
        arguments = {
            "prompt": prompt,
            "negative_prompt": "text overlay, watermark, low quality, logo, blurry, artificial looking, stock photo style",
            "image_size": "square_hd",  # 1024x1024
            "num_inference_steps": 50,  # Increased for better quality
            "guidance_scale": 7.5,
            "num_images": 3,
            "scheduler": "DPM++ 2M Karras"  # Changed from "DPMSolverMultistep" to a valid option
        }

        # If reference image provided, add it to parameters
        if reference_image_url:
            arguments["reference_image"] = reference_image_url
            arguments["reference_weight"] = 0.3  # How much to consider reference image

        print(f"\nGenerating images with prompt: {prompt}")
        
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
            raise ValueError("Invalid response format from Fal.ai")

    except Exception as e:
        print(f"Error generating images: {str(e)}")
        raise

@app.post("/api/generate-campaign", response_model=ImageGenerationResponse)
async def generate_campaign(
    campaign: str = Form(...),
    reference_image: Optional[UploadFile] = File(None)
):
    """
    Generate campaign images based on campaign details and optional reference image.
    
    - campaign: JSON string containing campaign details
    - reference_image: Optional image file to use as reference
    """
    try:
        # Parse the campaign JSON string
        campaign_data = json.loads(campaign)
        campaign_request = CampaignRequest(**campaign_data)

        # Handle reference image if provided
        reference_image_url = None
        if reference_image:
            # Read the image content
            image_content = await reference_image.read()
            # Here you would typically upload the image to a storage service
            # and get back a URL. For now, we'll skip this step
            print(f"Received reference image: {reference_image.filename}")

        # Generate images
        result = await generate_images_with_fal(
            name=campaign_request.name,
            description=campaign_request.description,
            target_audience=campaign_request.target_audience,
            platforms=campaign_request.platforms,
            reference_image_url=reference_image_url
        )
        
        return result
        
    except json.JSONDecodeError:
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

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "campaign-generator"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)