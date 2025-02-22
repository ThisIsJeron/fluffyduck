from ...database.supabase import get_supabase_client
from typing import Dict, List

class CampaignDB:
    def __init__(self):
        self.client = get_supabase_client()

    async def create_campaign(
        self,
        title: str,
        description: str,
        media_url: str,
        caption: str,
        hashtags: List[str],
        cadence: str,
        target_audience: str,
        platforms: List[str],
        selected: bool = False
    ):
        campaign_data = {
            "title": title,
            "description": description,
            "media_url": media_url,
            "caption": caption,
            "hashtags": hashtags,
            "cadence": cadence,
            "target_audience": target_audience,
            "platforms": platforms,
            "selected": selected
        }
        
        result = self.client.table("campaigns").insert(campaign_data).execute()
        return result.data[0] if result.data else None