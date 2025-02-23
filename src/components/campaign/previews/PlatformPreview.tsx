
import { Instagram, Facebook } from "lucide-react";
import { Campaign } from "@/types/campaign";

interface PlatformPreviewProps {
  campaign: Campaign;
}

export function PlatformPreview({ campaign }: PlatformPreviewProps) {
  const commonImageClasses = "w-full h-auto rounded-lg";

  switch (campaign.platforms?.[0]) {
    case "instagram":
      return (
        <div className="max-w-md mx-auto bg-white rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="font-semibold">Your Business Name</div>
            </div>
          </div>
          <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm mb-2">{campaign.caption}</p>
            <div className="text-blue-500 text-sm">
              {campaign.hashtags?.map((tag) => `#${tag} `)}
            </div>
          </div>
        </div>
      );

    case "email":
      return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg overflow-hidden border p-8">
          <div className="space-y-6">
            <div className="text-2xl font-bold">{campaign.title}</div>
            <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
            <div className="prose">
              <p>{campaign.caption}</p>
            </div>
            <div className="mt-4 text-center">
              <button className="bg-blue-500 text-white px-6 py-2 rounded">
                Call to Action
              </button>
            </div>
          </div>
        </div>
      );

    case "facebook":
      return (
        <div className="max-w-lg mx-auto bg-white rounded-lg overflow-hidden border">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="font-semibold">Your Business Name</div>
                <div className="text-xs text-gray-500">Sponsored</div>
              </div>
            </div>
          </div>
          <img src={campaign.media_url} alt={campaign.title} className={commonImageClasses} />
          <div className="p-4">
            <p className="text-sm mb-2">{campaign.caption}</p>
            <div className="mt-2 flex space-x-4 text-gray-500">
              <Facebook className="h-5 w-5" />
              <span>Like</span>
              <span>Comment</span>
              <span>Share</span>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-8 text-gray-500">
          No preview available for this platform
        </div>
      );
  }
}
