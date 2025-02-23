
import { Campaign } from "@/types/campaign";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "MMMM dd, yyyy");
  };

  return (
    <>
      <h2 className="text-2xl font-bold">{campaign.title}</h2>
      <p className="text-gray-600">{campaign.description}</p>
      
      <div className="space-y-3">
        <h3 className="font-semibold">Campaign Details</h3>
        <div className="bg-accent/5 p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-accent">
            <CalendarDays className="h-4 w-4" />
            <span className="font-medium">Campaign Duration</span>
          </div>
          <p className="text-sm">
            Start Date: <span className="font-medium">{formatDate(campaign.start_date)}</span>
          </p>
          <p className="text-sm">
            End Date: <span className="font-medium">{formatDate(campaign.end_date)}</span>
          </p>
        </div>
        <p><span className="font-medium">Target Audience:</span> {campaign.target_audience}</p>
        <p><span className="font-medium">Platforms:</span> {campaign.platforms?.join(", ")}</p>
      </div>
    </>
  );
}
