
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface CampaignCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface CampaignCardsProps {
  campaigns: CampaignCard[];
  formData?: any; // This will contain the form data to be saved
}

export const CampaignCards = ({ campaigns, formData }: CampaignCardsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSelect = async (campaign: CampaignCard) => {
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a campaign",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Create the campaign in the selected_campaigns table
      const { data, error } = await supabase
        .from('selected_campaigns')
        .insert([
          {
            title: campaign.title,
            description: campaign.description,
            media_url: campaign.image,
            start_date: formData?.start_date,
            end_date: formData?.end_date,
            platforms: formData?.platforms ? [formData.platforms] : [],
            target_audience: formData?.target_audience,
            cadence: formData?.cadence,
            hashtags: ["#marketing", "#socialmedia", "#campaign"], // Default hashtags
            user_id: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign selected successfully!",
      });

      // Navigate to campaign completion page with the campaign ID as a URL parameter
      navigate(`/campaign-completion/${data.id}`);

    } catch (error) {
      console.error('Error selecting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to select campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (campaigns.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Campaign Variations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="aspect-video relative">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600 mb-4">{campaign.description}</p>
              <Button 
                className="w-full"
                onClick={() => handleSelect(campaign)}
              >
                Select Campaign
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
