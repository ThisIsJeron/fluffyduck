from typing import Dict, List
from datetime import datetime, timedelta
from ...database.operations.social_media_ops import SocialMediaDB

class AnalyticsAgent:
    def __init__(self):
        self.db = SocialMediaDB()

    async def analyze_engagement_metrics(
        self,
        campaign_id: str,
        timeframe_days: int = 7
    ) -> Dict:
        """Analyze engagement metrics for a campaign"""
        try:
            # Get campaign data and metrics
            campaign = await self.db.get_campaign(campaign_id)
            metrics = await self.db.get_campaign_metrics(campaign_id)

            analysis = {
                'engagement_rate': 0,
                'best_performing_hashtags': [],
                'audience_response': 'neutral',
                'recommendations': []
            }

            if metrics:
                # Calculate engagement rate
                total_interactions = (
                    metrics.get('likes', 0) +
                    metrics.get('comments', 0) +
                    metrics.get('shares', 0)
                )
                impressions = metrics.get('impressions', 1)  # Avoid division by zero
                analysis['engagement_rate'] = (total_interactions / impressions) * 100

                # Analyze performance
                if analysis['engagement_rate'] > 5:
                    analysis['audience_response'] = 'positive'
                    analysis['recommendations'].append(
                        "Content is performing well. Consider boosting post reach."
                    )
                elif analysis['engagement_rate'] < 2:
                    analysis['audience_response'] = 'needs_improvement'
                    analysis['recommendations'].append(
                        "Consider adjusting content strategy to improve engagement."
                    )

                # Analyze hashtag performance
                if metrics.get('hashtag_performance'):
                    analysis['best_performing_hashtags'] = sorted(
                        metrics['hashtag_performance'].items(),
                        key=lambda x: x[1],
                        reverse=True
                    )[:3]

            return analysis

        except Exception as e:
            print(f"Error analyzing metrics: {str(e)}")
            raise

    async def generate_recommendations(self, campaign_id: str) -> List[str]:
        """Generate recommendations based on campaign performance"""
        analysis = await self.analyze_engagement_metrics(campaign_id)
        recommendations = []

        if analysis['audience_response'] == 'needs_improvement':
            recommendations.extend([
                "Try posting at different times",
                "Experiment with different content formats",
                "Engage more with audience comments"
            ])

        if analysis['best_performing_hashtags']:
            recommendations.append(
                f"Continue using successful hashtags: {', '.join(analysis['best_performing_hashtags'])}"
            )

        return recommendations