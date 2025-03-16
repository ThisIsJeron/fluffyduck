import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import MediaUpload from "@/components/campaign/MediaUpload";

interface UploadedFile extends File {
  preview: string;
}

const Create = () => {
  const navigate = useNavigate();
  const { user, session, isLoading } = useAuth();
  const [restaurantName, setRestaurantName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [targetAudience, setTargetAudience] = useState("");
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSubmit(true);

    try {
      if (!campaignName || !description || !startDate || !endDate || !budget || !targetAudience || uploadedFiles.length === 0) {
        throw new Error("Please fill in all fields and upload at least one file");
      }

      const userId = user?.id;
      if (!userId) {
        throw new Error("User ID not found. Please sign in again.");
      }

      // Upload files to Supabase storage
      const fileUrls = await Promise.all(
        uploadedFiles.map(async (file) => {
          const filePath = `campaigns/${userId}/${file.name}`;
          const { data, error } = await supabase.storage
            .from('campaign-assets')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error("File upload error:", error);
            throw new Error(`Failed to upload file: ${file.name}`);
          }

          const { data: urlData } = supabase.storage
            .from('campaign-assets')
            .getPublicUrl(filePath);

          return urlData.publicUrl;
        })
      );

      // Save campaign data to Supabase database
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            user_id: userId,
            restaurant_name: restaurantName,
            campaign_name: campaignName,
            description: description,
            media_urls: fileUrls,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            budget: budget,
            target_audience: targetAudience,
          },
        ]);

      if (error) {
        console.error("Database insert error:", error);
        throw new Error("Failed to save campaign data");
      }

      console.log("Campaign created successfully:", data);
      alert("Campaign created successfully!");
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Error creating campaign:", error);
      alert(error.message || "An error occurred while creating the campaign.");
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleFileUpload = (files: File[]) => {
    const typedFiles: UploadedFile[] = files.map(file => {
      const uploadedFile = file as UploadedFile;
      uploadedFile.preview = URL.createObjectURL(file);
      return uploadedFile;
    });
    
    setUploadedFiles(typedFiles);
  };

  return (
    <div className="container mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Campaign</CardTitle>
          <CardDescription>Fill out the form below to create a new marketing campaign.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-gray-700">
                Restaurant Name
              </label>
              <input
                type="text"
                id="restaurantName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                id="campaignName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="media" className="block text-sm font-medium text-gray-700">
                Media Upload
              </label>
              <MediaUpload onFileUpload={handleFileUpload} />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget
              </label>
              <input
                type="number"
                id="budget"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={budget === null ? '' : budget.toString()}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                required
              />
            </div>
            <CardFooter>
              <Button type="submit" disabled={isLoadingSubmit}>
                {isLoadingSubmit ? 'Creating...' : 'Create Campaign'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Create;
