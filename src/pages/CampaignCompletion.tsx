
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LocationState {
  campaign: {
    media_url: string;
    caption: string;
    hashtags: string[];
    title: string;
    description: string;
    cadence: string;
    target_audience: string;
    platforms: string[];
  };
}

const CampaignCompletion = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Only redirect if accessed directly without state
  useEffect(() => {
    if (!location.state) {
      navigate('/create-campaign');
      return;
    }
  }, [location.state, navigate]);
  
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: randomInRange(60, 120),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 },
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // If no state, return null (this will only show briefly before redirect)
  if (!state?.campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-primary mb-4">
          Campaign has been posted! 🎉
        </h1>
        <p className="text-gray-600 text-lg">
          Your campaign is now live and ready to engage with your audience
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-2xl font-semibold">
            {state.campaign.title}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={state.campaign.media_url}
                alt="Campaign media"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">{state.campaign.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Campaign Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Cadence</dt>
                    <dd className="text-gray-900 capitalize">{state.campaign.cadence}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Target Audience</dt>
                    <dd className="text-gray-900 capitalize">
                      {state.campaign.target_audience.replace('-', ' ')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Caption</h3>
                <p className="text-gray-700">{state.campaign.caption}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {state.campaign.platforms.map((platform, index) => (
                    <span
                      key={index}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm capitalize"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Hashtags</h3>
                <div className="flex flex-wrap gap-2">
                  {state.campaign.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button 
            onClick={() => navigate('/create-campaign')}
            className="bg-primary hover:bg-primary/90"
          >
            Create Another Campaign
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CampaignCompletion;
