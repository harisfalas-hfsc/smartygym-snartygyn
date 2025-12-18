import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";

interface VideoItem {
  id: number;
  day: number;
  title: string;
  duration: string;
  description: string;
}

const videos: VideoItem[] = [
  {
    id: 1,
    day: 1,
    title: "What is SmartyGym?",
    duration: "25 sec",
    description: "Brand introduction with logo, tagline, and key features"
  },
  {
    id: 2,
    day: 2,
    title: "Meet Coach Haris Falas",
    duration: "30 sec",
    description: "Coach credentials, expertise, and brand promise"
  }
];

export const VideosGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">TikTok/Reels Videos</h3>
          <p className="text-sm text-muted-foreground">
            Animated video previews - screen record to create actual videos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-square bg-gradient-to-b from-background to-muted flex items-center justify-center relative">
              <div className="text-center p-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">Day {video.day}</p>
                <p className="text-xs text-muted-foreground">{video.duration}</p>
              </div>
            </div>
            <CardContent className="p-2">
              <h4 className="font-semibold text-xs mb-1 line-clamp-1">{video.title}</h4>
              <Button 
                size="sm" 
                className="w-full h-7 text-xs"
                onClick={() => setSelectedVideo(video.day)}
              >
                <Play className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <VideoPlayer 
        day={selectedVideo} 
        onClose={() => setSelectedVideo(null)} 
      />
    </div>
  );
};
