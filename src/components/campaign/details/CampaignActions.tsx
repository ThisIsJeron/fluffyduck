
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
      const responseText = await response.text();
      
      console.log('Response status:', response.status);
      console.log('Response body:', responseText);
      
      if (response.status >= 200 && response.status < 300) {
        console.log('Request successful');
        
        toast({
          title: "Success",
          description: "Campaign posted successfully"
        });

        if (onPost) onPost();
      } else {
        // Try to parse the error response as JSON
        let errorMessage = "Unknown error occurred";
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.error || errorJson.message || errorJson.detail || JSON.stringify(errorJson);
        } catch {
          // If not JSON, use the raw text
          errorMessage = responseText;
        }

        console.error('Request failed:', {
          status: response.status,
          error: errorMessage
        });

        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to post campaign: ${errorMessage}`
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Unexpected error during posting:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to post campaign: ${errorMessage}`
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
