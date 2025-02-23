
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";

interface CampaignActionsProps {
  campaign: Campaign;
  onEdit: () => void;
  onPost: () => void;
  isPosting: boolean;
}

export function CampaignActions({ campaign, onEdit, onPost, isPosting }: CampaignActionsProps) {
  const { toast } = useToast();

  const handlePost = async () => {
    try {
      console.log('Posting campaign:', campaign);
      
      const { data, error } = await supabase.functions.invoke('execute-campaign', {
        body: { 
          campaign: {
            title: campaign.title,
            caption: campaign.caption
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        const errorMessage = error.message || 'Failed to post campaign';
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
        return;
      }

      if (!data?.success) {
        console.error('Campaign posting failed:', data?.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: data?.error || "Failed to post campaign"
        });
        return;
      }

      console.log('Campaign posted successfully:', data);
      toast({
        title: "Success",
        description: "Campaign posted successfully"
      });

      // Call the onPost callback to update the UI
      onPost();
    } catch (error) {
      console.error('Unexpected error during posting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while posting the campaign"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onEdit}
      >
        Edit Campaign
      </Button>
      <Button
        onClick={handlePost}
        disabled={isPosting}
      >
        <Send className="h-4 w-4" />
        {isPosting ? "Processing..." : "Manual Post"}
      </Button>
    </div>
  );
}
