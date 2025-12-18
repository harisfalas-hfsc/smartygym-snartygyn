import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Download, Eye, Film, Upload, Pencil, History, Trash2, Loader2 } from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { VideoEditDialog } from "./VideoEditDialog";
import { VideoRevertDialog } from "./VideoRevertDialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VideoItem {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  component_name: string | null;
  component_code: string | null;
  video_url: string | null;
  version: number;
  is_current: boolean;
  created_at: string;
}

export const VideosGallery = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [revertingVideo, setRevertingVideo] = useState<VideoItem | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const fetchVideos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("promotional_videos")
        .select("*")
        .eq("is_current", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handlePreview = (video: VideoItem) => {
    setSelectedVideo(video);
  };

  const handleDownload = useCallback(async (video: VideoItem) => {
    if (video.video_url) {
      const link = document.createElement("a");
      link.href = video.video_url;
      link.download = `${video.name.toLowerCase().replace(/\s+/g, "-")}-promo.mp4`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started!",
        description: "Your video is downloading.",
      });
    } else {
      toast({
        title: "No video file available",
        description: "Please record and upload the video first using the Export Video page.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDelete = async () => {
    if (!deletingVideo) return;
    
    setIsDeleting(true);
    try {
      // If video has an uploaded file, delete it from storage
      if (deletingVideo.video_url) {
        const fileName = deletingVideo.video_url.split("/").pop();
        if (fileName) {
          await supabase.storage
            .from("promotional-videos")
            .remove([fileName]);
        }
      }

      // Delete from database (this will also delete child versions due to cascade)
      const { error } = await supabase
        .from("promotional_videos")
        .delete()
        .eq("id", deletingVideo.id);

      if (error) throw error;

      toast({
        title: "Video deleted",
        description: "The video has been removed successfully.",
      });

      setDeletingVideo(null);
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Failed to delete video",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasVideoFiles = videos.some(v => v.video_url);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Promotional Videos</h3>
          <p className="text-sm text-muted-foreground">
            Preview, edit, and download marketing videos
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/export-video">
            <Upload className="h-4 w-4 mr-2" />
            Export Videos
          </Link>
        </Button>
      </div>

      {!hasVideoFiles && videos.length > 0 && (
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Film className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No video files uploaded yet</p>
              <p className="text-xs text-muted-foreground">
                To enable instant downloads, go to the{" "}
                <Link to="/admin/export-video" className="text-primary underline">
                  Export Video page
                </Link>
                , record your video using screen capture software, then upload the MP4 file.
              </p>
            </div>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No promotional videos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
              <div 
                className="relative h-32 bg-[#0a0a0a] flex items-center justify-center"
                onClick={() => handlePreview(video)}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Film className="h-8 w-8 text-primary/60 mb-1" />
                  <span className="text-xs text-muted-foreground">9:16</span>
                </div>
                
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-muted/80 text-muted-foreground px-2 py-0.5 rounded-full">
                    v{video.version}
                  </span>
                </div>
                
                <div className="absolute top-2 right-2">
                  {video.video_url ? (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      Ready
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      Preview only
                    </span>
                  )}
                </div>
                
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
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs text-muted-foreground">{video.duration}</span>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(video);
                      }}
                      title="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVideo(video);
                      }}
                      title="Edit with AI"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRevertingVideo(video);
                      }}
                      title="Version History"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(video);
                      }}
                      title="Download MP4"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingVideo(video);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={{
            id: selectedVideo.id,
            name: selectedVideo.name,
            component: "sample",
          }}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Edit Dialog */}
      {editingVideo && (
        <VideoEditDialog
          open={!!editingVideo}
          onOpenChange={(open) => !open && setEditingVideo(null)}
          video={editingVideo}
          onSuccess={fetchVideos}
        />
      )}

      {/* Revert Dialog */}
      {revertingVideo && (
        <VideoRevertDialog
          open={!!revertingVideo}
          onOpenChange={(open) => !open && setRevertingVideo(null)}
          video={revertingVideo}
          onSuccess={fetchVideos}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingVideo} onOpenChange={(open) => !open && setDeletingVideo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingVideo?.name}"? This action cannot be undone
              and will also delete all version history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
