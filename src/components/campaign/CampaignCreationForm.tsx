
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import MediaUpload from "./MediaUpload";
import CampaignDetailsForm from "./CampaignDetailsForm";
import GeneratedCampaigns from "./GeneratedCampaigns";
import { Campaign, UploadedFile } from "@/types/campaign";

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
  const handleGenerateClick = () => {
    // Validate required fields
    if (!campaignName || !description || !cadence || !targetAudience || 
        !platforms || !startDate || !endDate || uploadedFiles.length === 0) {
      return;
    }
    onGenerate();
  };

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
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={handleGenerateClick}
          disabled={isGenerating || !campaignName || !description || !cadence || 
                   !targetAudience || !platforms || !startDate || !endDate || 
                   uploadedFiles.length === 0}
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
