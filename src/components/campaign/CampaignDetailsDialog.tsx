
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CampaignDetailsDialogProps {
  campaign: Campaign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
}

export function CampaignDetailsDialog({ campaign, open, onOpenChange, onDelete }: CampaignDetailsDialogProps) {
  const [timeScale, setTimeScale] = useState<"day" | "week">("day");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Campaign>(campaign);

  const queryClient = useQueryClient();

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM dd, yyyy");
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

      // Refresh the campaigns data
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

  const renderMetrics = () => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <span>2.1k likes</span>
      </div>
      <div className="flex items-center gap-1">
        <span>32 comments</span>
      </div>
      <div className="flex items-center gap-1">
        <span>12.3k views</span>
      </div>
    </div>
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="relative aspect-video">
            <img
              src={campaign.media_url}
              alt={campaign.title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editedCampaign.title}
                    onChange={(e) => setEditedCampaign(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editedCampaign.description || ''}
                    onChange={(e) => setEditedCampaign(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_audience">Target Audience</Label>
                  <Input
                    id="target_audience"
                    value={editedCampaign.target_audience || ''}
                    onChange={(e) => setEditedCampaign(prev => ({ ...prev, target_audience: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Textarea
                    id="caption"
                    value={editedCampaign.caption || ''}
                    onChange={(e) => setEditedCampaign(prev => ({ ...prev, caption: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditedCampaign(campaign);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{campaign.title}</h2>
                <p className="text-gray-600">{campaign.description}</p>
                
                <div className="space-y-3">
                  <h3 className="font-semibold">Campaign Details</h3>
                  <div className="bg-accent/5 p-3 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                      <CalendarDays className="h-4 w-4" />
                      <span className="font-medium">Campaign Duration</span>
                    </div>
                    <p className="text-sm">
                      Start Date: <span className="font-medium">{formatDate(campaign.start_date)}</span>
                    </p>
                    <p className="text-sm">
                      End Date: <span className="font-medium">{formatDate(campaign.end_date)}</span>
                    </p>
                  </div>
                  <p><span className="font-medium">Target Audience:</span> {campaign.target_audience}</p>
                  <p><span className="font-medium">Platforms:</span> {campaign.platforms?.join(", ")}</p>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="mt-4"
                  >
                    Edit Campaign
                  </Button>
                </div>
              </>
            )}

            <Button
              variant="destructive"
              className="w-full mt-4"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              {isDeleting ? "Cancelling..." : "Cancel Campaign"}
            </Button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Performance Metrics</h3>
            <div className="space-x-2">
              <Button
                variant={timeScale === "day" ? "default" : "outline"}
                onClick={() => setTimeScale("day")}
              >
                1 Day
              </Button>
              <Button
                variant={timeScale === "week" ? "default" : "outline"}
                onClick={() => setTimeScale("week")}
              >
                1 Week
              </Button>
            </div>
          </div>
          
          <div className="w-full h-[250px]">
            <ResponsiveContainer>
              <LineChart data={mockTimeData[timeScale]} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#8884d8" />
                <Line type="monotone" dataKey="likes" stroke="#82ca9d" />
                <Line type="monotone" dataKey="comments" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
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
    { time: "Thu", views: 8900, likes: 3200, comments: 890 },
    { time: "Fri", views: 12000, likes: 4500, comments: 1200 },
    { time: "Sat", views: 15000, likes: 5600, comments: 1500 },
    { time: "Sun", views: 18000, likes: 6700, comments: 1800 },
  ],
};
