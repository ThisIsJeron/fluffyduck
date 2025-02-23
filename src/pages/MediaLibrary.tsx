
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MediaLibrary = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const { data: media, isLoading } = useQuery({
    queryKey: ['media-library'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, media_url, title')
        .not('media_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Filter out invalid URLs and duplicates
      const validMedia = data?.filter(item => {
        return item.media_url && 
               item.media_url.trim() !== '' && 
               item.media_url !== 'undefined' &&
               item.media_url !== 'null';
      }) || [];

      // Remove duplicates based on media_url
      const uniqueMedia = validMedia.filter((item, index, self) =>
        index === self.findIndex((t) => t.media_url === item.media_url)
      );

      return uniqueMedia;
    }
  });

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowDialog(true);
  };

  const handlePrevious = () => {
    if (selectedImageIndex === null || !media) return;
    setSelectedImageIndex(selectedImageIndex === 0 ? media.length - 1 : selectedImageIndex - 1);
  };

  const handleNext = () => {
    if (selectedImageIndex === null || !media) return;
    setSelectedImageIndex(selectedImageIndex === media.length - 1 ? 0 : selectedImageIndex + 1);
  };

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
          ) : media && media.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aspect-square relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={item.media_url}
                    alt={item.title || 'Campaign image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Handle broken images
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-sm truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No media found
            </div>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) setSelectedImageIndex(null);
      }}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col">
          {selectedImageIndex !== null && media && media[selectedImageIndex] && (
            <>
              <div className="relative flex-1 bg-black/95">
                <img
                  src={media[selectedImageIndex].media_url}
                  alt={media[selectedImageIndex].title || 'Campaign image'}
                  className="absolute inset-0 w-full h-full object-contain"
                />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-black/40"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </div>

              <div className="bg-black/95 p-4">
                <p className="text-white text-center">
                  {media[selectedImageIndex].title || 'Untitled'}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
