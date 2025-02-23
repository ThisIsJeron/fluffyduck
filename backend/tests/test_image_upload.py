import pytest
import sys
import os
from typing import Dict
from dotenv import load_dotenv

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

from fluffyduck.backend.src.services.storage_service import CampaignService
from src.database.operations.social_media_ops import SocialMediaOps

@pytest.mark.asyncio
async def test_campaign_generation():
    try:
        # Create test campaign data
        campaign_data = {
            'title': 'Test Marketing Campaign',
            'description': 'A professional marketing campaign for social media',
            'target_audience': 'Digital Marketers and Professionals',
            'media_url': None,
            'caption': 'Test marketing post',
            'hashtags': ['marketing', 'professional'],
            'platforms': ['Instagram'],
            'selected': False
        }

        # Initialize services
        social_media_ops = SocialMediaOps()
        campaign_service = CampaignService()
        
        print("\nStarting campaign generation test...")
        
        # Create campaign
        campaign = await social_media_ops.create_campaign(campaign_data)
        assert campaign is not None
        print(f"\n✅ Campaign created: {campaign['id']}")
        
        # Generate content
        result = await campaign_service.generate_campaign_content()
        assert result is not None
        print(f"\n✅ Content generated: {result['generated_image']}")
        
        return result

    except Exception as e:
        print(f"\n❌ Error in campaign generation: {str(e)}")
        raise

if __name__ == "__main__":
    pytest.main(["-v", "-s", __file__])