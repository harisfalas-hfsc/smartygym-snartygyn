import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, CheckCircle2, Crown, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";
import { CommentDialog } from "@/components/CommentDialog";
import { ScheduleWorkoutDialog } from "@/components/ScheduleWorkoutDialog";
import { useScheduledWorkoutForContent } from "@/hooks/useScheduledWorkouts";
import { format } from "date-fns";

interface ProgramInteractionsProps {
  programId: string;
  programType: string;
  programName: string;
  isFreeContent: boolean;
}

export const ProgramInteractions = ({ programId, programType, programName, isFreeContent }: ProgramInteractionsProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userTier, canInteract } = useAccessControl();
  const navigate = useNavigate();

  const { scheduledWorkout, refetch: refetchScheduled } = useScheduledWorkoutForContent(programId, 'program');

  // Determine content type for permission check
  const contentType = isFreeContent ? "free-program" : "program";
  const canUserInteract = canInteract(contentType, programId);

  useEffect(() => {
    loadInteractions();
    markAsViewed();
  }, [programId]);

  const loadInteractions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('program_interactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setIsFavorite(data.is_favorite);
        setIsCompleted(data.is_completed);
        setIsOngoing(data.is_ongoing || false);
        setRating(data.rating || 0);
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('program_interactions')
        .upsert({
          user_id: session.user.id,
          program_id: programId,
          program_type: programType,
          program_name: programName,
          has_viewed: true,
        }, {
          onConflict: 'user_id,program_id,program_type'
        });
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const showUpgradePrompt = () => {
    const message = isFreeContent && userTier === "subscriber" 
      ? "This feature is available for free content. Please check your subscription status."
      : "Upgrade to Premium to favorite, rate, and track this program!";
    
    toast({
      title: "Premium Feature",
      description: message,
      action: (
        <Button size="sm" onClick={() => navigate("/premiumbenefits")}>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade
        </Button>
      ),
    });
  };

  const toggleFavorite = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newFavoriteStatus = !isFavorite;
      
      const { error } = await supabase
        .from('program_interactions')
        .update({ is_favorite: newFavoriteStatus })
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType);

      if (error) throw error;

      setIsFavorite(newFavoriteStatus);
      toast({
        title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
        description: newFavoriteStatus ? "Program saved to your favorites" : "Program removed from favorites",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  };

  const startProgram = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('program_interactions')
        .update({ is_ongoing: true, is_completed: false })
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType);

      if (error) throw error;

      await supabase.from('user_activity_log').insert({
        user_id: session.user.id,
        content_type: programType,
        item_id: programId,
        item_name: programName,
        action_type: programType === 'personal_training' ? 'pt_started' : 'program_started',
        activity_date: new Date().toISOString().split('T')[0],
      });

      setIsOngoing(true);
      setIsCompleted(false);
      
      toast({
        title: "Program Started! 🔥",
        description: "Let's do this! Stay consistent and track your progress.",
      });
    } catch (error) {
      console.error('Error starting program:', error);
      toast({
        title: "Error",
        description: "Failed to start program",
        variant: "destructive",
      });
    }
  };

  const markComplete = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('program_interactions')
        .update({ is_completed: true, is_ongoing: false })
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType);

      if (error) throw error;

      // Mark scheduled program as completed if exists
      if (scheduledWorkout) {
        await supabase
          .from('scheduled_workouts')
          .update({ status: 'completed' })
          .eq('id', scheduledWorkout.id);
        refetchScheduled();
      }

      setIsCompleted(true);
      setIsOngoing(false);
      
      toast({
        title: "Amazing Work! 🎉",
        description: "Program completed! You're crushing your fitness goals!",
      });
    } catch (error) {
      console.error('Error completing program:', error);
      toast({
        title: "Error",
        description: "Failed to mark program as complete",
        variant: "destructive",
      });
    }
  };

  const resetProgram = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('program_interactions')
        .update({ is_completed: false, is_ongoing: false })
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType);

      if (error) throw error;

      setIsCompleted(false);
      setIsOngoing(false);
      
      toast({
        title: "Program Reset",
        description: "Ready to start fresh!",
      });
    } catch (error) {
      console.error('Error resetting program:', error);
      toast({
        title: "Error",
        description: "Failed to reset program",
        variant: "destructive",
      });
    }
  };

  const handleRating = async (newRating: number) => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from('program_interactions')
        .update({ rating: newRating })
        .eq('user_id', session.user.id)
        .eq('program_id', programId)
        .eq('program_type', programType);

      if (error) throw error;

      setRating(newRating);
      toast({
        title: "Rating Saved",
        description: `You rated this program ${newRating} star${newRating > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Error saving rating:', error);
      toast({
        title: "Error",
        description: "Failed to save rating",
        variant: "destructive",
      });
    }
  };

  const handleScheduleClick = () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }
    setIsScheduleDialogOpen(true);
  };

  if (isLoading) {
    return null;
  }

  // Show interactions for subscribers on free content and premium members on all content
  if (!canUserInteract) {
    const promptMessage = userTier === "subscriber" && !isFreeContent
      ? "Upgrade to Premium to track, favorite, and rate premium programs"
      : "Log in to track, favorite, and rate programs";

    return (
      <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30 text-center">
        <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold mb-1">
          {userTier === "guest" ? "Login Required" : "Premium Feature"}
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          {promptMessage}
        </p>
        <Button size="sm" onClick={() => navigate(userTier === "guest" ? "/auth" : "/")}>
          {userTier === "guest" ? "Log In" : "View Plans"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted rounded-lg">
        <Button
          onClick={toggleFavorite}
          variant={isFavorite ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </Button>

        <Button
          onClick={handleScheduleClick}
          variant={scheduledWorkout ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <CalendarClock className="w-4 h-4" />
          {scheduledWorkout 
            ? `Scheduled: ${format(new Date(scheduledWorkout.scheduled_date), 'MMM d')}`
            : 'Schedule'
          }
        </Button>

        {/* 3-State Program Progress Toggle */}
        {!isOngoing && !isCompleted && (
          <Button
            onClick={startProgram}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Start Program
          </Button>
        )}

        {isOngoing && !isCompleted && (
          <>
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-orange-500 hover:bg-orange-600"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              In Progress 🔥
            </Button>
            <Button
              onClick={markComplete}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Complete
            </Button>
          </>
        )}

        {isCompleted && (
          <>
            <Button
              variant="default"
              size="sm"
              className="gap-2 bg-green-500 hover:bg-green-600"
              disabled
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              Completed ✓
            </Button>
            <Button
              onClick={resetProgram}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              Reset
            </Button>
          </>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Rate:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= rating
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <CommentDialog
          programId={programId}
          programName={programName}
          programType={programType}
        />
      </div>

      <ScheduleWorkoutDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        contentId={programId}
        contentName={programName}
        contentType="program"
        onScheduled={refetchScheduled}
      />
    </>
  );
};
