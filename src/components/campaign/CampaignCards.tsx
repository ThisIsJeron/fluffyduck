
interface CampaignCard {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface CampaignCardsProps {
  campaigns: CampaignCard[];
}

export const CampaignCards = ({ campaigns }: CampaignCardsProps) => {
  if (campaigns.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Campaign Variations</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="aspect-video relative">
              <img
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
              <p className="text-gray-600">{campaign.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
