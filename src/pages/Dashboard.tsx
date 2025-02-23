
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Eye, CheckCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { CampaignDetailsDialog } from "@/components/campaign/CampaignDetailsDialog";
import { useState } from "react";
import { format, isBefore, isAfter, startOfToday, isWithinInterval } from "date-fns";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const location = useLocation();
  const isPastRoute = location.pathname === '/dashboard/past';
  
  const { data: campaigns, isLoading, refetch } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      console.log('Fetching campaigns...');
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('end_date', { ascending: !isPastRoute });
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }

      console.log('Fetched campaigns:', data);
      return (data || []).map(campaign => ({
        ...campaign,
        start_date: campaign.start_date ? new Date(campaign.start_date) : null,
        end_date: campaign.end_date ? new Date(campaign.end_date) : null
      }));
    }
  });

  const today = startOfToday();

  const isActiveCampaign = (campaign: Campaign) => {
    if (!campaign.start_date || !campaign.end_date) return false;
    return isWithinInterval(today, {
      start: campaign.start_date,
      end: campaign.end_date
    });
  };

  const filteredCampaigns = campaigns?.filter(campaign => {
    if (!campaign.end_date) return false;
    
    if (isPastRoute) {
      return isBefore(campaign.end_date, today);
    } else {
      return isAfter(campaign.end_date, today);
    }
  }) || [];

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

  const handleCampaignDeleted = async () => {
    console.log('Campaign deleted, refreshing data...');
    await refetch();
    setSelectedCampaign(null);
  };

  const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
    const isActive = isActiveCampaign(campaign);
    
    return (
      <motion.div
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
          {isActive && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-2">{campaign.title}</h3>
          <div className="text-sm text-gray-500 mb-2">
            {campaign.end_date && (
              <p>
                {isPastRoute 
                  ? `Ended ${format(campaign.end_date, 'MMM dd, yyyy')}`
                  : `Ends ${format(campaign.end_date, 'MMM dd, yyyy')}`
                }
              </p>
            )}
          </div>
          {renderMetrics(campaign)}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <section>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">
                {isPastRoute ? "Past Campaigns" : "Current & Upcoming Campaigns"}
              </h1>
            </div>

            {isLoading ? (
              <div className="text-center py-12">Loading campaigns...</div>
            ) : filteredCampaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {isPastRoute ? "No past campaigns" : "No upcoming campaigns"}
              </div>
            )}
          </section>
        </div>
      </main>
      
      {selectedCampaign && (
        <CampaignDetailsDialog
          campaign={selectedCampaign}
          open={!!selectedCampaign}
          onOpenChange={(open) => !open && setSelectedCampaign(null)}
          onDelete={handleCampaignDeleted}
        />
      )}
    </div>
  );
};

export default Dashboard;
