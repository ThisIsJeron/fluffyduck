
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CampaignActionsProps {
  onEdit: () => void;
  onPost: () => void;
  isPosting: boolean;
}

export function CampaignActions({ onEdit, onPost, isPosting }: CampaignActionsProps) {
  const { toast } = useToast();

  const handlePost = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('execute-campaign', {
        body: {
          campaign: {
            title: "Your campaign title",  // You'll need to pass this from props
            caption: "Your campaign caption" // You'll need to pass this from props
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Campaign posted successfully via Pica"
      });
    } catch (error) {
      console.error('Post error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post campaign. Check console for details."
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
