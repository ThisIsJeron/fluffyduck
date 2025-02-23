from typing import Dict
from supabase import create_client
import os
from dotenv import load_dotenv

# Remove this line as it's causing the circular import:
# from ..services.storage_service import StorageService

load_dotenv()

class StorageService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Missing Supabase credentials")
            
        self.client = create_client(supabase_url, supabase_key)

    async def upload_reference_image(self, file) -> str:
        """Upload reference image and return URL"""
        try:
            # Upload to Supabase storage
            result = await self.client.storage.from_('campaign-images').upload(
                file.filename,
                file.file.read()
            )
            return result['Key']  # Return the URL
        except Exception as e:
            print(f"Error uploading image: {str(e)}")
            raise

    async def save_campaign(self, campaign_data: Dict, image_url: str) -> Dict:
        try:
            result = (
                self.client
                .table('campaigns')
                .insert({
                    **campaign_data,
                    'media_url': image_url,
                    'status': 'active'
                })
                .execute()
            )
            
            return result.data[0]

        except Exception as e:
            print(f"Error saving campaign: {str(e)}")
            raise