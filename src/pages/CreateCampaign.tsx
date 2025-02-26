
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import MediaUpload from "@/components/campaign/MediaUpload";


import { ImageUpload } from "@/components/ImageUpload";
import { CampaignForm } from "@/components/campaign/CampaignForm";
import { CampaignCards } from "@/components/campaign/CampaignCards";
import type { z } from "zod";
import { formSchema } from "@/components/campaign/CampaignForm";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";


type Step = "input" | "options" | "congrats";
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const CreateCampaign = () => {
  const currentStep: Step = "input"
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      target_audience: "",
      cadence: "",
      platforms: ""
    }
  });

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
    const [formData, setFormData] = useState<any>(null);

    const generateCampaignCards = async () => {
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

      return [
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
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
      setIsLoading(true);
      try {
        // Store form data for use in campaign selection
        setFormData({
          ...values,
          start_date: startDate,
          end_date: endDate,
        });

        // Generate campaign variations
        const campaignCards = await generateCampaignCards();
        setGeneratedCampaigns(campaignCards);

        toast({
          title: "Success",
          description: "Campaign variations generated successfully!",
        });

      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to generate campaign variations. Please try again.",
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

        <CampaignCards campaigns={generatedCampaigns} formData={formData} />
      </div>
    );
  };

  export default CreateCampaign;
