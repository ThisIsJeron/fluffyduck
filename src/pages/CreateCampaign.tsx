import { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
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
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [cadence, setCadence] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platforms, setPlatforms] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
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

  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      // Insert the selected campaign into Supabase with all required fields
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          media_url: selectedCampaign.media_url,
          caption: selectedCampaign.caption,
          hashtags: selectedCampaign.hashtags,
          selected: true,
          title: campaignName,
          description: description,
          cadence: cadence,
          target_audience: targetAudience,
          platforms: platforms ? [platforms] : [],
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Campaign was not created');
      }

      // Navigate to completion page with campaign ID
      navigate('/campaign-completion', {
        state: {
          campaignId: data.id
        }
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload at least one image",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const imageUrl = uploadedFiles[0].preview;

      const mockCampaigns: Campaign[] = [
        {
          id: crypto.randomUUID(),
          media_url: imageUrl,
          caption: "Elevate your events with our premium catering service! 🍽️✨",
          hashtags: ["CateringExcellence", "PremiumDining", "EventPlanning"],
          selected: false
        },
        {
          id: crypto.randomUUID(),
          media_url: imageUrl,
          caption: "Create unforgettable moments with exceptional cuisine 🎉",
          hashtags: ["LuxuryCatering", "EventCatering", "FineFood"],
          selected: false
        },
        {
          id: crypto.randomUUID(),
          media_url: imageUrl,
          caption: "Transform your special day with our exquisite catering 🌟",
          hashtags: ["GourmetCatering", "SpecialEvents", "CulinaryArt"],
          selected: false
        }
      ];

      setCampaigns(mockCampaigns);
      
      toast({
        title: "Success",
        description: "Campaigns generated successfully",
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate campaigns",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
                    accept="image/*"
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
                      Support for images only
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
                    <Input 
                      id="campaign-name" 
                      placeholder="Enter campaign name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Campaign Cadence</Label>
                    <Select onValueChange={(value) => setCadence(value)}>
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
                    <Select onValueChange={(value) => setTargetAudience(value)}>
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
                    <Select onValueChange={(value) => setPlatforms(value)}>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
