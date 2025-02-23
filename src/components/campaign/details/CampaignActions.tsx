
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface CampaignActionsProps {
  onEdit: () => void;
  onPost: () => void;
  isPosting: boolean;
}

export function CampaignActions({ onEdit, onPost, isPosting }: CampaignActionsProps) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={onEdit}
      >
        Edit Campaign
      </Button>
      <Button
        onClick={onPost}
        disabled={isPosting}
      >
        <Send className="h-4 w-4" />
        {isPosting ? "Posting..." : "Manual Post"}
      </Button>
    </div>
  );
}
