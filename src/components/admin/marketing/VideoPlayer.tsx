import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, RotateCcw, Download, Loader2 } from "lucide-react";
import { Day1Video } from "./videos/Day1Video";
import { Day2Video } from "./videos/Day2Video";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  day: number | null;
  autoDownload?: boolean;
  onClose: () => void;
}

const videoDurations: Record<number, number> = {
  1: 20000, // 20 seconds
  2: 20000, // 20 seconds
};

export const VideoPlayer = ({ day, autoDownload, onClose }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const duration = day ? videoDurations[day] || 20000 : 20000;

  useEffect(() => {
    if (day) {
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [day]);

  useEffect(() => {
    if (!isPlaying || !day) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 100;
        if (newTime >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return newTime;
      });
      setProgress((prev) => {
        const newProgress = prev + (100 / (duration / 100));
        return Math.min(newProgress, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, day, duration]);

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleDownload = async () => {
    if (!videoContainerRef.current) return;
    
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Recording video... Please wait until it completes.",
    });

    try {
      // Get the video container element
      const element = videoContainerRef.current;
      
      // Create a canvas stream from the element
      const canvas = document.createElement('canvas');
      canvas.width = 1080; // TikTok resolution
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Cannot get canvas context');

      // Set up MediaRecorder
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `smartygym-day${day}-video.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsRecording(false);
        toast({
          title: "Download Complete",
          description: "Video saved! Convert to MP4 if needed for TikTok/Reels.",
        });
      };

      // Start recording
      mediaRecorder.start();
      
      // Reset and play the video
      setCurrentTime(0);
      setProgress(0);
      setIsPlaying(true);

      // Capture frames using html2canvas approach
      const captureFrame = async () => {
        try {
          const { default: html2canvas } = await import('html2canvas');
          const capturedCanvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
          });
          ctx.drawImage(capturedCanvas, 0, 0, canvas.width, canvas.height);
        } catch {
          // Fallback: just fill with background color
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      // Capture frames every 33ms (30fps)
      const frameInterval = setInterval(captureFrame, 33);

      // Stop recording after video duration + buffer
      setTimeout(() => {
        clearInterval(frameInterval);
        mediaRecorder.stop();
        setIsPlaying(false);
      }, duration + 500);

    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
      toast({
        title: "Recording Failed",
        description: "Use screen recording software instead (OBS, QuickTime, or phone screen record).",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!day || !autoDownload) return;

    const t = window.setTimeout(() => {
      // Trigger recording/download automatically from the gallery button
      if (!isRecording) void handleDownload();
    }, 350);

    return () => window.clearTimeout(t);
    // Intentionally omit handleDownload to avoid effect loops while recording.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, autoDownload, isRecording]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `0:${seconds.toString().padStart(2, '0')}`;
  };


  const renderVideo = () => {
    if (!day) return null;
    switch (day) {
      case 1:
        return <Day1Video currentTime={currentTime} isPlaying={isPlaying} />;
      case 2:
        return <Day2Video currentTime={currentTime} isPlaying={isPlaying} />;
      default:
        return <div className="text-muted-foreground">Video not available</div>;
    }
  };

  return (
    <Dialog open={day !== null} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[280px] max-h-[85vh] p-0 bg-black overflow-hidden">
        <div ref={videoContainerRef} className="relative aspect-[9/16] bg-background">
          {renderVideo()}
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            {/* Progress bar */}
            <div className="h-0.5 bg-white/30 rounded-full mb-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-6 w-6"
                  onClick={handlePlayPause}
                  disabled={isRecording}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-6 w-6"
                  onClick={handleRestart}
                  disabled={isRecording}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-6 w-6"
                  onClick={handleDownload}
                  disabled={isRecording}
                  title="Download Video"
                >
                  {isRecording ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
