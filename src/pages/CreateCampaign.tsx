
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

interface CampaignCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  target_audience: z.string().min(2, "Target audience is required."),
  cadence: z.string(),
  platforms: z.string()
});

const CreateCampaign = () => {
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

      const formData = new FormData();
      formData.append('reference_image', uploadedFiles[0]);
      formData.append('campaign', JSON.stringify({
        name: values.name,
        description: values.description,
        target_audience: values.target_audience,
        cadence: values.cadence,
        platforms: [values.platforms],
        start_date: startDate,
        end_date: endDate
      }));

      const response = await fetch(`${API_URL}/api/generate-campaign`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const campaignCards: CampaignCard[] = [
        {
          id: 1,
          title: "Modern & Bold",
          description: "A contemporary approach that captures attention with bold visuals and compelling messaging.",
          image: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/campaign_media/1.jpeg`
        },
        {
          id: 2,
          title: "Classic & Elegant",
          description: "Timeless design that emphasizes sophistication and brand heritage.",
          image: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/campaign_media/2.jpeg`
        },
        {
          id: 3,
          title: "Creative & Playful",
          description: "An innovative take that sparks engagement through creative storytelling.",
          image: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/campaign_media/3.jpeg`
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
          <Form {...form}>
            <div className="space-y-4">
              <FormLabel>Upload Image</FormLabel>
              <ImageUpload
                value={uploadedFiles.map(file => URL.createObjectURL(file))}
                onChange={(files) => setUploadedFiles(files)}
              />
            </div>
          </Form>
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign name" {...field} />
                    </FormControl>
                    <FormDescription>Name your marketing campaign.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign goals"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What are you trying to achieve with this campaign?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>

                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </FormItem>
              </div>

              <FormField
                control={form.control}
                name="target_audience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    </FormControl>
                    <FormDescription>Choose your target audience.</FormDescription>
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
                    <FormDescription>How often will you post?</FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Choose your primary platform.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Campaign
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {generatedCampaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Campaign Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {generatedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-video relative">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                  <p className="text-gray-600">{campaign.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;
