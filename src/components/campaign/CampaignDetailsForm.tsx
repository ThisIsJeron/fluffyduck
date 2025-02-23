
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignDetailsFormProps {
  campaignName: string;
  description: string;
  cadence: string;
  targetAudience: string;
  platforms: string;
  onCampaignNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCadenceChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onPlatformsChange: (value: string) => void;
}

const CampaignDetailsForm = ({
  campaignName,
  description,
  cadence,
  targetAudience,
  platforms,
  onCampaignNameChange,
  onDescriptionChange,
  onCadenceChange,
  onTargetAudienceChange,
  onPlatformsChange,
}: CampaignDetailsFormProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="campaign-name">Campaign Name</Label>
          <Input 
            id="campaign-name" 
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => onCampaignNameChange(e.target.value)}
          />
        </div>

        <div>
          <Label>Campaign Cadence</Label>
          <Select onValueChange={onCadenceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Target Audience</Label>
          <Select onValueChange={onTargetAudienceChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurants">Restaurant Owners</SelectItem>
              <SelectItem value="caterers">Catering Services</SelectItem>
              <SelectItem value="hotels">Hotels</SelectItem>
              <SelectItem value="event-planners">Event Planners</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Platforms</Label>
          <Select onValueChange={onPlatformsChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="campaign-description">Campaign Description</Label>
          <Textarea
            id="campaign-description"
            placeholder="Enter campaign description"
            className="h-32"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsForm;
