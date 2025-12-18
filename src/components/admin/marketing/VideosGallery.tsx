import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Eye, Film, Upload, ExternalLink } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  component: "sample";
  videoUrl?: string; // URL to the actual video file in storage
}

const videos: VideoItem[] = [
  {
    id: "sample",
    name: "Sample",
    description: "Reference template video - 8 scenes showcasing SmartyGym brand",
    duration: "20-25 sec",
    component: "sample",
    // Add videoUrl here once you upload a real video file
    // videoUrl: "https://cvccrvyimyzrxcwzmxwk.supabase.co/storage/v1/object/public/promotional-videos/sample-promo.mp4"
  },
];

export const VideosGallery = () => {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const { toast } = useToast();

  const handlePreview = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleDownload = useCallback(async (video: VideoItem) => {
    if (video.videoUrl) {
      // Direct download from storage - instant!
      const link = document.createElement("a");
      link.href = video.videoUrl;
      link.download = `${video.name.toLowerCase().replace(/\s+/g, "-")}-promo.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started!",
        description: "Your video is downloading.",
      });
    } else {
      // No video file uploaded yet - direct to export page
      toast({
        title: "No video file available",
        description: "Please record and upload the video first using the Export Video page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const hasVideoFiles = videos.some(v => v.videoUrl);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promotional Videos</h3>
          <p className="text-sm text-muted-foreground">
            Preview and download marketing videos
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/export-video">
            <Upload className="h-4 w-4 mr-2" />
            Export Videos
          </Link>
        </Button>
      </div>

      {!hasVideoFiles && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No video files uploaded yet</p>
              <p className="text-xs text-muted-foreground">
                To enable instant downloads, go to the{" "}
                <Link to="/admin/export-video" className="text-primary underline">
                  Export Video page
                </Link>
                , record your video using screen capture software, then upload the MP4 file.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compact grid: 2 cols on mobile, up to 5 on large screens */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
            {/* Compact thumbnail */}
            <div 
              className="relative h-32 bg-[#0a0a0a] flex items-center justify-center"
              onClick={() => handlePreview(video)}
            >
              {/* Simple static thumbnail placeholder */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Film className="h-8 w-8 text-primary/60 mb-1" />
                <span className="text-xs text-muted-foreground">9:16</span>
              </div>
              
              {/* Status badge */}
              <div className="absolute top-2 right-2">
                {video.videoUrl ? (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    Preview only
                  </span>
                )}
              </div>
              
              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                  <Play className="h-5 w-5 text-primary fill-primary" />
                </div>
              </div>
            </div>
            
            <CardContent className="p-3">
              <h4 className="font-medium text-sm truncate mb-1">{video.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {video.description}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{video.duration}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(video);
                    }}
                    title="Preview"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(video);
                    }}
                    disabled={!video.videoUrl}
                    title={video.videoUrl ? "Download MP4" : "No video file - use Export page first"}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
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
    </div>
  );
};