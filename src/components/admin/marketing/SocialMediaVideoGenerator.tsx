import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, Loader2, Video } from "lucide-react";
import { toast } from "sonner";
import { socialMediaVideoScripts, VideoScript } from "@/data/socialMediaVideoScripts";
import { SocialMediaVideoRenderer } from "./videos/SocialMediaVideoRenderer";
import logoUrl from "@/assets/smarty-gym-logo.png";
import coachUrl from "@/assets/haris-falas-coach.png";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SocialMediaVideoGenerator = ({ open, onOpenChange }: Props) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SocialMediaVideoRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  const selectedScript = socialMediaVideoScripts.find(s => s.day === selectedDay) || socialMediaVideoScripts[0];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Reset state when day changes
  useEffect(() => {
    setVideoBlob(null);
    setPreviewUrl(null);
    setIsPreviewing(false);
  }, [selectedDay]);

  const startPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsPreviewing(true);

    // Initialize renderer
    rendererRef.current = new SocialMediaVideoRenderer(
      selectedScript,
      logoUrl,
      selectedScript.hasCoachPhoto ? coachUrl : undefined
    );

    // Wait for assets
    await rendererRef.current.waitForAssets();

    const startTime = performance.now();
    const totalDuration = SocialMediaVideoRenderer.getTotalDurationMs();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      
      if (elapsed >= totalDuration) {
        setIsPreviewing(false);
        return;
      }

      rendererRef.current?.drawFrame(ctx, elapsed);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [selectedScript]);

  const generateVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);
    setVideoBlob(null);
    setPreviewUrl(null);

    toast.loading(`Generating Day ${selectedDay} video...`, { id: "video-gen" });

    try {
      // Initialize renderer
      rendererRef.current = new SocialMediaVideoRenderer(
        selectedScript,
        logoUrl,
        selectedScript.hasCoachPhoto ? coachUrl : undefined
      );

      // Wait for assets to load
      const assetsReady = await rendererRef.current.waitForAssets(5000);
      if (!assetsReady) {
        throw new Error("Assets failed to load");
      }

      const fps = SocialMediaVideoRenderer.getFPS();
      const totalDuration = SocialMediaVideoRenderer.getTotalDurationMs();
      const totalFrames = Math.ceil((totalDuration / 1000) * fps);

      // Set up MediaRecorder
      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingPromise = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      });

      mediaRecorder.start();

      // Render all frames
      for (let frame = 0; frame <= totalFrames; frame++) {
        const tMs = (frame / fps) * 1000;
        rendererRef.current.drawFrame(ctx, tMs);
        
        // Small delay to allow MediaRecorder to capture frames
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      mediaRecorder.stop();
      const blob = await recordingPromise;

      setVideoBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
      toast.success(`Day ${selectedDay} video ready!`, { id: "video-gen" });
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("Failed to generate video", { id: "video-gen" });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDay, selectedScript]);

  const downloadVideo = useCallback(() => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartygym-day-${selectedDay}-${selectedScript.title.toLowerCase().replace(/\s+/g, "-")}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Video downloaded!");
  }, [videoBlob, selectedDay, selectedScript.title]);

  const { width, height } = SocialMediaVideoRenderer.getVideoDimensions();
  const displayScale = 0.25; // Scale down for preview

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Generate Social Media Videos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Day Selector */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Day:</label>
            <Select
              value={selectedDay.toString()}
              onValueChange={(v) => setSelectedDay(parseInt(v))}
              disabled={isGenerating || isPreviewing}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {socialMediaVideoScripts.map((script) => (
                  <SelectItem key={script.day} value={script.day.toString()}>
                    Day {script.day} - {script.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Script Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Script Preview - Day {selectedDay}: {selectedScript.title}</h4>
            <div className="grid grid-cols-2 gap-3">
              {selectedScript.cards.map((card, i) => (
                <div key={i} className="bg-background rounded p-3 border">
                  <p className="text-xs text-muted-foreground mb-1">Card {i + 1}</p>
                  <p className="font-semibold text-sm">{card.line1}</p>
                  {card.line2 && <p className="text-xs text-muted-foreground">{card.line2}</p>}
                </div>
              ))}
            </div>
            {selectedScript.hasCoachPhoto && (
              <p className="text-xs text-primary mt-2">📸 This video includes the coach photo</p>
            )}
          </div>

          {/* Canvas Preview */}
          <div className="flex justify-center">
            <div 
              className="bg-black rounded-lg overflow-hidden border-2 border-muted"
              style={{ width: width * displayScale, height: height * displayScale }}
            >
              <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                  width: width * displayScale,
                  height: height * displayScale,
                }}
              />
            </div>
          </div>

          {/* Generated Video Player */}
          {previewUrl && (
            <div className="flex justify-center">
              <video
                src={previewUrl}
                controls
                className="rounded-lg border-2 border-primary"
                style={{ maxWidth: width * displayScale, maxHeight: height * displayScale }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={startPreview}
              disabled={isGenerating || isPreviewing}
              className="gap-2"
            >
              <Play className="w-4 h-4" />
              Preview
            </Button>
            
            <Button
              onClick={generateVideo}
              disabled={isGenerating || isPreviewing}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Generate Video
                </>
              )}
            </Button>

            {videoBlob && (
              <Button
                variant="secondary"
                onClick={downloadVideo}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download .webm
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
