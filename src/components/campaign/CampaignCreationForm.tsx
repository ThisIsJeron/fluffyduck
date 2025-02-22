
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import MediaUpload from "./MediaUpload";
import CampaignDetailsForm from "./CampaignDetailsForm";
import GeneratedCampaigns from "./GeneratedCampaigns";
import { Campaign, UploadedFile } from "@/types/campaign";
import { cn } from "@/lib/utils";

interface CampaignCreationFormProps {
  uploadedFiles: UploadedFile[];
  isGenerating: boolean;
  campaigns: Campaign[];
  campaignName: string;
  description: string;
  cadence: string;
  targetAudience: string;
  platforms: string;
  startDate: Date | null;
  endDate: Date | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSelect: (campaign: Campaign) => void;
  onGenerate: () => void;
  onCampaignNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCadenceChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onPlatformsChange: (value: string) => void;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

const CampaignCreationForm = ({
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
  onFileUpload,
  onRemoveFile,
  onSelect,
  onGenerate,
  onCampaignNameChange,
  onDescriptionChange,
  onCadenceChange,
  onTargetAudienceChange,
  onPlatformsChange,
  onStartDateChange,
  onEndDateChange,
}: CampaignCreationFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-8">Create Campaign</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        <MediaUpload
          uploadedFiles={uploadedFiles}
          onFileUpload={onFileUpload}
          onRemoveFile={onRemoveFile}
        />

        <div className="space-y-6">
          <CampaignDetailsForm
            campaignName={campaignName}
            description={description}
            cadence={cadence}
            targetAudience={targetAudience}
            platforms={platforms}
            onCampaignNameChange={onCampaignNameChange}
            onDescriptionChange={onDescriptionChange}
            onCadenceChange={onCadenceChange}
            onTargetAudienceChange={onTargetAudienceChange}
            onPlatformsChange={onPlatformsChange}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={onStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={onEndDateChange}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-xl"
        >
          {isGenerating ? "Generating Campaign..." : "Generate Campaign"}
        </Button>
      </div>

      <GeneratedCampaigns 
        campaigns={campaigns}
        onSelect={onSelect}
      />
    </motion.div>
  );
};

export default CampaignCreationForm;
