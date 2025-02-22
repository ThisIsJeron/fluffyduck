
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";

const MediaLibrary = () => {
  const { data: media, isLoading } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, media_url, title')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Media Library</h1>
          </div>

          {isLoading ? (
            <div className="text-center py-12">Loading media...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media?.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aspect-square relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <img
                    src={item.media_url}
                    alt={item.title || 'Campaign image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MediaLibrary;
