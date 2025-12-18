import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, Upload, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { SampleVideo, SampleVideoRef } from "@/components/admin/marketing/videos/SampleVideo";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ExportVideoPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const videoRef = useRef<SampleVideoRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handlePlayPause = () => {
    if (!isPlaying) {
      videoRef.current?.restart();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    videoRef.current?.restart();
    setIsPlaying(true);
  };

  const handleVideoComplete = () => {
    setIsPlaying(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileName = `sample-promo-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from("promotional-videos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("promotional-videos")
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
      
      toast({
        title: "Video uploaded!",
        description: "Your video file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Export Video</h1>
            <p className="text-muted-foreground">
              Preview, record, and upload promotional videos
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>
                Play the video to preview it, then record using screen capture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video container - 9:16 aspect ratio */}
              <div className="relative mx-auto w-full max-w-[300px] aspect-[9/16] bg-[#0a0a0a] rounded-lg overflow-hidden shadow-lg">
                <SampleVideo 
                  ref={videoRef}
                  isPlaying={isPlaying} 
                  onComplete={handleVideoComplete}
                />
              </div>
              
              {/* Controls */}
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestart}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instructions & Upload */}
          <div className="space-y-6">
            {/* Recording Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  How to Record
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-sm">
                  <li>
                    <span className="font-medium">Open screen recording software</span>
                    <p className="text-muted-foreground ml-5">
                      Use OBS Studio (free), ScreenFlow, Loom, or your phone's screen recorder
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Set recording area</span>
                    <p className="text-muted-foreground ml-5">
                      Select only the video preview area (9:16 ratio)
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Start recording, then play video</span>
                    <p className="text-muted-foreground ml-5">
                      Click "Play" above and let it run until complete
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Stop recording and export as MP4</span>
                    <p className="text-muted-foreground ml-5">
                      Save your recording in MP4 format for best compatibility
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Upload the video below</span>
                    <p className="text-muted-foreground ml-5">
                      This makes it available for instant download in the gallery
                    </p>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Recorded Video</CardTitle>
                <CardDescription>
                  Upload your screen recording (MP4, WebM - max 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Select Video File
                    </>
                  )}
                </Button>

                {uploadedUrl && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div className="space-y-2 flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-400">
                          Video uploaded successfully!
                        </p>
                        <div className="text-xs text-muted-foreground break-all">
                          <span className="font-medium">URL:</span>
                          <code className="ml-1 bg-muted p-1 rounded text-[10px]">
                            {uploadedUrl}
                          </code>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Copy this URL and add it to the <code className="bg-muted px-1 rounded">videoUrl</code> field 
                          in <code className="bg-muted px-1 rounded">VideosGallery.tsx</code> to enable instant downloads.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}