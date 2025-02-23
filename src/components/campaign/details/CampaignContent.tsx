
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { CampaignHeader } from "./CampaignHeader";
import { CampaignActions } from "./CampaignActions";
import { CampaignEditForm } from "../form/CampaignEditForm";

interface CampaignContentProps {
  campaign: Campaign;
  localCampaign: Campaign;
  editedCampaign: Campaign;
  isEditing: boolean;
  isSaving: boolean;
  isPosting: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onSave: () => Promise<void>;
  onCancel: () => Promise<void>;
  onEditCancel: () => void;
  onEditChange: (field: string, value: string) => void;
  onPost: () => Promise<void>;
}

export function CampaignContent({
  campaign,
  localCampaign,
  editedCampaign,
  isEditing,
  isSaving,
  isPosting,
  isDeleting,
  onEdit,
  onSave,
  onCancel,
  onEditCancel,
  onEditChange,
  onPost,
}: CampaignContentProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="relative aspect-video">
        <img
          src={localCampaign.media_url}
          alt={localCampaign.title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      
      <div className="space-y-4">
        {isEditing ? (
          <CampaignEditForm
            campaign={editedCampaign}
            onSave={onSave}
            onCancel={onEditCancel}
            onChange={onEditChange}
            isSaving={isSaving}
          />
        ) : (
          <>
            <CampaignHeader campaign={campaign} />
            <CampaignActions
              onEdit={onEdit}
              onPost={onPost}
              isPosting={isPosting}
            />
          </>
        )}

        <Button
          variant="destructive"
          className="w-full mt-4"
          onClick={onCancel}
          disabled={isDeleting}
        >
          {isDeleting ? "Cancelling..." : "Cancel Campaign"}
        </Button>
      </div>
    </div>
  );
}
