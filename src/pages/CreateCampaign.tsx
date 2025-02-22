
import { useCampaignCreation } from "@/hooks/useCampaignCreation";
import CampaignCreationForm from "@/components/campaign/CampaignCreationForm";

const CreateCampaign = () => {
  const {
    uploadedFiles,
    isGenerating,
    campaigns,
    campaignName,
    description,
    cadence,
    targetAudience,
    platforms,
    handleFileUpload,
    removeFile,
    handleSelect,
    handleGenerate,
    setCampaignName,
    setDescription,
    setCadence,
    setTargetAudience,
    setPlatforms
  } = useCampaignCreation();

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="container mx-auto">
        <CampaignCreationForm
          uploadedFiles={uploadedFiles}
          isGenerating={isGenerating}
          campaigns={campaigns}
          campaignName={campaignName}
          description={description}
          cadence={cadence}
          targetAudience={targetAudience}
          platforms={platforms}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onSelect={handleSelect}
          onGenerate={handleGenerate}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
          onCadenceChange={setCadence}
          onTargetAudienceChange={setTargetAudience}
          onPlatformsChange={setPlatforms}
        />
      </div>
    </div>
  );
};

export default CreateCampaign;
