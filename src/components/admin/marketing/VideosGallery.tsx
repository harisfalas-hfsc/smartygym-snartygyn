import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Eye, Film } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { SampleVideo, SampleVideoRef } from "./videos/SampleVideo";
import { useToast } from "@/hooks/use-toast";
import { createRoot, Root } from "react-dom/client";

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
  const [recordingProgress, setRecordingProgress] = useState(0);
  const { toast } = useToast();

  const handlePreview = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleDownload = useCallback(async (video: VideoItem) => {
    setIsRecording(true);
    setRecordingProgress(0);
    
    toast({
      title: "Recording video...",
      description: "Please wait while we capture the video. This takes about 25 seconds.",
    });

    try {
      // Create offscreen container for recording
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "360px";
      container.style.height = "640px";
      container.style.backgroundColor = "#0a0a0a";
      document.body.appendChild(container);

      // Create a canvas for capturing frames
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Render the video component
      const videoContainer = document.createElement("div");
      videoContainer.style.width = "360px";
      videoContainer.style.height = "640px";
      container.appendChild(videoContainer);

      let reactRoot: Root | null = null;
      let videoCompleted = false;

      // Create a promise that resolves when the video completes
      const videoPromise = new Promise<void>((resolve) => {
        reactRoot = createRoot(videoContainer);
        reactRoot.render(
          <SampleVideo 
            isPlaying={true} 
            onComplete={() => {
              videoCompleted = true;
              resolve();
            }} 
          />
        );
      });

      // Set up MediaRecorder with canvas stream
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.start(100);

      // Capture frames using html2canvas
      const { default: html2canvas } = await import("html2canvas");
      
      const captureFrame = async () => {
        try {
          const frameCanvas = await html2canvas(videoContainer, {
            width: 360,
            height: 640,
            scale: 1,
            backgroundColor: "#0a0a0a",
            logging: false,
            useCORS: true,
          });
          ctx.drawImage(frameCanvas, 0, 0, 360, 640);
        } catch (err) {
          console.warn("Frame capture error:", err);
        }
      };

      // Start frame capture loop
      const totalDuration = 26000; // 26 seconds
      const frameInterval = 33; // ~30fps
      let elapsed = 0;

      const captureLoop = setInterval(async () => {
        await captureFrame();
        elapsed += frameInterval;
        setRecordingProgress(Math.min((elapsed / totalDuration) * 100, 100));
        
        if (videoCompleted || elapsed >= totalDuration) {
          clearInterval(captureLoop);
        }
      }, frameInterval);

      // Wait for video to complete
      await videoPromise;
      
      // Give a small buffer to ensure last frames are captured
      await new Promise(resolve => setTimeout(resolve, 500));
      clearInterval(captureLoop);

      // Stop recording
      mediaRecorder.stop();

      // Wait for the recording to finalize
      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
      });

      // Create and download the video file
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${video.name.toLowerCase().replace(/\s+/g, "-")}-promo.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Cleanup
      if (reactRoot) {
        reactRoot.unmount();
      }
      document.body.removeChild(container);

      toast({
        title: "Video downloaded!",
        description: "Your promotional video has been saved.",
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
      setRecordingProgress(0);
    }
  }, [toast]);

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
                    disabled={isRecording}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {isRecording && (
                <div className="mt-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: `${recordingProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">Recording... {Math.round(recordingProgress)}%</span>
                </div>
              )}
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
