import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, Loader2, X, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CanvasVideoRenderer,
  VIDEO_DURATION_MS,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "./videos/CanvasVideoRenderer";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

const getSupportedMimeType = (): string | null => {
  const types = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp8", "video/webm"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || null;
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
  const [browserSupported, setBrowserSupported] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasVideoRenderer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);

  const { toast } = useToast();

  // Check browser support
  useEffect(() => {
    setBrowserSupported(getSupportedMimeType() !== null);
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    isRecordingRef.current = false;
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (mediaRecorderRef.current?.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  }, []);

  // Initialize on dialog open
  useEffect(() => {
    if (open) {
      setIsGenerating(false);
      setIsComplete(false);
      setProgress(0);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      cleanup();

      // Create renderer with logo
      rendererRef.current = new CanvasVideoRenderer(smartyGymLogo);

      // Draw initial frame after a short delay for logo to load
      setTimeout(() => {
        const canvas = canvasRef.current;
        const renderer = rendererRef.current;
        if (canvas && renderer) {
          canvas.width = VIDEO_WIDTH;
          canvas.height = VIDEO_HEIGHT;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            renderer.drawFrame(ctx, 0);
          }
        }
      }, 500);
    } else {
      cleanup();
    }

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startGeneration = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("No canvas");
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      toast({
        title: "Browser not supported",
        description: "Try Chrome or Firefox.",
        variant: "destructive",
      });
      return;
    }

    // Create fresh renderer
    const renderer = new CanvasVideoRenderer(smartyGymLogo);
    rendererRef.current = renderer;

    // Wait for logo
    console.log("⏳ Waiting for logo to load...");
    await renderer.waitForLogo();
    console.log("✅ Logo ready:", renderer.isReady());

    // Reset state
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
    setProgress(0);
    setIsGenerating(true);
    isRecordingRef.current = true;
    chunksRef.current = [];

    // Setup canvas
    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;
    const ctx = canvas.getContext("2d", { alpha: false });
    
    if (!ctx) {
      console.error("No context");
      setIsGenerating(false);
      return;
    }

    // Draw first frame
    renderer.drawFrame(ctx, 0);

    // Create stream and recorder
    const stream = canvas.captureStream(VIDEO_FPS);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 8_000_000,
    });
    mediaRecorderRef.current = mediaRecorder;

    // Collect chunks
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
        console.log("📦 Chunk received:", e.data.size, "bytes");
      }
    };

    // Handle recording stop
    mediaRecorder.onstop = () => {
      console.log("🛑 Recording stopped, chunks:", chunksRef.current.length);
      
      if (chunksRef.current.length === 0) {
        setIsGenerating(false);
        toast({
          title: "Generation failed",
          description: "No video data captured.",
          variant: "destructive",
        });
        return;
      }

      const blob = new Blob(chunksRef.current, { type: mimeType });
      console.log("📼 Video blob size:", blob.size);
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
      setIsGenerating(false);
      setProgress(100);

      toast({
        title: "Video generated!",
        description: "Ready to download.",
      });
    };

    // Start recording with frequent data collection
    mediaRecorder.start(100);
    console.log("🎬 Recording started");

    // Animation loop using requestAnimationFrame
    const startTime = performance.now();

    const animate = () => {
      if (!isRecordingRef.current) {
        return;
      }

      const elapsed = performance.now() - startTime;
      const pct = Math.min((elapsed / VIDEO_DURATION_MS) * 100, 100);
      setProgress(pct);

      // Draw current frame
      renderer.drawFrame(ctx, elapsed);

      if (elapsed < VIDEO_DURATION_MS) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Done - stop recording
        console.log("✅ Animation complete");
        isRecordingRef.current = false;
        
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

  }, [toast, downloadUrl, cleanup]);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const ext = "webm";
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${videoName.toLowerCase().replace(/\s+/g, "-")}-promo.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started!",
      description: "Your video is downloading.",
    });
  };

  const handleRetry = () => {
    cleanup();
    setIsComplete(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
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
          {!browserSupported && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Browser not supported. Try Chrome or Firefox.</span>
            </div>
          )}

          <div className="relative mx-auto rounded-lg overflow-hidden shadow-2xl w-[360px] h-[640px] bg-black">
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              aria-label="Video preview"
            />
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Please wait ~25 seconds
              </p>
            </div>
          )}

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

            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isGenerating}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
