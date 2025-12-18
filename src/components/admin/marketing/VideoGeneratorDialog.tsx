import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, X, RefreshCw, AlertTriangle } from "lucide-react";
import { SampleVideo, SampleVideoRef } from "./videos/SampleVideo";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";

// Get the best supported MIME type for video recording
const getSupportedMimeType = (): string | null => {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || null;
};

interface VideoGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoName: string;
}

export const VideoGeneratorDialog = ({
  open,
  onOpenChange,
  videoName,
}: VideoGeneratorDialogProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  
  const videoRef = useRef<SampleVideoRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isGeneratingRef = useRef(false); // Fix stale closure
  const { toast } = useToast();
  
  // Check browser support on mount
  useEffect(() => {
    const mimeType = getSupportedMimeType();
    setBrowserSupported(mimeType !== null);
  }, []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsGenerating(false);
      setIsComplete(false);
      setProgress(0);
      setDownloadUrl(null);
      setIsPlaying(false);
      chunksRef.current = [];
      isGeneratingRef.current = false;
    }
  }, [open]);

  const startGeneration = useCallback(async () => {
    if (!containerRef.current) return;
    
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support video recording. Try Chrome or Firefox.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    isGeneratingRef.current = true;
    setProgress(0);
    setIsComplete(false);
    chunksRef.current = [];

    try {
      // Create a canvas to capture frames
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Create stream from canvas
      const stream = canvas.captureStream(30);
      
      // Setup MediaRecorder with compatible codec
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000,
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsComplete(true);
        setIsGenerating(false);
        isGeneratingRef.current = false;
        setProgress(100);
        
        toast({
          title: "Video generated!",
          description: "Your video is ready to download.",
        });
      };
      
      mediaRecorder.start(100);
      
      // Start playing the video
      setIsPlaying(true);
      videoRef.current?.restart();
      
      // Capture frames every 33ms (30fps)
      const totalDuration = 25000; // 25 seconds
      const startTime = Date.now();
      
      const captureFrame = async () => {
        // Use ref to avoid stale closure
        if (!containerRef.current || !isGeneratingRef.current) return;
        
        const elapsed = Date.now() - startTime;
        const currentProgress = Math.min((elapsed / totalDuration) * 100, 99);
        setProgress(currentProgress);
        
        try {
          const capturedCanvas = await html2canvas(containerRef.current, {
            width: 360,
            height: 640,
            scale: 3,
            useCORS: true,
            backgroundColor: "#0a0a0a",
            logging: false,
          });
          
          ctx.drawImage(capturedCanvas, 0, 0, 1080, 1920);
        } catch (err) {
          console.error("Frame capture error:", err);
        }
        
        if (elapsed < totalDuration && isGeneratingRef.current) {
          requestAnimationFrame(captureFrame);
        }
      };
      
      captureFrame();
      
    } catch (error) {
      console.error("Video generation error:", error);
      setIsGenerating(false);
      isGeneratingRef.current = false;
      toast({
        title: "Generation failed",
        description: "Could not generate video. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleVideoComplete = useCallback(() => {
    setIsPlaying(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${videoName.toLowerCase().replace(/\s+/g, "-")}-promo.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started!",
        description: "Your video is downloading.",
      });
    }
  };

  const handleRetry = () => {
    setIsComplete(false);
    setDownloadUrl(null);
    setProgress(0);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    startGeneration();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Video</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Browser support warning */}
          {!browserSupported && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Your browser doesn't support video recording. Try Chrome or Firefox.</span>
            </div>
          )}
          
          {/* Video container */}
          <div 
            ref={containerRef}
            className="relative mx-auto rounded-lg overflow-hidden shadow-2xl"
            style={{ width: 360, height: 640, backgroundColor: "#0a0a0a" }}
          >
            <SampleVideo
              ref={videoRef}
              isPlaying={isPlaying}
              onComplete={handleVideoComplete}
            />
          </div>
          
          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating video...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Please wait, this takes about 25 seconds
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex justify-center gap-2">
            {!isGenerating && !isComplete && (
              <Button onClick={startGeneration} disabled={!browserSupported} className="gap-2">
                <Loader2 className="h-4 w-4" />
                Generate Video
              </Button>
            )}
            
            {isGenerating && (
              <Button disabled className="gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </Button>
            )}
            
            {isComplete && downloadUrl && (
              <>
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="h-4 w-4" />
                  Download Video
                </Button>
                <Button variant="outline" onClick={handleRetry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
