from datetime import datetime, timedelta
from typing import Dict, List
import pytz
from ...database.operations.social_media_ops import SocialMediaDB

class SchedulingAgent:
    def __init__(self):
        self.db = SocialMediaDB()

    async def determine_optimal_posting_time(
        self,
        campaign_data: Dict,
        timezone: str = 'UTC'
    ) -> datetime:
        """Determine the best time to post based on campaign data"""
        tz = pytz.timezone(timezone)
        now = datetime.now(tz)
        
        # Basic posting time rules
        best_hours = {
            'restaurant': [11, 12, 17, 18],  # Lunch and dinner times
            'retail': [10, 14, 16],          # Shopping hours
            'default': [12, 15, 18]          # General engagement times
        }

        # Get target audience type
        audience = campaign_data.get('target_audience', '').lower()
        posting_hours = best_hours.get(
            next(
                (k for k in best_hours.keys() if k in audience),
                'default'
            )
        )

        # Find next available posting time
        next_time = now
        while True:
            if next_time.hour in posting_hours:
                return next_time
            next_time += timedelta(hours=1)

    async def create_posting_schedule(
        self,
        campaign_id: str,
        timezone: str = 'UTC'
    ) -> Dict:
        """Create a posting schedule for the campaign"""
        try:
            campaign = await self.db.get_campaign(campaign_id)
            
            # Determine posting time
            posting_time = await self.determine_optimal_posting_time(
                campaign,
                timezone
            )

            # Update campaign with scheduled time
            await self.db.update_campaign_schedule(
                campaign_id,
                posting_time
            )

            return {
                'campaign_id': campaign_id,
                'scheduled_time': posting_time,
                'timezone': timezone
            }

        except Exception as e:
            print(f"Error creating posting schedule: {str(e)}")
            raise