import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: {
    id: string;
    name: string;
    component_code?: string | null;
  };
  onSuccess: () => void;
}

export const VideoEditDialog = ({
  open,
  onOpenChange,
  video,
  onSuccess,
}: VideoEditDialogProps) => {
  const [instructions, setInstructions] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!instructions.trim()) {
      toast({
        title: "Please enter instructions",
        description: "Tell us what changes you'd like to make to the video.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Call the AI edge function to edit the video
      const { data, error } = await supabase.functions.invoke("edit-video", {
        body: {
          videoId: video.id,
          instructions: instructions.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "Video edited successfully!",
        description: "A new version has been created with your changes.",
      });

      setInstructions("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error editing video:", error);
      toast({
        title: "Failed to edit video",
        description: error instanceof Error ? error.message : "An error occurred while processing your request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Edit Video: {video.name}
          </DialogTitle>
          <DialogDescription>
            Describe the changes you want to make. The AI will modify the video
            based on your instructions. A new version will be created, and you
            can always revert to previous versions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="e.g., Change the tagline to 'Your Fitness Journey Starts Here' or 'Make the logo appear for 3 seconds instead of 2'"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none"
            disabled={isProcessing}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Press Enter to submit, or Shift+Enter for new line
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
