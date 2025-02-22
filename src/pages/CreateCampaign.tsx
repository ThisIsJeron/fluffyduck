
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Users, Calendar, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UploadedFile extends File {
  preview: string;
}

interface Campaign {
  id: string;
  media_url: string;
  caption: string;
  hashtags: string[];
  selected: boolean;
}

const CreateCampaign = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Upload file to Supabase Storage
      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload at least one image",
          variant: "destructive",
        });
        return;
      }

      const file = uploadedFiles[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('campaign_media')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('campaign_media')
        .getPublicUrl(filePath);

      // Generate mock campaigns (in a real app, this would come from an AI service)
      const mockCampaigns: Campaign[] = [
        {
          id: crypto.randomUUID(),
          media_url: publicUrl,
          caption: "Elevate your events with our premium catering service! 🍽️✨",
          hashtags: ["CateringExcellence", "PremiumDining", "EventPlanning"],
          selected: false
        },
        {
          id: crypto.randomUUID(),
          media_url: publicUrl,
          caption: "Create unforgettable moments with exceptional cuisine 🎉",
          hashtags: ["LuxuryCatering", "EventCatering", "FineFood"],
          selected: false
        },
        {
          id: crypto.randomUUID(),
          media_url: publicUrl,
          caption: "Transform your special day with our exquisite catering 🌟",
          hashtags: ["GourmetCatering", "SpecialEvents", "CulinaryArt"],
          selected: false
        }
      ];

      setCampaigns(mockCampaigns);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate campaigns",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      // Insert the selected campaign into Supabase
      const { error } = await supabase
        .from('campaigns')
        .insert({
          media_url: selectedCampaign.media_url,
          caption: selectedCampaign.caption,
          hashtags: selectedCampaign.hashtags,
          selected: true,
          title: "Generated Campaign", // Required field
        });

      if (error) throw error;

      // Navigate to completion page
      navigate('/campaign-completion', {
        state: { campaign: selectedCampaign }
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to save campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8">Create Campaign</h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Media Upload */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Campaign Media</h2>
                
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-gray-600">
                      Drop your media files here or{" "}
                      <span className="text-accent font-medium">browse</span>
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      Support for images and videos
                    </span>
                  </label>
                </div>

                {/* Preview Grid */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={file.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Campaign Settings */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Campaign Name</Label>
                    <Input id="campaign-name" placeholder="Enter campaign name" />
                  </div>

                  <div>
                    <Label>Campaign Cadence</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Target Audience</Label>
                    <Select>
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

                  <div>
                    <Label>Platforms</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platforms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="campaign-description">Campaign Description</Label>
                    <Textarea
                      id="campaign-description"
                      placeholder="Enter campaign description"
                      className="h-32"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-xl"
            >
              {isGenerating ? "Generating Campaign..." : "Generate Campaign"}
            </Button>
          </div>

          {/* Generated Campaigns */}
          {campaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold mb-6">Generated Campaigns</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <img
                        src={campaign.media_url}
                        alt="Campaign"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                      <p className="text-gray-700 mb-3">{campaign.caption}</p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleSelect(campaign)}
                        className="w-full bg-green-500 hover:bg-green-600"
                      >
                        Select
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;
