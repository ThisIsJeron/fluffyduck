
"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { CampaignCards } from "@/components/campaign/CampaignCards";
import type { z } from "zod";
import { formSchema } from "@/components/campaign/CampaignForm";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface CampaignCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

const CreateCampaign = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedCampaigns, setGeneratedCampaigns] = useState<CampaignCard[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload an image",
          variant: "destructive",
        });
        return;
      }

      // Upload the reference image to Supabase storage
      const file = uploadedFiles[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('campaign_media')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URLs for the sample campaign images
      const { data: { publicUrl: url1 } } = supabase
        .storage
        .from('campaign_media')
        .getPublicUrl('1.jpeg');
      
      const { data: { publicUrl: url2 } } = supabase
        .storage
        .from('campaign_media')
        .getPublicUrl('2.jpeg');
      
      const { data: { publicUrl: url3 } } = supabase
        .storage
        .from('campaign_media')
        .getPublicUrl('3.jpeg');

      const campaignCards: CampaignCard[] = [
        {
          id: 1,
          title: "Modern & Bold",
          description: "A contemporary approach that captures attention with bold visuals and compelling messaging.",
          image: url1
        },
        {
          id: 2,
          title: "Classic & Elegant",
          description: "Timeless design that emphasizes sophistication and brand heritage.",
          image: url2
        },
        {
          id: 3,
          title: "Creative & Playful",
          description: "An innovative take that sparks engagement through creative storytelling.",
          image: url3
        }
      ];

      setGeneratedCampaigns(campaignCards);
      toast({
        title: "Success",
        description: "Campaign variations generated successfully!",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-8">Create Campaign</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="image-upload">Upload Image</Label>
            <ImageUpload
              value={uploadedFiles.map(file => URL.createObjectURL(file))}
              onChange={(files) => setUploadedFiles(files)}
            />
          </div>
        </div>

        <div>
          <CampaignForm
            onSubmit={onSubmit}
            isLoading={isLoading}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>

      <CampaignCards campaigns={generatedCampaigns} />
    </div>
  );
};

export default CreateCampaign;
