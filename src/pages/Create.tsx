import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Eye, CheckCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/header";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { CampaignDetailsDialog } from "@/components/campaign/CampaignDetailsDialog";
import { useState } from "react";
import { format, isBefore, isAfter, startOfToday, isWithinInterval } from "date-fns";
import { CampaignCards } from "@/components/campaign/CampaignCards";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import MediaUpload from "@/components/campaign/MediaUpload";
import CampaignFormV2 from "@/components/campaign/CampaignFormV2";

type Step = "input" | "option" | "congrats";
interface CampaignCard {
  id: number;
  title: string;
  description: string;
  image: string;
}
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const Create = () => {
  const [currentStep, setCurrentStep] = useState<Step>("input");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [generatedCampaigns, setGeneratedCampaigns] = useState<CampaignCard[]>([]);


  const location = useLocation();
  const isPastRoute = location.pathname === '/dashboard/past';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Store form data for use in campaign selection
      setFormData({
        ...values,
        start_date: startDate,
        end_date: endDate,
      });

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

      // Generate campaign variations
      const campaignCards = await generateCampaignCards();
      setGeneratedCampaigns(campaignCards);
      setCurrentStep("option")

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

  const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters."),
    target_audience: z.string().min(2, "Target audience is required."),
    cadence: z.string(),
    platforms: z.string()
  });

  const today = startOfToday();

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

  const isActiveCampaign = (campaign: Campaign) => {
    if (!campaign.start_date || !campaign.end_date) return false;
    return isWithinInterval(today, {
      start: campaign.start_date,
      end: campaign.end_date
    });
  };

  const ChannelSelector = () => {
    return (
      <div className="w-48">
        <Select
          value={selectedPlatform}
          onValueChange={setSelectedPlatform}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className=" min-h-screen bg-secondary">
      <TopHeader />
      <main className="grid grid-cols-7 gap-2 top-[80px]" style={{ height: "calc(100vh - 80px)" }}>
        <div className="w-full h-full col-span-2">
          <Sidebar />
        </div>
        <div className="w-full h-full col-span-5 overflow-y-auto p-10 pl-4 relative" >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Create Campaign</h1>
          </div>
          {currentStep === "input" ? (
            <div className="grid-col-2 gap-8">
              <div className="space-y-4 w-[47.5%] float-right top-0 right-0">
                <Form {...form}>
                  <FormItem>
                    <FormLabel>Upload Media</FormLabel>
                    <FormControl>
                      <MediaUpload
                        uploadedFiles={uploadedFiles.map(file => ({
                          preview: URL.createObjectURL(file),
                          lastModified: file.lastModified,
                          name: file.name,
                          webkitRelativePath: file.webkitRelativePath,
                          size: file.size
                        }))}
                        onFileUpload={(e) => {
                          const files = Array.from(e.target.files || []);
                          setUploadedFiles(files);
                        }}
                        onRemoveFile={(index) => {
                          const newFiles = [...uploadedFiles];
                          newFiles.splice(index, 1);
                          setUploadedFiles(newFiles);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                </Form>
                {/* Display generated images */}
                {generatedImages.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Generated Images</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generatedImages.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-auto rounded-lg shadow-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <CampaignFormV2 onSubmit={onSubmit} isLoading={isLoading} />
            </div>
          ) : currentStep === "option" ? (
            <div>
              <CampaignCards campaigns={generatedCampaigns} formData={formData} />
            </div>
          ) :
            currentStep === "congrats" && (
              <div>
              </div>
            )}
        </div>
      </main >
    </div >
  );
};

export default Create;
