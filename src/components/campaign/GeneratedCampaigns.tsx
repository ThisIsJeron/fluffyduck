
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/types/campaign";

interface GeneratedCampaignsProps {
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
}

const GeneratedCampaigns = ({ campaigns, onSelect }: GeneratedCampaignsProps) => {
  if (campaigns.length === 0) return null;

  const handleSelect = (campaign: Campaign) => {
    // Prevent event bubbling and ensure the handler is called
    onSelect(campaign);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12"
    >
      <h2 className="text-2xl font-bold mb-6">Generated Campaigns</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardContent className="p-4">
              <img
                src={campaign.media_url}
                alt="Campaign"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-700 mb-3">{campaign.caption}</p>
              <div className="flex flex-wrap gap-2">
                {campaign.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelect(campaign)}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Select
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default GeneratedCampaigns;
