import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  media_url: string;
  caption: string;
  hashtags: string[];
  title: string;
  description: string;
  cadence: string;
  target_audience: string;
  platforms: string[];
}

const CampaignCompletion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("Campaign ID from URL:", id);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) {
        console.error("No campaign ID in URL");
        toast.error("Campaign ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching campaign with ID:", id);
        
        const { data, error } = await supabase
          .from('campaigns')
          .select()
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        if (data) {
          console.log("Campaign data retrieved:", data);
          setCampaign(data);
        } else {
          console.error("No campaign found with ID:", id);
          toast.error("Campaign not found in database");
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        toast.error("Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    if (!campaign) return;

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
  }, [campaign]);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary p-6 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading campaign details...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-secondary p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Campaign Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the campaign details. Would you like to view all campaigns?
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-primary hover:bg-primary/90"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card>
            <CardHeader>
              <h1 className="text-2xl font-bold mb-2">Campaign Created Successfully! 🎉</h1>
              <p className="text-gray-600">Your campaign has been created and is ready to be published.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <img
                  src={campaign.media_url}
                  alt="Campaign Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <h2 className="font-semibold mb-2">{campaign.title}</h2>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
            </CardContent>
            <div className="p-6 flex justify-center">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-accent hover:bg-accent/90 text-white px-8"
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CampaignCompletion;
