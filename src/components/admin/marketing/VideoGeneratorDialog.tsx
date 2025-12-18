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
  const isGeneratingRef = useRef(false);
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false); // Prevent overlapping captures
  const startTimeRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const { toast } = useToast();
  
  // Fixed capture settings - 10fps is realistic for html2canvas
  const CAPTURE_INTERVAL_MS = 100; // 10fps
  const TOTAL_DURATION_MS = 25000; // 25 seconds
  
  // Check browser support on mount
  useEffect(() => {
    const mimeType = getSupportedMimeType();
    setBrowserSupported(mimeType !== null);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    isGeneratingRef.current = false;
    isCapturingRef.current = false;
  }, []);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsGenerating(false);
      setIsComplete(false);
      setProgress(0);
      setDownloadUrl(null);
      setIsPlaying(false);
      chunksRef.current = [];
      cleanup();
    } else {
      cleanup();
    }
  }, [open, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  const captureFrame = useCallback(async () => {
    // Skip if already capturing or not generating
    if (isCapturingRef.current || !isGeneratingRef.current) return;
    if (!containerRef.current || !ctxRef.current || !canvasRef.current) return;
    
    const elapsed = Date.now() - startTimeRef.current;
    
    // Check if we should stop
    if (elapsed >= TOTAL_DURATION_MS) {
      cleanup();
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    
    // Update progress
    const currentProgress = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 99);
    setProgress(currentProgress);
    
    // Lock - prevent overlapping captures
    isCapturingRef.current = true;
    
    try {
      const capturedCanvas = await html2canvas(containerRef.current, {
        width: 360,
        height: 640,
        scale: 3, // Output: 1080x1920
        useCORS: true,
        backgroundColor: "#0a0a0a",
        logging: false,
      });
      
      // Only draw if still generating
      if (isGeneratingRef.current && ctxRef.current) {
        ctxRef.current.drawImage(capturedCanvas, 0, 0, 1080, 1920);
      }
    } catch (err) {
      console.error("Frame capture error:", err);
    } finally {
      isCapturingRef.current = false;
    }
  }, [cleanup]);

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
    
    // Reset everything
    cleanup();
    setIsGenerating(true);
    isGeneratingRef.current = true;
    setProgress(0);
    setIsComplete(false);
    chunksRef.current = [];

    try {
      // Create canvas for video output
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Store refs for use in capture loop
      canvasRef.current = canvas;
      ctxRef.current = ctx;
      
      // Fill with black initially
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, 1080, 1920);

      // Create stream from canvas at 10fps (matches our capture rate)
      const stream = canvas.captureStream(10);
      
      // Setup MediaRecorder
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
        cleanup();
        
        if (chunksRef.current.length === 0) {
          toast({
            title: "Generation failed",
            description: "No video data was captured.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        setIsComplete(true);
        setIsGenerating(false);
        setProgress(100);
        
        toast({
          title: "Video generated!",
          description: "Your video is ready to download.",
        });
      };
      
      // Request data every 500ms
      mediaRecorder.start(500);
      
      // Record start time
      startTimeRef.current = Date.now();
      
      // Start the video animation
      setIsPlaying(true);
      videoRef.current?.restart();
      
      // Start fixed-interval capture loop
      // Using setInterval for consistent timing
      captureIntervalRef.current = setInterval(() => {
        captureFrame();
      }, CAPTURE_INTERVAL_MS);
      
      // Also capture first frame immediately
      captureFrame();
      
    } catch (error) {
      console.error("Video generation error:", error);
      cleanup();
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "Could not generate video. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast, cleanup, captureFrame]);

  const handleVideoComplete = useCallback(() => {
    setIsPlaying(false);
    cleanup();
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, [cleanup]);

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
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
    setProgress(0);
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
