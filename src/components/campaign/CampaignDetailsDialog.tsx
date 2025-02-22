
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

interface CampaignDetailsDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailsDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailsDialogProps) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaign.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete campaign"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Campaign deleted successfully"
    });

    queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{campaign.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <img
              src={campaign.media_url}
              alt={campaign.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Description</p>
            <p>{campaign.description}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Campaign Details</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Start Date</p>
                <p>{campaign.start_date ? format(campaign.start_date, 'MMM dd, yyyy') : 'Not set'}</p>
              </div>
              <div>
                <p className="font-medium">End Date</p>
                <p>{campaign.end_date ? format(campaign.end_date, 'MMM dd, yyyy') : 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Platforms</p>
            <div className="flex flex-wrap gap-2">
              {campaign.platforms?.map((platform) => (
                <span
                  key={platform}
                  className="px-2 py-1 bg-secondary rounded-full text-xs"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleDelete}
            >
              Cancel Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
