
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      const content = `
Title: ${campaign.title}
Description: ${campaign.description || ''}
Target Audience: ${campaign.target_audience || ''}
Caption: ${campaign.caption || ''}
Image URL: ${campaign.media_url || ''}
${campaign.hashtags?.length ? 'Hashtags: ' + campaign.hashtags.join(' ') : ''}`.trim();

      const url = `https://53b2-12-206-80-188.ngrok-free.app/generate?message=${encodeURIComponent(`Send email to fluffyduck0222@gmail.com via gmail with content "${content}"`)}`;
      
      console.log('Making GET request to:', url);
      await fetch(url, { 
        mode: 'no-cors',
        method: 'GET'
      });

      toast({
        title: "Request sent",
        description: "Email request has been sent"
      });
      if (onPost) onPost();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send email request"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onEdit}>
        Edit Campaign
      </Button>
      <Button onClick={handlePost} disabled={isPosting}>
        <Send className="h-4 w-4" />
        {isPosting ? "Processing..." : "Manual Post"}
      </Button>
    </div>
  );
}
