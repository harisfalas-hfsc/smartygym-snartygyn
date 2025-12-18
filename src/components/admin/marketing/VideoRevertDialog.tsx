import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface VideoVersion {
  id: string;
  name: string;
  version: number;
  created_at: string;
  is_current: boolean;
}

interface VideoRevertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: {
    id: string;
    name: string;
  };
  onSuccess: () => void;
}

export const VideoRevertDialog = ({
  open,
  onOpenChange,
  video,
  onSuccess,
}: VideoRevertDialogProps) => {
  const [versions, setVersions] = useState<VideoVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverting, setIsReverting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchVersionHistory();
    }
  }, [open, video.id]);

  const fetchVersionHistory = async () => {
    setIsLoading(true);
    try {
      // Find the root video by traversing parent_version_id
      let rootId = video.id;
      let currentVideo = video.id;
      
      // Get all versions that share the same lineage
      const { data: allVersions, error } = await supabase
        .from("promotional_videos")
        .select("id, name, version, created_at, is_current, parent_version_id")
        .or(`id.eq.${video.id},parent_version_id.eq.${video.id}`)
        .order("version", { ascending: false });

      if (error) throw error;

      // Also fetch versions where current video is a child
      const { data: parentVersions, error: parentError } = await supabase
        .from("promotional_videos")
        .select("id, name, version, created_at, is_current, parent_version_id")
        .eq("id", video.id)
        .single();

      if (parentError && parentError.code !== "PGRST116") throw parentError;

      // Build complete version history by following parent chain
      const versionMap = new Map<string, VideoVersion>();
      
      if (allVersions) {
        allVersions.forEach((v) => versionMap.set(v.id, v));
      }

      // Follow parent chain to get all ancestors
      if (parentVersions?.parent_version_id) {
        let parentId: string | null = parentVersions.parent_version_id;
        while (parentId) {
          const { data: parent } = await supabase
            .from("promotional_videos")
            .select("id, name, version, created_at, is_current, parent_version_id")
            .eq("id", parentId)
            .single();
          
          if (parent) {
            versionMap.set(parent.id, parent);
            parentId = parent.parent_version_id;
          } else {
            break;
          }
        }
      }

      const sortedVersions = Array.from(versionMap.values())
        .sort((a, b) => b.version - a.version);

      setVersions(sortedVersions);
    } catch (error) {
      console.error("Error fetching version history:", error);
      toast({
        title: "Failed to load version history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (versionId: string) => {
    setIsReverting(versionId);
    try {
      // Get the version to restore
      const { data: versionToRestore, error: fetchError } = await supabase
        .from("promotional_videos")
        .select("*")
        .eq("id", versionId)
        .single();

      if (fetchError) throw fetchError;

      // Mark current version as not current
      await supabase
        .from("promotional_videos")
        .update({ is_current: false })
        .eq("id", video.id);

      // Mark the reverted version as current
      await supabase
        .from("promotional_videos")
        .update({ is_current: true, updated_at: new Date().toISOString() })
        .eq("id", versionId);

      toast({
        title: "Video reverted successfully!",
        description: `Restored to version ${versionToRestore.version}`,
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error reverting video:", error);
      toast({
        title: "Failed to revert video",
        variant: "destructive",
      });
    } finally {
      setIsReverting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Version History: {video.name}
          </DialogTitle>
          <DialogDescription>
            View and restore previous versions of this video. Click on any
            version to restore it.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No version history available
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    version.is_current
                      ? "bg-primary/5 border-primary/20"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Version {version.version}</span>
                      {version.is_current && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(version.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  
                  {!version.is_current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevert(version.id)}
                      disabled={isReverting !== null}
                    >
                      {isReverting === version.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5 mr-1" />
                          Restore
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
