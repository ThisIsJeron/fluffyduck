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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
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

      const formData = new FormData();
      
      const campaignData = {
        name: campaignName,
        description: description,
        target_audience: targetAudience,
        cadence: cadence,
        platforms: [platforms]
      };
      
      formData.append('campaign', JSON.stringify(campaignData));
      
      const file = uploadedFiles[0];
      const imageFile = new File([file], file.name, { type: file.type });
      formData.append('reference_image', imageFile);

      console.log('Sending data to backend:', campaignData);

      const response = await fetch('https://7a22-12-206-80-188.ngrok-free.app/api/generate-campaign', {
        method: 'POST',
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
        start_date: startDate,
        end_date: endDate
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

  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      const response = await fetch(selectedCampaign.media_url);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          
          const { data, error } = await supabase
            .from('selected_campaigns')
            .insert({
              media_url: base64data,
              caption: selectedCampaign.caption,
              hashtags: selectedCampaign.hashtags,
              title: campaignName,
              description: description,
              cadence: cadence,
              target_audience: targetAudience,
              platforms: [platforms],
              start_date: startDate?.toISOString(),
              end_date: endDate?.toISOString(),
              metrics: { likes: 0, views: 0, comments: 0 }
            })
            .select()
            .single();

          if (error) throw error;

          if (!data) {
            throw new Error('Campaign was not created');
          }

          console.log("Created selected campaign:", data);

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
              startDate={startDate}
              endDate={endDate}
              onCampaignNameChange={setCampaignName}
              onDescriptionChange={setDescription}
              onCadenceChange={setCadence}
              onTargetAudienceChange={setTargetAudience}
              onPlatformsChange={setPlatforms}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
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
