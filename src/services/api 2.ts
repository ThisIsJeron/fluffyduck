interface CampaignData {
    name: string;
    description: string;
    target_audience: string;
    cadence: string;
    platforms: string[];
  }
  
  export async function generateCampaign(campaignData: CampaignData, referenceImage?: File) {
    const formData = new FormData();
    
    // Add campaign data
    formData.append('campaign', JSON.stringify(campaignData));
    
    // Add reference image if provided
    if (referenceImage) {
      formData.append('reference_image', referenceImage);
    }
  
    const response = await fetch('http://localhost:8000/api/generate-campaign', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to generate campaign');
    }
  
    return response.json();
  }