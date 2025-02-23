<<<<<<< HEAD

import { useCampaignCreation } from "@/hooks/useCampaignCreation";
import CampaignCreationForm from "@/components/campaign/CampaignCreationForm";

const CreateCampaign = () => {
  const {
    uploadedFiles,
    isGenerating,
    campaigns,
    campaignName,
    description,
    cadence,
    targetAudience,
    platforms,
    startDate,
    endDate,
    handleFileUpload,
    removeFile,
    handleSelect,
    handleGenerate,
    setCampaignName,
    setDescription,
    setCadence,
    setTargetAudience,
    setPlatforms,
    setStartDate,
    setEndDate
  } = useCampaignCreation();
=======
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
import { generateCampaign } from "@/api/api";

const CreateCampaign = () => {
  // State management
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [cadence, setCadence] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]); // Changed to string array
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(file => ({
        ...file,
        preview: URL.createObjectURL(file)
      }));
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Handle campaign selection
  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      // Get the image data
      const response = await fetch(selectedCampaign.media_url);
      const blob = await response.blob();
      
      // Save to Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(`campaign-${Date.now()}.jpg`, blob);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(uploadData.path);

      // Save campaign to database
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          media_url: publicUrl,
          caption: selectedCampaign.caption,
          hashtags: selectedCampaign.hashtags,
          selected: true,
          title: campaignName,
          description: description,
          cadence: cadence,
          target_audience: targetAudience,
          platforms: platforms,
          prompt: selectedCampaign.prompt,
          style_used: selectedCampaign.style_used
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Campaign was not created');
      }

      // Navigate to completion page
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

  // Generate campaign images
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Validate inputs
      if (!campaignName || !description || !targetAudience || platforms.length === 0) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Prepare campaign data
      const campaignData = {
        name: campaignName,
        description: description,
        target_audience: targetAudience,
        cadence: cadence,
        platforms: platforms
      };

      // Get reference image if available
      const referenceImage = uploadedFiles[0] || null;

      // Call API to generate images
      const result = await generateCampaign(campaignData, referenceImage);

      // Transform API response to Campaign type
      const generatedCampaigns: Campaign[] = result.generated_images.map((imageUrl, index) => ({
        id: crypto.randomUUID(),
        media_url: imageUrl,
        caption: `${campaignName} - Option ${index + 1}`,
        hashtags: generateHashtags(campaignName, targetAudience),
        selected: false,
        prompt: result.prompt,
        style_used: result.style_used
      }));

      setCampaigns(generatedCampaigns);
      
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
>>>>>>> b937f81 (all the changes)

  // Helper function to generate hashtags
  const generateHashtags = (name: string, audience: string): string[] => {
    const baseHashtags = name.split(' ').map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`);
    const audienceHashtags = audience.split(' ').map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`);
    return [...new Set([...baseHashtags, ...audienceHashtags])].filter(tag => tag.length > 1);
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="container mx-auto">
<<<<<<< HEAD
        <CampaignCreationForm
          uploadedFiles={uploadedFiles}
          isGenerating={isGenerating}
          campaigns={campaigns}
          campaignName={campaignName}
          description={description}
          cadence={cadence}
          targetAudience={targetAudience}
          platforms={platforms}
          startDate={startDate}
          endDate={endDate}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onSelect={handleSelect}
          onGenerate={handleGenerate}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
          onCadenceChange={setCadence}
          onTargetAudienceChange={setTargetAudience}
          onPlatformsChange={setPlatforms}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
=======
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
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Generating Campaign...
                </div>
              ) : (
                "Generate Campaign"
              )}
            </Button>
          </div>

          {campaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <GeneratedCampaigns 
                campaigns={campaigns}
                onSelect={handleSelect}
              />
            </motion.div>
          )}
        </motion.div>
>>>>>>> b937f81 (all the changes)
      </div>
    </div>
  );
};

export default CreateCampaign;