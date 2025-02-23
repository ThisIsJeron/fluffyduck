
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

interface CampaignEditFormProps {
  campaign: Campaign;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onChange: (field: string, value: string) => void;
  isSaving: boolean;
}

export function CampaignEditForm({ campaign, onSave, onCancel, onChange, isSaving }: CampaignEditFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={campaign.title}
          onChange={(e) => onChange('title', e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={campaign.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_audience">Target Audience</Label>
        <Select 
          value={campaign.target_audience || ''} 
          onValueChange={(value) => onChange('target_audience', value)}
        >
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

      <div className="space-y-2">
        <Label htmlFor="caption">Caption</Label>
        <Textarea
          id="caption"
          value={campaign.caption || ''}
          onChange={(e) => onChange('caption', e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
