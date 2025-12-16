import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Video } from "lucide-react";
import { getYouTubeThumbnail } from "@/utils/youtube";
import ExerciseVideoModal from "./ExerciseVideoModal";
import { Skeleton } from "@/components/ui/skeleton";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  category: string;
  display_order: number;
}

const ExerciseVideoGrid = () => {
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['exercise-library-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_library_videos')
        .select('*')
        .eq('is_visible', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExerciseVideo[];
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Video className="h-12 w-12 mb-4 opacity-50" />
        <p>No exercise videos available yet.</p>
        <p className="text-sm">Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {videos.map((video) => (
          <div
            key={video.id}
            className="group cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={getYouTubeThumbnail(video.youtube_video_id, 'mq')}
                alt={video.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-primary/90 rounded-full p-3">
                  <Play className="h-6 w-6 text-primary-foreground fill-current" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {video.category}
              </div>
            </div>
            <p className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
              {video.title}
            </p>
          </div>
        ))}
      </div>

      <ExerciseVideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        videoId={selectedVideo?.youtube_video_id || null}
        title={selectedVideo?.title || ''}
        description={selectedVideo?.description}
      />
    </>
  );
};

export default ExerciseVideoGrid;
