from pydantic import BaseModel
from typing import List, Optional

class CampaignRequest(BaseModel):
    name: str
    description: str
    target_audience: str
    cadence: str
    platforms: List[str]
    reference_image_url: Optional[str] = None  # URL of uploaded image if any

class ImageGenerationResponse(BaseModel):
    generated_images: List[str]
    prompt: str
    style_used: str