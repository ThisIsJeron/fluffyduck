import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

import asyncio
from src.database.operations.social_media_ops import CampaignDB

async def test_campaign_operations():
    db = CampaignDB()
    
    try:
        # Test creating a campaign
        test_campaign = {
            "title": "Hello World",
            "description": "This is a test campaign",
            "media_url": "https://example.com/test.jpg",
            "caption": "Test caption",
            "hashtags": ["test", "demo"],
            "cadence": "Weekly",
            "target_audience": "developers",
            "platforms": ["instagram"],
            "selected": True
        }
        
        print("Creating test campaign...")
        created = await db.create_campaign(**test_campaign)
        print(f"Created campaign: {created}")
        
    except Exception as e:
        print(f"Error during test: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_campaign_operations())