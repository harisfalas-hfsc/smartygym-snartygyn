import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { SampleVideo, SampleVideoRef } from "./videos/SampleVideo";
import { SocialMediaVideo, SocialMediaVideoRef } from "./videos/SocialMediaVideo";

interface VideoPlayerProps {
  video: {
    id: string;
    name: string;
    component: string;
  };
  onClose: () => void;
}

export const VideoPlayer = ({ video, onClose }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const sampleVideoRef = useRef<SampleVideoRef>(null);
  const socialMediaVideoRef = useRef<SocialMediaVideoRef>(null);

  const isSocialMediaVideo = video.component?.startsWith("social-media-day-");
  const dayNumber = isSocialMediaVideo 
    ? parseInt(video.component.replace("social-media-day-", ""), 10) 
    : 0;

  const handlePlayPause = () => {
    if (isComplete) {
      handleRestart();
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    setIsComplete(false);
    setIsPlaying(true);
    if (isSocialMediaVideo) {
      socialMediaVideoRef.current?.restart();
    } else {
      sampleVideoRef.current?.restart();
    }
  };

  const handleComplete = () => {
    setIsComplete(true);
    setIsPlaying(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{video.name} Video Preview</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          {/* Video Container - 9:16 aspect ratio */}
          <div className="relative w-full" style={{ aspectRatio: "9/16", maxHeight: "70vh" }}>
            {isSocialMediaVideo ? (
              <SocialMediaVideo
                ref={socialMediaVideoRef}
                isPlaying={isPlaying}
                onComplete={handleComplete}
                dayNumber={dayNumber}
              />
            ) : (
              <SampleVideo
                ref={sampleVideoRef}
                isPlaying={isPlaying}
                onComplete={handleComplete}
              />
            )}
          </div>

          {/* Controls overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="secondary"
                size="icon"
                onClick={handlePlayPause}
                className="h-12 w-12 rounded-full"
              >
                {isComplete ? (
                  <RotateCcw className="h-6 w-6" />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>
              {!isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRestart}
                  className="h-10 w-10 rounded-full text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
