import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarDays, Save, Instagram, Mail, Facebook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [localCampaign, setLocalCampaign] = useState<Campaign>(campaign);

  const queryClient = useQueryClient();

  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM dd, yyyy");
  };

  useEffect(() => {
    setLocalCampaign(campaign);
  }, [campaign]);

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

  const renderPlatformPreview = () => {
    const commonImageClasses = "w-full h-auto rounded-lg";

    switch (campaign.platforms?.[0]) {
      case "instagram":
        return (
          <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="font-semibold">Your Business Name</div>
              </div>
            </div>
            <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-4">
                  <Instagram className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm mb-2">{campaign.caption}</p>
              <div className="text-blue-500 text-sm">
                {campaign.hashtags?.map((tag) => `#${tag} `)}
              </div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden border p-8">
            <div className="space-y-6">
              <div className="text-2xl font-bold">{campaign.title}</div>
              <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
              <div className="prose">
                <p>{campaign.caption}</p>
              </div>
              <div className="mt-4 text-center">
                <button className="bg-blue-500 text-white px-6 py-2 rounded">
                  Call to Action
                </button>
              </div>
            </div>
          </div>
        );

      case "facebook":
        return (
          <div className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden border">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="font-semibold">Your Business Name</div>
                  <div className="text-xs text-gray-500">Sponsored</div>
                </div>
              </div>
            </div>
            <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
            <div className="p-4">
              <p className="text-sm mb-2">{campaign.caption}</p>
              <div className="mt-2 flex space-x-4 text-gray-500">
                <Facebook className="h-5 w-5" />
                <span>Like</span>
                <span>Comment</span>
                <span>Share</span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            No preview available for this platform
          </div>
        );
    }
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
                      <Select 
                        value={editedCampaign.target_audience || ''} 
                        onValueChange={(value) => setEditedCampaign(prev => ({ ...prev, target_audience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurants">Restaurant Owners</SelectItem>
                          <SelectItem value="caterers">Catering Services</SelectItem>
                          <SelectItem value="hotels">Hotels</SelectItem>
                          <SelectItem value="event-planners">Event Planners</SelectItem>
                        </SelectContent>
                      </Select>
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
                          setEditedCampaign(localCampaign);
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
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            {renderPlatformPreview()}
          </TabsContent>
        </Tabs>
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
