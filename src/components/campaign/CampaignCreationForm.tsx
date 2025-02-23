
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

        <CampaignDetailsForm
          campaignName={campaignName}
          description={description}
          cadence={cadence}
          targetAudience={targetAudience}
          platforms={platforms}
          startDate={startDate}
          endDate={endDate}
          onCampaignNameChange={onCampaignNameChange}
          onDescriptionChange={onDescriptionChange}
          onCadenceChange={onCadenceChange}
          onTargetAudienceChange={onTargetAudienceChange}
          onPlatformsChange={onPlatformsChange}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
        />
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="bg-accent hover:bg-accent/90 text-white px-12 py-6 text-lg rounded-xl"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⚡</span>
              Generating Campaign...
            </>
          ) : (
            "Generate Campaign"
          )}
        </Button>
      </div>

      {campaigns.length > 0 && (
        <GeneratedCampaigns 
          campaigns={campaigns}
          onSelect={onSelect}
        />
      )}
    </motion.div>
  );
};

export default CampaignCreationForm;
