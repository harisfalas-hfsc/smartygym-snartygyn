import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, RotateCcw } from "lucide-react";
import { Day1Video } from "./videos/Day1Video";
import { Day2Video } from "./videos/Day2Video";

interface VideoPlayerProps {
  day: number | null;
  onClose: () => void;
}

const videoDurations: Record<number, number> = {
  1: 25000, // 25 seconds
  2: 30000, // 30 seconds
};

export const VideoPlayer = ({ day, onClose }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const duration = day ? videoDurations[day] || 25000 : 25000;

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
      <DialogContent className="max-w-[400px] p-0 bg-black overflow-hidden">
        <div className="relative aspect-[9/16] bg-background">
          {renderVideo()}
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 bg-black/50 hover:bg-black/70 text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress bar */}
            <div className="h-1 bg-white/30 rounded-full mb-3 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleRestart}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-card">
          <p className="text-xs text-muted-foreground text-center">
            💡 Use screen recording to capture this animation as a video file
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
