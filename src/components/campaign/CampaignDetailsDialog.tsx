
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Campaign } from "@/types/campaign";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlatformPreview } from "./previews/PlatformPreview";
import { CampaignMetrics } from "./metrics/CampaignMetrics";
import { CampaignContent } from "./details/CampaignContent";

interface CampaignDetailsDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}

const mockTimeData = {
  day: [
    { time: "00:00", views: 120, likes: 45, comments: 12 },
    { time: "06:00", views: 240, likes: 90, comments: 24 },
    { time: "12:00", views: 580, likes: 210, comments: 56 },
    { time: "18:00", views: 890, likes: 320, comments: 89 },
    { time: "23:59", views: 1200, likes: 450, comments: 120 },
  ],
  week: [
    { time: "Mon", views: 1200, likes: 450, comments: 120 },
    { time: "Tue", views: 2400, likes: 890, comments: 240 },
    { time: "Wed", views: 5800, likes: 2100, comments: 560 },
    { time: "Thu", views: 8900, views: 3200, comments: 890 },
    { time: "Fri", views: 12000, likes: 4500, comments: 1200 },
    { time: "Sat", views: 15000, likes: 5600, comments: 1500 },
    { time: "Sun", views: 18000, likes: 6700, comments: 1800 },
  ],
};

export function CampaignDetailsDialog({ campaign, open, onOpenChange, onDelete }: CampaignDetailsDialogProps) {
  const [timeScale, setTimeScale] = useState<"day" | "week">("day");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign>(campaign);
  const [localCampaign, setLocalCampaign] = useState<Campaign>(campaign);

  const queryClient = useQueryClient();

  useEffect(() => {
    setLocalCampaign(campaign);
  }, [campaign]);

  const handleManualPost = async () => {
    try {
      setIsPosting(true);
      console.log('Triggering manual post for campaign:', campaign.id);
      
      const { data, error } = await supabase.functions.invoke('process-campaigns', {
        body: { campaignId: campaign.id }
      });

      if (error) {
        console.error('Error posting campaign:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to post campaign"
        });
        return;
      }

      console.log('Campaign posted successfully:', data);
      toast({
        title: "Success",
        description: "Campaign posted successfully"
      });

    } catch (error) {
      console.error('Unexpected error during posting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving campaign updates:', editedCampaign);

      const { error } = await supabase
        .from('campaigns')
        .update({
          title: editedCampaign.title,
          description: editedCampaign.description,
          target_audience: editedCampaign.target_audience,
          caption: editedCampaign.caption,
          hashtags: editedCampaign.hashtags,
        })
        .eq('id', campaign.id);

      if (error) {
        console.error('Error updating campaign:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Campaign updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    if (isDeleting) return;
    
    try {
      setIsDeleting(true);
      console.log('Moving campaign to past campaigns:', campaign.id);
      
      const { error } = await supabase
        .from('campaigns')
        .update({ end_date: new Date().toISOString() })
        .eq('id', campaign.id);

      if (error) {
        console.error('Error cancelling campaign:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to cancel campaign"
        });
        return;
      }

      console.log('Campaign successfully cancelled');
      toast({
        title: "Success",
        description: "Campaign cancelled successfully"
      });

      onOpenChange(false);
      await onDelete();
    } catch (error) {
      console.error('Unexpected error during cancellation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditChange = (field: string, value: string) => {
    setEditedCampaign(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Campaign Details</TabsTrigger>
            <TabsTrigger value="preview">Platform Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <CampaignContent
              campaign={campaign}
              localCampaign={localCampaign}
              editedCampaign={editedCampaign}
              isEditing={isEditing}
              isSaving={isSaving}
              isPosting={isPosting}
              isDeleting={isDeleting}
              onEdit={() => setIsEditing(true)}
              onSave={handleSave}
              onCancel={handleCancel}
              onEditCancel={() => {
                setEditedCampaign(localCampaign);
                setIsEditing(false);
              }}
              onEditChange={handleEditChange}
              onPost={handleManualPost}
            />
            
            <CampaignMetrics
              timeScale={timeScale}
              setTimeScale={setTimeScale}
              data={mockTimeData[timeScale]}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <PlatformPreview campaign={campaign} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
