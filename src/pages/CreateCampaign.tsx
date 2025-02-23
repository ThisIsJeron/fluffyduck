
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
  // State management
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

  // Handle campaign generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Validation
      if (!campaignName || !description || !targetAudience || !platforms) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload at least one image",
          variant: "destructive",
        });
        return;
      }

      // Create FormData object
      const formData = new FormData();
      
      // Add the campaign data as JSON string with the key 'campaign'
      const campaignData = {
        name: campaignName,
        description: description,
        target_audience: targetAudience,
        cadence: cadence,
        platforms: [platforms]  // Convert to array since backend expects array
      };
      
      formData.append('campaign', JSON.stringify(campaignData));
      
      // Add the first uploaded file as reference_image
      if (uploadedFiles[0]) {
        const file = uploadedFiles[0];
        // Create a new File instance with the correct type
        const imageFile = new File([file], file.name, { type: file.type });
        formData.append('reference_image', imageFile);
      }

      console.log('Sending data to backend:', campaignData);

      // Call the API with the ngrok URL
      const response = await fetch('https://7a22-12-206-80-188.ngrok-free.app/api/generate-campaign', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate images');
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (!result.generated_images || !Array.isArray(result.generated_images)) {
        throw new Error('Invalid response format from API');
      }
      
      // Transform the API response into Campaign objects
      const generatedCampaigns: Campaign[] = result.generated_images.map((imageUrl: string) => ({
        id: crypto.randomUUID(),
        media_url: imageUrl,
        caption: `${campaignName} - ${description.substring(0, 50)}...`,
        hashtags: [
          targetAudience.replace(/\s+/g, ''),
          platforms,
          'Marketing'
        ].filter(Boolean),
        selected: false,
        title: campaignName,
        description: description,
        cadence: cadence,
        target_audience: targetAudience,
        platforms: [platforms],
        start_date: null,
        end_date: null
      }));

      console.log('Generated campaigns:', generatedCampaigns);
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

  // Handle campaign selection
  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      // Fetch the image from the URL
      const response = await fetch(selectedCampaign.media_url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          // Save to Supabase
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
              platforms: [platforms],
            })
            .select()
            .single();

          if (error) throw error;

          if (!data) {
            throw new Error('Campaign was not created');
          }

          // Navigate to completion page
          navigate(`/campaign-completion/${data.id}`);
          
          toast({
            title: "Success",
            description: "Campaign saved successfully",
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
              {isGenerating ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Generating Campaign...
                </>
              ) : (
                "Generate Campaign"
              )}
            </Button>
          </div>

          {campaigns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GeneratedCampaigns 
                campaigns={campaigns}
                onSelect={handleSelect}
              />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateCampaign;
