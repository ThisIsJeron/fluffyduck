import os
import pytest
from dotenv import load_dotenv
import fal_client

# Load environment variables
load_dotenv()

@pytest.mark.asyncio
async def test_fal_image_generation():
    """Test generating an image using fal.ai"""
    try:
        print("\n" + "="*50)
        print("Starting image generation test...")
        
        # Set up the parameters for image generation
        arguments = {
            "prompt": "A cute fluffy duck",
            "negative_prompt": "text overlay, watermark, low quality, logo",
            "image_size": "square_hd",
            "num_inference_steps": 25,
            "guidance_scale": 7.5,
            "num_images": 1,
            "format": "jpeg"
        }

        print("\n🎨 Generating test image with prompt:", arguments['prompt'])
        
        # Generate the image
        result = fal_client.subscribe(
            "fal-ai/stable-diffusion-v15",
            arguments=arguments,
            with_logs=True
        )

        # Check and print the result
        if isinstance(result, dict) and 'images' in result and len(result['images']) > 0:
            image_url = result['images'][0]['url']
            print("\n✅ Image generated successfully!")
            print("\n📸 Image URL:")
            print("-" * 50)
            print(image_url)
            print("-" * 50)
            print("\nYou can open this URL in your browser to see the image")
            assert image_url.startswith('http'), "Invalid image URL format"
        else:
            print("\n❌ Failed to generate image")
            print(f"Unexpected result format: {result}")
            assert False, "Image generation failed"

    except Exception as e:
        print(f"\n❌ Error during image generation: {str(e)}")
        raise

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])  # Added -s to show print statements