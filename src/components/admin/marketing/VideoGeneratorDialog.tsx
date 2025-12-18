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

// Get the best supported MIME type for video recording
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

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isGeneratingRef = useRef(false);
  const rendererRef = useRef<CanvasVideoRenderer | null>(null);

  const { toast } = useToast();

  const cleanup = useCallback(() => {
    isGeneratingRef.current = false;

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

  // Check browser support on mount
  useEffect(() => {
    const mimeType = getSupportedMimeType();
    setBrowserSupported(mimeType !== null);
  }, []);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setIsGenerating(false);
      setIsComplete(false);
      setProgress(0);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
      cleanup();

      rendererRef.current = new CanvasVideoRenderer();

      // Ensure preview canvas is configured
      if (previewCanvasRef.current) {
        previewCanvasRef.current.width = VIDEO_WIDTH;
        previewCanvasRef.current.height = VIDEO_HEIGHT;

        const ctx = previewCanvasRef.current.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "hsl(0 0% 4%)";
          ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
          rendererRef.current.drawFrame(ctx, 0);
        }
      }
    } else {
      cleanup();
    }

    return () => {
      // when closing/unmounting
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const startGeneration = useCallback(async () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support video recording. Try Chrome or Firefox.",
        variant: "destructive",
      });
      return;
    }

    const renderer = rendererRef.current ?? new CanvasVideoRenderer();
    rendererRef.current = renderer;

    // Reset everything
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsComplete(false);
    setProgress(0);
    setIsGenerating(true);
    isGeneratingRef.current = true;
    chunksRef.current = [];

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      await renderer.ready();

      // Draw first frame
      renderer.drawFrame(ctx, 0);

      const stream = canvas.captureStream(VIDEO_FPS);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          setIsGenerating(false);
          toast({
            title: "Generation failed",
            description: "No video data was captured.",
            variant: "destructive",
          });
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

      mediaRecorder.start(500);

      const frameDurationMs = 1000 / VIDEO_FPS;
      const totalFrames = Math.ceil(VIDEO_DURATION_MS / frameDurationMs);
      const startAt = performance.now();

      for (let frame = 0; frame < totalFrames; frame++) {
        if (!isGeneratingRef.current) break;

        const tMs = frame * frameDurationMs;
        renderer.drawFrame(ctx, tMs);

        const pct = Math.min((tMs / VIDEO_DURATION_MS) * 100, 99);
        setProgress(pct);

        const nextAt = startAt + (frame + 1) * frameDurationMs;
        const sleepFor = Math.max(0, nextAt - performance.now());
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, sleepFor));
      }

      setProgress(100);
      isGeneratingRef.current = false;

      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
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
  }, [toast, cleanup, downloadUrl]);

  const handleDownload = () => {
    if (!downloadUrl) return;

    const mimeType = getSupportedMimeType() ?? "video/webm";
    const ext = mimeType.includes("webm") ? "webm" : "mp4";

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
              <span className="text-sm">
                Your browser doesn't support video recording. Try Chrome or Firefox.
              </span>
            </div>
          )}

          {/* Video canvas (9:16 preview; recorded at 1080x1920) */}
          <div className="relative mx-auto rounded-lg overflow-hidden shadow-2xl w-[360px] h-[640px] bg-background">
            <canvas
              ref={previewCanvasRef}
              className="w-full h-full"
              aria-label="Promotional video preview"
            />
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generating video...</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">Please wait, this takes about 25 seconds</p>
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
