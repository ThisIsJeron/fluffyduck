
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CampaignDetailsFormProps {
  campaignName: string;
  description: string;
  cadence: string;
  targetAudience: string;
  platforms: string;
  startDate: Date | null;
  endDate: Date | null;
  onCampaignNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCadenceChange: (value: string) => void;
  onTargetAudienceChange: (value: string) => void;
  onPlatformsChange: (value: string) => void;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
}

const CampaignDetailsForm = ({
  campaignName,
  description,
  cadence,
  targetAudience,
  platforms,
  startDate,
  endDate,
  onCampaignNameChange,
  onDescriptionChange,
  onCadenceChange,
  onTargetAudienceChange,
  onPlatformsChange,
  onStartDateChange,
  onEndDateChange,
}: CampaignDetailsFormProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
      <h2 className="text-xl font-semibold mb-4">Campaign Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="campaign-name">Campaign Name *</Label>
          <Input 
            id="campaign-name" 
            placeholder="Enter campaign name"
            value={campaignName}
            onChange={(e) => onCampaignNameChange(e.target.value)}
            required
          />
        </div>

        <div>
          <Label>Campaign Cadence *</Label>
          <Select onValueChange={onCadenceChange} required>
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
          <Label>Target Audience *</Label>
          <Select onValueChange={onTargetAudienceChange} required>
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
          <Label>Platforms *</Label>
          <Select onValueChange={onPlatformsChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="campaign-description">Campaign Description *</Label>
          <Textarea
            id="campaign-description"
            placeholder="Enter campaign description"
            className="h-32"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>End Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  disabled={(date) => startDate ? date < startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailsForm;
