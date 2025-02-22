
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
    startDate,
    endDate,
    handleFileUpload,
    removeFile,
    handleSelect,
    handleGenerate,
    setCampaignName,
    setDescription,
    setCadence,
    setTargetAudience,
    setPlatforms,
    setStartDate,
    setEndDate
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
          startDate={startDate}
          endDate={endDate}
          onFileUpload={handleFileUpload}
          onRemoveFile={removeFile}
          onSelect={handleSelect}
          onGenerate={handleGenerate}
          onCampaignNameChange={setCampaignName}
          onDescriptionChange={setDescription}
          onCadenceChange={setCadence}
          onTargetAudienceChange={setTargetAudience}
          onPlatformsChange={setPlatforms}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>
    </div>
  );
};

export default CreateCampaign;
