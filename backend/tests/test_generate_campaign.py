
import pytest
from httpx import AsyncClient
from ..src.api.main import app
import os
from pathlib import Path
import base64

TEST_IMAGE_PATH = Path(__file__).parent / "test_data" / "test_image.jpg"

@pytest.fixture
def test_image():
    """Create a test image file for testing."""
    # Create test_data directory if it doesn't exist
    os.makedirs(Path(__file__).parent / "test_data", exist_ok=True)
    
    # Create a small test image if it doesn't exist
    if not TEST_IMAGE_PATH.exists():
        # Create a 1x1 black JPEG image
        with open(TEST_IMAGE_PATH, "wb") as f:
            f.write(base64.b64decode(
                "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            ))
    
    return TEST_IMAGE_PATH

@pytest.mark.asyncio
async def test_generate_campaign_endpoint(test_image):
    """Test the generate campaign endpoint with a test image."""
    # Create test data
    with open(test_image, "rb") as f:
        image_data = f.read()

    # Create form data
    files = {
        'reference_image': ('test_image.jpg', image_data, 'image/jpeg')
    }
    data = {
        'campaign': '{"name": "Test Campaign", "description": "Test description", "target_audience": "Test audience", "cadence": "weekly", "platforms": ["facebook"]}'
    }

    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/generate-campaign",
            files=files,
            data=data
        )
        
        print("Response status:", response.status_code)
        print("Response body:", response.text)
        
        # Assert response
        assert response.status_code == 200
        response_data = response.json()
        assert "generated_images" in response_data
        assert isinstance(response_data["generated_images"], list)
        assert len(response_data["generated_images"]) > 0

@pytest.mark.asyncio
async def test_generate_campaign_validation():
    """Test input validation for the generate campaign endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Test missing image
        response = await client.post(
            "/api/generate-campaign",
            data={
                'campaign': '{"name": "Test", "description": "Test", "target_audience": "Test", "cadence": "weekly", "platforms": ["facebook"]}'
            }
        )
        assert response.status_code == 400
        assert "reference_image" in response.text.lower()

        # Test invalid campaign data
        response = await client.post(
            "/api/generate-campaign",
            data={
                'campaign': '{"name": ""}'  # Missing required fields
            }
        )
        assert response.status_code == 400
        assert "validation error" in response.text.lower()

if __name__ == "__main__":
    pytest.main(["-v", __file__])
