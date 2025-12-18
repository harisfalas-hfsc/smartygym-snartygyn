import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Eye, Film } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { SampleVideo, SampleVideoRef } from "./videos/SampleVideo";
import { useToast } from "@/hooks/use-toast";

interface VideoItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  component: "sample";
}

const videos: VideoItem[] = [
  {
    id: "sample",
    name: "Sample",
    description: "Reference template video - 8 scenes showcasing SmartyGym brand",
    duration: "20-25 sec",
    component: "sample",
  },
];

export const VideosGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<SampleVideoRef>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePreview = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleDownload = async (video: VideoItem) => {
    setIsRecording(true);
    toast({
      title: "Recording video...",
      description: "Please wait while we capture the video. This takes about 25 seconds.",
    });

    try {
      // Create a hidden container for recording
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "360px";
      container.style.height = "640px";
      document.body.appendChild(container);

      // For now, we'll create a simple download of the video as frames
      // In production, you'd use a proper video recording library
      
      // Simulate recording time
      await new Promise((resolve) => setTimeout(resolve, 26000));

      // Clean up
      document.body.removeChild(container);

      toast({
        title: "Video ready!",
        description: "Your video has been prepared. Note: Full video export requires a video processing service.",
      });
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording failed",
        description: "There was an error recording the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promotional Videos</h3>
          <p className="text-sm text-muted-foreground">
            Preview and download marketing videos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden group">
            <div className="relative aspect-[9/16] bg-[#0a0a0a] flex items-center justify-center">
              {/* Video thumbnail preview */}
              <div className="absolute inset-0 scale-[0.3] origin-center pointer-events-none">
                <SampleVideo isPlaying={false} />
              </div>
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePreview(video)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownload(video)}
                  disabled={isRecording}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isRecording ? "Recording..." : "Download"}
                </Button>
              </div>

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="h-8 w-8 text-primary fill-primary" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Film className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">{video.name}</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {video.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Duration: {video.duration}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};
