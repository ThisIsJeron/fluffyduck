import os
from typing import List, Optional, Dict
import fal_client
from dotenv import load_dotenv

load_dotenv()

class FalService:
    def __init__(self):
        self.fal_key = os.getenv("FAL_KEY")
        if not self.fal_key:
            raise ValueError("Missing FAL_KEY environment variable")

    async def generate_campaign_images(
        self,
        name: str,
        description: str,
        target_audience: str,
        platforms: List[str],
        reference_image_url: Optional[str] = None
    ) -> Dict:
        try:
            # Style based on platform
            style_modifiers = {
                'Instagram': "instagram-style, vibrant, engaging, square format",
                'LinkedIn': "professional, corporate, clean design",
                'Facebook': "social media optimized, engaging, community focused",
                'Twitter': "attention-grabbing, concise, shareable"
            }
            
            primary_platform = platforms[0]
            style = style_modifiers.get(primary_platform, "professional marketing")

            # Base prompt
            prompt = (
                f"Create a professional {primary_platform} marketing image for {target_audience}. "
                f"Campaign: {name}. {description}. "
                f"Style: High-quality, professional photography, {style}. "
                "Make it authentic and engaging, avoid artificial or stock photo look."
            )

            # Configure parameters
            arguments = {
                "prompt": prompt,
                "negative_prompt": "text overlay, watermark, low quality, logo, blurry, artificial looking",
                "image_size": "square_hd",
                "num_inference_steps": 50,
                "guidance_scale": 7.5,
                "num_images": 3
            }

            # Add reference image if provided
            if reference_image_url:
                arguments["reference_image"] = reference_image_url
                arguments["reference_weight"] = 0.5  # Adjust influence of reference image

            print(f"\nGenerating images with prompt: {prompt}")
            if reference_image_url:
                print(f"Using reference image: {reference_image_url}")
            
            result = fal_client.subscribe(
                "fal-ai/stable-diffusion-v15",
                arguments=arguments,
                with_logs=True
            )
            
            if isinstance(result, dict) and 'images' in result:
                return {
                    'generated_images': [img['url'] for img in result['images']],
                    'prompt': prompt,
                    'style_used': style,
                    'reference_image_used': bool(reference_image_url)
                }
            else:
                raise ValueError("Invalid response format from Fal.ai")

        except Exception as e:
            print(f"Error generating images: {str(e)}")
            raise