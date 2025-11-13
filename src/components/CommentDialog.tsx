import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from "lucide-react";

interface CommentDialogProps {
  workoutId?: string;
  workoutName?: string;
  workoutType?: string;
  programId?: string;
  programName?: string;
  programType?: string;
}

export const CommentDialog = ({
  workoutId,
  workoutName,
  workoutType,
  programId,
  programName,
  programType,
}: CommentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userTier, user } = useAccessControl();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isPremium = userTier === "premium";

  const handleOpenDialog = () => {
    if (userTier === "guest") {
      toast({
        title: "Login Required",
        description: "Please login to leave comments.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "Upgrade to Premium to leave comments and join the community!",
        variant: "destructive",
      });
      navigate("/premiumbenefits");
      return;
    }

    setIsOpen(true);
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast({
        title: "Comment Required",
        description: "Please write a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please login to leave comments.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("workout_comments").insert({
        user_id: user.id,
        workout_id: workoutId || null,
        workout_name: workoutName || null,
        workout_type: workoutType || null,
        program_id: programId || null,
        program_name: programName || null,
        program_type: programType || null,
        comment_text: comment.trim(),
      });

      if (error) throw error;

      toast({
        title: "Comment Posted!",
        description: "Your comment has been added to the community.",
      });

      setComment("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show comment button to guests
  if (userTier === "guest") {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleOpenDialog}
        variant="outline"
        size="sm"
        className="gap-2 border-primary/30 hover:border-primary/50"
      >
        <MessageSquare className="h-4 w-4" />
        Comment
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave a Comment</DialogTitle>
            <DialogDescription>
              Share your thoughts about{" "}
              <span className="font-semibold text-primary">
                {workoutName || programName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Write your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none border-primary/30 focus:border-primary"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {comment.length}/1000 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
