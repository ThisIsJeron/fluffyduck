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
import { Textarea } from "./ui/textarea";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useState } from "react";
import { ImageUpload } from "./ImageUpload";

const API_URL = import.meta.env.VITE_API_URL || 'https://fluffyduck-api.onrender.com';

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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(file => {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
          toast({
            title: "Error",
            description: "Please upload only JPEG, PNG, GIF, or WEBP images",
            variant: "destructive",
          });
          return null;
        }

        return {
          ...file,
          preview: URL.createObjectURL(file)
        };
      }).filter(Boolean) as UploadedFile[];

      if (files.length > 0) {
        setUploadedFiles(prev => [...prev, ...files]);
      }
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

  const checkServerAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        throw new Error('Backend server is not responding properly');
      }
      const data = await response.text();
      console.log('Backend health check response:', data);
      return true;
    } catch (error) {
      console.error('Server availability check failed:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('This might be a CORS or server connection issue');
      }
      return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const isServerAvailable = await checkServerAvailability();
      if (!isServerAvailable) {
        throw new Error('Backend server is not available. Please ensure the backend server is running and accessible');
      }

      if (!campaignName || !description || !targetAudience || !platforms) {
        toast({
          title: "Error",
          description: "Please upload an image",
          variant: "destructive",
        });
        return;
      }

      // Create FormData
      const formData = new FormData();
      
      const campaignData = {
        name: campaignName,
        description: description,
        target_audience: targetAudience,
        cadence: cadence,
        platforms: [platforms]
      };
      
      formData.append('campaign', JSON.stringify(campaignData));
      
      const fileToUpload = uploadedFiles[0];

      const imageFile = new File(
        [fileToUpload],
        fileToUpload.name,
        {
          type: fileToUpload.type,
          lastModified: new Date().getTime()
        }
      );

      formData.append('reference_image', imageFile);

      console.log('Sending data to backend:', {
        campaignData,
        fileType: imageFile.type,
        fileName: imageFile.name,
        fileSize: imageFile.size,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? value.type : typeof value
        }))
      });

      const response = await fetch(`${API_URL}/generate-campaign`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate images';
        try {
          const errorData = await response.text();
          console.error('Error response:', errorData);
          
          try {
            const jsonError = JSON.parse(errorData);
            if (jsonError.detail) {
              errorMessage = Array.isArray(jsonError.detail) 
                ? jsonError.detail.map((error: any) => error.msg).join(', ')
                : jsonError.detail;
            }
          } catch (e) {
            errorMessage = errorData || errorMessage;
          }
        } catch (e) {
          console.error('Error reading response:', e);
          if (!window.navigator.onLine) {
            errorMessage = 'You are currently offline. Please check your internet connection.';
          } else if (response.status === 404) {
            errorMessage = 'The generate-campaign endpoint does not exist. Please ensure the backend server is properly configured.';
          } else if (response.status === 503 || response.status === 502 || response.status === 504) {
            errorMessage = 'The server is temporarily unavailable. Please try again in a few minutes.';
          }
        }
        
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      const responseData = JSON.parse(responseText);
      console.log('API Response:', responseData);

      if (!responseData.generated_images || !Array.isArray(responseData.generated_images)) {
        throw new Error('Invalid response format from API');
      }
      
      // Update UI with generated images
      setGeneratedImages(data.generated_images);

      toast({
        title: "Success",
        description: "Campaign generated successfully!",
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate campaign",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <FormField
            control={form.control}
            name="target_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <FormControl>
                  <Input placeholder="Who is this campaign for?" {...field} />
                </FormControl>
                <FormDescription>Describe your target audience.</FormDescription>
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
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Choose your primary platform.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel>Upload Image</FormLabel>
            <ImageUpload
              value={uploadedFiles.map(file => URL.createObjectURL(file))}
              onChange={(files) => setUploadedFiles(files)}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Campaign
          </Button>
        </form>
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
  );
}