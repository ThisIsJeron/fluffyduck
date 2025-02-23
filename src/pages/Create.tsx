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

type Step = "input" | "option" | "congrats"
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

const Create = () => {
  const currentStep: Step = "input"
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const location = useLocation();
  const isPastRoute = location.pathname === '/dashboard/past';

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log('Making request to:', API_URL);
      console.log('Form values:', values);
      console.log('Files:', uploadedFiles);

      if (uploadedFiles.length === 0) {
        toast({
          title: "Error",
          description: "Please upload an image",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      formData.append('reference_image', uploadedFiles[0]);
      formData.append('campaign', JSON.stringify({
        name: values.name,
        description: values.description,
        target_audience: values.target_audience,
        cadence: values.cadence,
        platforms: [values.platforms]
      }));

      const response = await fetch(`${API_URL}/api/generate-campaign`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.generated_images) {
        setGeneratedImages(data.generated_images);
        toast({
          title: "Success",
          description: "Campaign generated successfully!",
        });
      }

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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[47.5%]">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campaign Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter campaign name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your campaign goals"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target_audience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="Who is this campaign for?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cadence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posting Cadence</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select posting frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <div className="flex flex-wrap gap-y-4 gap-x-10">
                          {[
                            { name: "Instagram", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="h-8 w-fit" /> },
                            { name: "Facebook", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" className="h-8 w-fit" /> },
                            { name: "LinkedIn", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png" alt="LinkedIn" className="h-8 w-fit" /> },
                            { name: "X", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg" alt="X" className="h-8 w-fit" /> },
                            { name: "TikTok", icon: <img src="https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/1024px-TikTok_logo.svg.png" alt="TikTok" className="h-8 w-fit" /> },
                            { name: "Gmail", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" className="h-8 w-fit" /> },
                            { name: "SMS", icon: <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IMessage_logo.svg" alt="SMS" className="h-8 w-fit" /> },
                          ].map((platform) => (
                            <label key={platform.name} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="platform"
                                value={platform.name}
                                onChange={() => field.onChange(platform.name)}
                                checked={field.value === platform.name}
                                className="form-radio custom-radio"
                                style={{
                                  appearance: 'none',
                                  width: '1.25rem',
                                  height: '1.25rem',
                                  backgroundColor: field.value === platform.name ? '#CFB232' : '#fff',
                                  border: '2px solid #d1d5db',
                                  borderRadius: '50%',
                                  display: 'grid',
                                  placeContent: 'center',
                                  cursor: 'pointer',
                                }}
                              />
                              <span className="flex items-center space-x-2">
                                {platform.icon}
                              </span>
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading} className="h-10 flex items-center justify-center">
                    {isLoading && <Loader2 className="mr-2  h-4 w-4 animate-spin" />}
                    Generate Campaign
                  </Button>
                </form>
              </Form>
            </div>
          ) : currentStep === "options" ? (
            <div>
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
