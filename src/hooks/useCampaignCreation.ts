
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Campaign, UploadedFile } from "@/types/campaign";

export const useCampaignCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [cadence, setCadence] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [platforms, setPlatforms] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result as string;
          setBase64Image(base64String);
          
          setUploadedFiles(prev => [...prev, {
            ...file,
            preview: URL.createObjectURL(file)
          }]);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
    setBase64Image("");
  };

  const handleSelect = async (selectedCampaign: Campaign) => {
    try {
      const { data, error } = await supabase
        .from('selected_campaigns')
        .insert({
          media_url: base64Image,
          caption: selectedCampaign.caption,
          hashtags: selectedCampaign.hashtags,
          title: campaignName,
          description: description,
          cadence: cadence,
          target_audience: targetAudience,
          platforms: platforms ? [platforms] : [],
          start_date: startDate?.toISOString(),
          end_date: endDate?.toISOString(),
          metrics: {
            likes: 0,
            comments: 0,
            views: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('Campaign was not created');
      }

      await supabase
        .from('campaigns')
        .update({ selected: true })
        .eq('title', campaignName);

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

      try {
        const { error: saveError } = await supabase
          .from('campaigns')
          .insert({
            media_url: base64Image,
            title: campaignName,
            description: description,
            cadence: cadence,
            target_audience: targetAudience,
            platforms: platforms ? [platforms] : [],
            selected: false,
            start_date: startDate?.toISOString(),
            end_date: endDate?.toISOString(),
          })
          .select()
          .single();

        if (saveError) throw saveError;

        const mockCampaigns: Campaign[] = [
          {
            id: crypto.randomUUID(),
            media_url: base64Image,
            caption: "Elevate your events with our premium catering service! 🍽️✨",
            hashtags: ["CateringExcellence", "PremiumDining", "EventPlanning"],
            selected: false,
            title: campaignName,
            description: description,
            cadence: cadence,
            target_audience: targetAudience,
            platforms: platforms ? [platforms] : [],
            start_date: startDate,
            end_date: endDate
          },
          {
            id: crypto.randomUUID(),
            media_url: base64Image,
            caption: "Create unforgettable moments with exceptional cuisine 🎉",
            hashtags: ["LuxuryCatering", "EventCatering", "FineFood"],
            selected: false,
            title: campaignName,
            description: description,
            cadence: cadence,
            target_audience: targetAudience,
            platforms: platforms ? [platforms] : [],
            start_date: startDate,
            end_date: endDate
          },
          {
            id: crypto.randomUUID(),
            media_url: base64Image,
            caption: "Transform your special day with our exquisite catering 🌟",
            hashtags: ["GourmetCatering", "SpecialEvents", "CulinaryArt"],
            selected: false,
            title: campaignName,
            description: description,
            cadence: cadence,
            target_audience: targetAudience,
            platforms: platforms ? [platforms] : [],
            start_date: startDate,
            end_date: endDate
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

  return {
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
  };
};
