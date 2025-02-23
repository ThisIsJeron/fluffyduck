// Define the campaign data interface
interface CampaignData {
    name: string;
    description: string;
    target_audience: string;
    cadence: string;
    platforms: string[];
  }
  
  // Define the response interface
  interface CampaignResponse {
    generated_images: string[];
    prompt: string;
    style_used: string;
    reference_image_used: boolean;
  }
  
  export async function generateCampaign(campaignData: CampaignData, referenceImage?: File): Promise<CampaignResponse> {
    const formData = new FormData();
    
    // Add campaign data as JSON string with the correct key 'campaign_data'
    formData.append('campaign_data', JSON.stringify(campaignData));
    
    // Add reference image if provided
    if (referenceImage) {
      formData.append('reference_image', referenceImage);
    }
  
    try {
      const response = await fetch('http://localhost:8000/api/generate-campaign', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate campaign');
      }
  
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating campaign:', error);
      throw error;
    }
  }