import pytest
import pytest_asyncio
import sys
import os
from typing import Dict, Optional
from dotenv import load_dotenv

# Add the parent directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

from fluffyduck.backend.src.services.storage_service import CampaignService
from src.database.operations.social_media_ops import SocialMediaOps

# Mark all tests in this module as asyncio tests
pytestmark = pytest.mark.asyncio

@pytest_asyncio.fixture
async def social_media_ops():
    """Fixture for social media operations"""
    return SocialMediaOps()

@pytest_asyncio.fixture
async def campaign_service():
    """Fixture for campaign service"""
    return CampaignService()

@pytest.mark.asyncio
async def test_database_connection(social_media_ops: SocialMediaOps):
    """Test database connection and campaign retrieval"""
    try:
        campaign = await social_media_ops.get_latest_campaign()
        print("\n✅ Database connection successful")
        if campaign:
            print(f"Found campaign: {campaign['title']}")
        else:
            print("No unprocessed campaigns found")
        assert True
    except Exception as e:
        print(f"\n❌ Database connection failed: {str(e)}")
        assert False

@pytest.mark.asyncio
async def test_campaign_generation(campaign_service: CampaignService):
    """Test the complete campaign generation flow"""
    try:
        print("\n🔍 Fetching latest unprocessed campaign...")
        result = await campaign_service.generate_campaign_content()
        
        if result:
            assert_campaign_result(result)
            print_success_result(result)
        else:
            print("\n⚠️ No unprocessed campaigns found in database")
            assert True  # Still pass the test if no campaigns found
            
    except Exception as e:
        print(f"\n❌ Error during campaign generation test: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_create_test_campaign(social_media_ops: SocialMediaOps):
    """Test creating a new campaign"""
    try:
        campaign_data = {
            'title': 'Test Marketing Campaign',
            'description': 'A test campaign for social media',
            'target_audience': 'Digital Marketers',
            'media_url': None,
            'caption': 'Test caption',
            'hashtags': ['test', 'marketing'],
            'cadence': 'weekly',
            'platforms': ['Instagram'],
            'selected': False
        }
        
        result = await social_media_ops.create_campaign(campaign_data)
        assert result is not None
        print("\n✅ Test campaign created successfully")
        print(f"Campaign ID: {result['id']}")
        return result
    except Exception as e:
        print(f"\n❌ Error creating test campaign: {str(e)}")
        raise

def assert_campaign_result(result: Dict):
    """Verify the campaign generation result"""
    assert result is not None, "Result should not be None"
    assert 'campaign' in result, "Result should contain campaign data"
    assert 'generated_image' in result, "Result should contain generated image URL"
    
    campaign = result['campaign']
    assert campaign['id'] is not None, "Campaign should have an ID"
    assert campaign['title'] is not None, "Campaign should have a title"
    assert campaign['selected'] is True, "Campaign should be marked as processed"
    assert campaign['media_url'] is not None, "Campaign should have a media URL"

def print_success_result(result: Dict):
    """Print the successful campaign generation results"""
    print("\n✅ Campaign Generation Successful!")
    print("\nCampaign Details:")
    print(f"  • ID: {result['campaign']['id']}")
    print(f"  • Title: {result['campaign']['title']}")
    print(f"  • Description: {result['campaign'].get('description', 'N/A')}")
    print(f"  • Target Audience: {result['campaign'].get('target_audience', 'N/A')}")
    print("\nGenerated Content:")
    print(f"  • Image URL: {result['generated_image']}")
    print("\n✅ Campaign has been updated in database")

@pytest.mark.asyncio
async def test_full_campaign_flow(social_media_ops: SocialMediaOps, campaign_service: CampaignService):
    """Test the complete flow from creation to generation"""
    try:
        # First create a test campaign
        campaign = await test_create_test_campaign(social_media_ops)
        assert campaign is not None
        
        # Then generate content for it
        result = await campaign_service.generate_campaign_content()
        assert result is not None
        
        print_success_result(result)
        return result
        
    except Exception as e:
        print(f"\n❌ Error in full campaign flow: {str(e)}")
        raise

@pytest.mark.asyncio
async def test_cleanup(social_media_ops: SocialMediaOps):
    """Clean up test campaigns after tests"""
    try:
        # Get all test campaigns
        result = await social_media_ops.get_test_campaigns()
        
        if result:
            # Delete test campaigns
            await social_media_ops.delete_test_campaigns([c['id'] for c in result])
            print("\n✅ Test campaigns cleaned up successfully")
        else:
            print("\n✅ No test campaigns to clean up")
            
    except Exception as e:
        print(f"\n❌ Error cleaning up test campaigns: {str(e)}")
        raise

if __name__ == "__main__":
    # Run all tests
    pytest.main([__file__, "-v"])