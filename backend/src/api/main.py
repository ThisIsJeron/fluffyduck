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
app = FastAPI(title="FluffyDuck API - Restaurant Photo Enhancer")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fluffyduck.vercel.app",
        "http://localhost:5173",
        "*"
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

async def enhance_restaurant_photo(
    name: str,
    description: str,
    target_audience: str,
    platforms: List[str],
    reference_image_data: str
) -> Dict:
    """Enhance existing restaurant food photography while maintaining composition"""
    try:
        # Platform-specific enhancement styles
        primary_platform = platforms[0] if platforms else "Instagram"
        style_modifiers = {
            'Instagram': {
                'style': (
                    "enhance this exact food photo, improve lighting and colors, "
                    "make it instagram-worthy while keeping exact composition, "
                    "maintain identical plating, enhance existing details, "
                    "professional food photography color grading"
                ),
                'aspect_ratio': "square_hd"
            },
            'LinkedIn': {
                'style': (
                    "enhance this exact food photo, improve lighting and colors, "
                    "upscale restaurant style while keeping exact composition, "
                    "maintain identical plating, enhance existing details, "
                    "professional business presentation"
                ),
                'aspect_ratio': "landscape_hd"
            },
            'Facebook': {
                'style': (
                    "enhance this exact food photo, improve lighting and colors, "
                    "social-media optimized while keeping exact composition, "
                    "maintain identical plating, enhance existing details, "
                    "engaging food presentation"
                ),
                'aspect_ratio': "landscape_hd"
            },
            'Twitter': {
                'style': (
                    "enhance this exact food photo, improve lighting and colors, "
                    "attention-grabbing while keeping exact composition, "
                    "maintain identical plating, enhance existing details, "
                    "impactful food presentation"
                ),
                'aspect_ratio': "landscape_hd"
            }
        }

        platform_style = style_modifiers.get(primary_platform, {
            'style': "enhance this exact food photo professionally",
            'aspect_ratio': "square_hd"
        })

        # Craft detailed enhancement prompt
        prompt = (
            f"Enhance this exact food photo for {name} restaurant marketing. "
            f"Keep the exact same composition and plating. "
            f"Campaign focus: {description}. "
            f"Target audience: {target_audience}. "
            "DO NOT change food arrangement or composition. "
            "ONLY enhance: "
            "- Professional lighting to highlight textures "
            "- Color balance and vibrancy "
            "- Sharpness and clarity "
            "- Professional food photography appeal "
            "Make lighting and colors match high-end restaurant photography. "
            "Maintain exact food placement and styling. "
            "Enhance existing shadows and highlights. "
            "Keep natural, authentic food appearance."
        )

        # Configure enhancement parameters
        arguments = {
            "prompt": prompt,
            "negative_prompt": (
                "different composition, different plating, different food, "
                "new arrangement, modified layout, alternate angle, "
                "changed perspective, different setup, artificial looking, "
                "oversaturated, unrealistic colors, cartoon effect, "
                "illustration style, painting style, artificial enhancement"
            ),
            "image_size": platform_style['aspect_ratio'],
            "num_inference_steps": 50,
            "guidance_scale": 7.0,
            "num_images": 3,
            "scheduler": "DPM++ 2M Karras",
            "image_guidance_scale": 2.5,
            "reference_image": reference_image_data,
            "reference_weight": 0.98,
            "control_guidance_start": 0.0,
            "control_guidance_end": 1.0
        }

        print(f"Enhancing existing food photo for {primary_platform}...")
        print(f"Using prompt: {prompt}")
        
        result = fal_client.subscribe(
            "fal-ai/stable-diffusion-v15",
            arguments=arguments,
            with_logs=True
        )
        
        if not isinstance(result, dict) or 'images' not in result:
            raise ValueError(f"Invalid response format from Fal.ai: {result}")

        return {
            'generated_images': [img['url'] for img in result['images']],
            'prompt': prompt,
            'style_used': platform_style['style']
        }

    except Exception as e:
        print(f"Error enhancing food image: {str(e)}")
        raise

@app.post("/api/generate-campaign", response_model=ImageGenerationResponse)
async def generate_campaign(
    campaign: str = Form(...),
    reference_image: UploadFile = File(...)
):
    """Enhance existing restaurant food photos for marketing campaign"""
    try:
        print("\n=== Starting new campaign generation ===")
        
        # Debug information
        print(f"Campaign data received: {campaign}")
        print(f"Image details:")
        print(f"- Filename: {reference_image.filename if reference_image else 'No file'}")
        print(f"- Content type: {reference_image.content_type if reference_image else 'No content type'}")

        # Validate campaign data
        try:
            campaign_data = json.loads(campaign)
            campaign_request = CampaignRequest(**campaign_data)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail="Invalid campaign data format"
            )

        # Validate image file
        if not reference_image or not reference_image.filename:
            raise HTTPException(
                status_code=400,
                detail="No image file was uploaded. Please select an image."
            )

        # Read and validate image content
        try:
            contents = await reference_image.read()
            file_size = len(contents)
            print(f"- File size: {file_size} bytes")
            
            if file_size == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Empty image file"
                )
            
            # Reset file position after reading
            await reference_image.seek(0)
            
            # Convert image to base64 for FAL API
            reference_image_data = f"data:image/jpeg;base64,{base64.b64encode(contents).decode('utf-8')}"
            
        except Exception as e:
            print(f"Error reading image: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail="Error reading image file. Please try uploading again."
            )

        # Enhance the photo
        try:
            result = await enhance_restaurant_photo(
                name=campaign_request.name,
                description=campaign_request.description,
                target_audience=campaign_request.target_audience,
                platforms=campaign_request.platforms,
                reference_image_data=reference_image_data
            )
            
            print("Enhancement completed successfully")
            return result
            
        except Exception as e:
            print(f"Enhancement error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error enhancing photo: {str(e)}"
            )

    except HTTPException as he:
        print(f"HTTP Exception: {he.detail}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "FluffyDuck Restaurant Photo Enhancement API",
        "version": "2.0.0",
        "status": "healthy",
        "service": "food-photography-enhancer"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "food-photography-enhancer",
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)