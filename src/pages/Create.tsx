import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { generateCampaign } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  campaign_name: z.string().min(3, "Campaign name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  target_audience: z.string().min(5, "Target audience must be at least 5 characters"),
  start_date: z.date(),
  end_date: z.date(),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  budget: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const platforms = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "twitter", label: "Twitter" },
  { id: "linkedin", label: "LinkedIn" },
];

const Create = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaign_name: "",
      description: "",
      target_audience: "",
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      platforms: ["instagram"],
      budget: "",
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    try {
      if (!selectedImage) {
        toast.error("Please select an image first");
        return;
      }

      const formData = form.getValues();
      
      if (!formData.campaign_name || !formData.description || !formData.target_audience) {
        toast.error("Please fill in campaign details before generating");
        return;
      }

      setIsGenerating(true);
      toast.info("Generating enhanced images...");

      const result = await generateCampaign({
        name: formData.campaign_name,
        description: formData.description,
        target_audience: formData.target_audience,
        cadence: "weekly",
        platforms: formData.platforms,
      }, selectedImage);

      if (result.generated_images && result.generated_images.length > 0) {
        setGeneratedImages(result.generated_images);
        toast.success("Images generated successfully!");
      } else {
        toast.error("No images were generated");
      }
    } catch (error: any) {
      console.error("Error generating campaign:", error);
      toast.error(error.message || "Failed to generate campaign");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a campaign");
      navigate("/auth");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Validate that we have either an original image or generated images
      if (!selectedImage && generatedImages.length === 0) {
        toast.error("Please select an image or generate images first");
        return;
      }
      
      // Prepare media URLs (either generated or original)
      let media_urls = generatedImages.length > 0 
        ? generatedImages 
        : previewUrl ? [previewUrl] : [];
      
      console.log("Creating campaign with data:", {
        ...data,
        media_urls,
        user_id: user.id,
      });
      
      // Insert campaign into database
      const { data: insertData, error: insertError } = await supabase.from("campaigns").insert({
        user_id: user?.id,
        title: data.campaign_name, // Using title instead of campaign_name
        description: data.description,
        media_url: media_urls.length > 0 ? media_urls[0] : null, // Store primary image in media_url
        start_date: data.start_date,
        end_date: data.end_date,
        target_audience: data.target_audience,
        // Add any other required fields based on your schema
      });
      
      if (insertError) {
        throw insertError;
      }
      
      toast.success("Campaign created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      toast.error(error.message || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold mb-6">Create New Marketing Campaign</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Enter the details for your new marketing campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="campaign_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Campaign Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Special" {...field} />
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
                              placeholder="Describe your campaign goals and content" 
                              className="min-h-[100px]"
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
                            <Input placeholder="Young professionals, families, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>End Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="platforms"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel>Platforms</FormLabel>
                            <FormDescription>
                              Select the platforms for your campaign
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {platforms.map((platform) => (
                              <FormField
                                key={platform.id}
                                control={form.control}
                                name="platforms"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={platform.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(platform.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, platform.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== platform.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal cursor-pointer">
                                        {platform.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="$500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Campaign"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Media</CardTitle>
                <CardDescription>
                  Upload or generate images for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Label htmlFor="image-upload" className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG or GIF, max 5MB
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageSelect}
                    />
                  </Label>
                </div>
                
                {previewUrl && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Original Image</h3>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                <Button 
                  type="button" 
                  onClick={handleGenerate} 
                  className="w-full"
                  disabled={!selectedImage || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Enhanced Images"
                  )}
                </Button>
                
                {generatedImages.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Generated Images</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {generatedImages.map((url, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                          <img
                            src={url}
                            alt={`Generated ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Create;
