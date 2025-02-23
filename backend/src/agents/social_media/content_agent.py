from typing import Dict, List
from ...services.fal_service import FalImageGenerator
from ...services.elevenlabs_service import ElevenLabsService
from ...database.operations.social_media_ops import SocialMediaDB

class ContentAgent:
    def __init__(self):
        self.fal_generator = FalImageGenerator()
        self.audio_service = ElevenLabsService()
        self.db = SocialMediaDB()

    async def analyze_campaign_requirements(self, campaign_data: Dict) -> Dict:
        """Analyze campaign data and decide content strategy"""
        content_decisions = {
            'needs_image': True,  # Always true for Instagram
            'needs_audio': False,
            'content_type': 'image',
            'style_preferences': []
        }

        # Determine if we need audio (for reels/videos)
        if 'reel' in campaign_data.get('description', '').lower():
            content_decisions['needs_audio'] = True
            content_decisions['content_type'] = 'reel'

        # Analyze target audience for style preferences
        audience = campaign_data.get('target_audience', '').lower()
        if 'restaurant' in audience:
            content_decisions['style_preferences'].extend([
                'food photography',
                'culinary atmosphere',
                'professional lighting'
            ])

        return content_decisions

    async def generate_content(self, campaign_id: str) -> Dict:
        """Generate content based on campaign requirements"""
        try:
            # Get campaign data
            campaign = await self.db.get_campaign(campaign_id)
            
            # Analyze requirements
            requirements = await self.analyze_campaign_requirements(campaign)
            
            # Generate image
            image_url = await self.fal_generator.generate_marketing_image(
                title=campaign['title'],
                description=campaign['description'],
                target_audience=campaign['target_audience'],
                style_preferences=requirements['style_preferences']
            )

            result = {'image_url': image_url}

            # Generate audio if needed
            if requirements['needs_audio']:
                audio_url = await self.audio_service.generate_audio(
                    text=campaign['description'],
                    voice_style='professional'
                )
                result['audio_url'] = audio_url

            return result

        except Exception as e:
            print(f"Error generating content: {str(e)}")
            raise