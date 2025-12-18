import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, FileText } from "lucide-react";
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-[9/16] bg-gradient-to-b from-background to-muted flex items-center justify-center relative">
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold">Day {video.day}</p>
                <p className="text-sm text-muted-foreground">{video.duration}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-1">{video.title}</h4>
              <p className="text-xs text-muted-foreground mb-3">{video.description}</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setSelectedVideo(video.day)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
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
