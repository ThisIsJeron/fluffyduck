
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MediaUpload from "@/components/campaign/MediaUpload";
import CampaignDetailsForm from "@/components/campaign/CampaignDetailsForm";
import GeneratedCampaigns from "@/components/campaign/GeneratedCampaigns";
import { Campaign, UploadedFile } from "@/types/campaign";

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
      // Convert blob URL to base64
      const response = await fetch(selectedCampaign.media_url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          // Insert campaign with base64 image data
          const { data, error } = await supabase
            .from('campaigns')
            .insert({
              media_url: base64data,
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

          navigate(`/campaign-completion/${data.id}`);
        } catch (error) {
          console.error('Error:', error);
          toast({
            title: "Error",
            description: "Failed to save campaign",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
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
        return;
      }

      // First, save the campaign details to Supabase
      const file = uploadedFiles[0];
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          // Save the initial campaign data
          const { data: savedCampaign, error: saveError } = await supabase
            .from('campaigns')
            .insert({
              media_url: base64data,
              title: campaignName,
              description: description,
              cadence: cadence,
              target_audience: targetAudience,
              platforms: platforms ? [platforms] : [],
              selected: false,
            })
            .select()
            .single();

          if (saveError) throw saveError;

          // Generate mock campaigns using the saved image
          const mockCampaigns: Campaign[] = [
            {
              id: crypto.randomUUID(),
              media_url: file.preview,
              caption: "Elevate your events with our premium catering service! 🍽️✨",
              hashtags: ["CateringExcellence", "PremiumDining", "EventPlanning"],
              selected: false
            },
            {
              id: crypto.randomUUID(),
              media_url: file.preview,
              caption: "Create unforgettable moments with exceptional cuisine 🎉",
              hashtags: ["LuxuryCatering", "EventCatering", "FineFood"],
              selected: false
            },
            {
              id: crypto.randomUUID(),
              media_url: file.preview,
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
            description: "Failed to save campaign",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(file);
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
            <MediaUpload
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeFile}
            />

            <CampaignDetailsForm
              campaignName={campaignName}
              description={description}
              cadence={cadence}
              targetAudience={targetAudience}
              platforms={platforms}
              onCampaignNameChange={setCampaignName}
              onDescriptionChange={setDescription}
              onCadenceChange={setCadence}
              onTargetAudienceChange={setTargetAudience}
              onPlatformsChange={setPlatforms}
            />
          </div>

          <div className="mt-8 text-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-xl"
            >
              {isGenerating ? "Generating Campaign..." : "Generate Campaign"}
            </Button>
          </div>

          <GeneratedCampaigns 
            campaigns={campaigns}
            onSelect={handleSelect}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;
