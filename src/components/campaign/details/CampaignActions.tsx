
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
      console.log('Posting campaign:', campaign);
      
      // Construct the message using campaign data
      const emailContent = `Title: ${campaign.title}\n\n${campaign.caption}`;
      const baseMessage = "Send email to fluffyduck0222@gmail.com via gmail";
      const fullMessage = `${baseMessage} with content "${emailContent}"`;
      
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(fullMessage);
      const url = `https://4b1d-12-206-80-188.ngrok-free.app/generate?message=${encodedMessage}`;
      
      console.log('Sending GET request to:', url);
      
      const response = await fetch(url);
      
      // Since we don't know if the response will always be JSON,
      // let's consider any 2xx status code as success
      if (response.status >= 200 && response.status < 300) {
        console.log('Request successful:', response.status);
        
        toast({
          title: "Success",
          description: "Campaign posted successfully"
        });

        // Call the onPost callback to update the UI
        if (onPost) onPost();
      } else {
        const errorText = await response.text();
        console.error('Request failed:', response.status, errorText);
        throw new Error(`Request failed with status ${response.status}`);
      }
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
