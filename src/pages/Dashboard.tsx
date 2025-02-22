
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Eye } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { CampaignDetailsDialog } from "@/components/campaign/CampaignDetailsDialog";

const Dashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const renderMetrics = (campaign: Campaign) => (
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <Heart size={16} />
        <span>2.1k</span>
      </div>
      <div className="flex items-center gap-1">
        <MessageCircle size={16} />
        <span>32</span>
      </div>
      <div className="flex items-center gap-1">
        <Eye size={16} />
        <span>12.3k</span>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Past Outreach</h1>
            <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg">
              View Collection
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading campaigns...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns?.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={campaign.media_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{campaign.title}</h3>
                    {renderMetrics(campaign)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {selectedCampaign && (
        <CampaignDetailsDialog
          campaign={selectedCampaign}
          open={!!selectedCampaign}
          onOpenChange={(open) => !open && setSelectedCampaign(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
