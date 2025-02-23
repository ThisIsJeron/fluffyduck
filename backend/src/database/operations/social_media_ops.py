from typing import Dict, List, Optional
from ..supabase import supabase_client

class SocialMediaOps:
    def __init__(self):
        self.client = supabase_client

    async def create_campaign(self, campaign_data: Dict) -> Dict:
        """Create a new campaign in the database"""
        try:
            result = (
                self.client
                .table('campaigns')
                .insert(campaign_data)
                .execute()
            )
            
            if not result.data:
                raise Exception("Failed to create campaign")
                
            print(f"Created campaign: {result.data[0]}")
            return result.data[0]

        except Exception as e:
            print(f"Error creating campaign: {str(e)}")
            raise

    async def get_latest_campaign(self) -> Optional[Dict]:
        """Get the most recent unprocessed campaign"""
        try:
            result = (
                self.client
                .table('campaigns')
                .select('*')
                .eq('selected', False)  # Get unprocessed campaigns
                .order('created_at', desc=True)  # Get most recent
                .limit(1)
                .execute()
            )
            
            if result.data:
                print(f"Found latest campaign: {result.data[0]}")
                return result.data[0]
            
            print("No unprocessed campaigns found")
            return None

        except Exception as e:
            print(f"Error getting latest campaign: {str(e)}")
            return None

    async def update_campaign_media(
        self,
        campaign_id: str,
        generated_image_url: str
    ) -> Dict:
        """Update campaign with generated image URL"""
        try:
            print(f"\nUpdating campaign {campaign_id} with image: {generated_image_url}")
            
            result = (
                self.client
                .table('campaigns')
                .update({
                    'media_url': generated_image_url,
                    'selected': True
                })
                .eq('id', campaign_id)
                .execute()
            )
            
            if not result.data:
                raise Exception(f"Failed to update campaign {campaign_id}")
            
            print(f"Successfully updated campaign: {result.data[0]}")
            return result.data[0]

        except Exception as e:
            print(f"Error updating campaign: {str(e)}")
            raise