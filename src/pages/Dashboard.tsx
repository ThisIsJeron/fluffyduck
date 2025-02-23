import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Eye, CheckCircle } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/header";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { CampaignDetailsDialog } from "@/components/campaign/CampaignDetailsDialog";
import { useState } from "react";
import { format, isBefore, isAfter, startOfToday, isWithinInterval } from "date-fns";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
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

    // First filter by past/current status
    const isValidTimeframe = isPastRoute
      ? isBefore(campaign.end_date, today)
      : isAfter(campaign.end_date, today);

    // Then filter by platform if one is selected
    const isValidPlatform = selectedPlatform === "all"
      ? true
      : campaign.platforms?.includes(selectedPlatform);

    return isValidTimeframe && isValidPlatform;
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
        whileHover={{ scale: 1.05, rotate: 2 }}
        className="relative w-full inline-block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setSelectedCampaign(campaign)}
        style={{ gridRowEnd: `span ${Math.floor(Math.random() * 2) + 1}` }}
      >
        {isActive && (
          <div className="absolute top-2 right-2 z-100">
            <Badge className="bg-green-500 text-white flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Active
            </Badge>
          </div>
        )}
        <motion.img
          src={campaign.media_url}
          alt={campaign.title}
          className="h-full object-cover"
          whileHover={{ scale: 1.1 }}
        />

        <div className="p-4 flex justify-between ">
          <h3 className="font-medium mb-2">{campaign.title}</h3>
          {/* <div className="text-sm text-gray-500 mb-2">
            {campaign.end_date && (
              <p>
                {isPastRoute
                  ? `Ended ${format(campaign.end_date, 'MMM dd, yyyy')}`
                  : `Ends ${format(campaign.end_date, 'MMM dd, yyyy')}`
                }
              </p>
            )}
          </div> */}
          {renderMetrics(campaign)}
        </div>
      </motion.div>
    );
  };

  const ChannelSelector = () => {
    return (
      <div className="w-48">
        <Select
          value={selectedPlatform}
          onValueChange={setSelectedPlatform}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className=" min-h-screen bg-[#F8F8FA]">
      <TopHeader />
      <main className="grid grid-cols-7 gap-2 top-[80px]" style={{ height: "calc(100vh - 80px)" }}>
        <div className="w-full h-full col-span-2">
          <Sidebar />
        </div>
        <div className="w-full h-full col-span-5 overflow-y-auto p-10 pl-4" >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">
              {isPastRoute ? "Past Campaigns" : "Current & Upcoming Campaigns"}
            </h1>
            <ChannelSelector />
          </div>
          {isLoading ? (
            <div className="text-center py-12">Loading campaigns...</div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
              {filteredCampaigns.map((campaign) => (
                <div key={campaign.id} className="mb-4 break-inside-avoid">
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {isPastRoute ? "No past campaigns" : "No upcoming campaigns"}
            </div>
          )}
        </div>
      </main>

      {
        selectedCampaign && (
          <CampaignDetailsDialog
            campaign={selectedCampaign}
            open={!!selectedCampaign}
            onOpenChange={(open) => !open && setSelectedCampaign(null)}
            onDelete={handleCampaignDeleted}
          />
        )
      }
    </div >
  );
};

export default Dashboard;
