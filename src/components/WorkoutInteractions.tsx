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

interface WorkoutInteractionsProps {
  workoutId: string;
  workoutType: string;
  workoutName: string;
  isFreeContent: boolean;
}

export const WorkoutInteractions = ({ workoutId, workoutType, workoutName, isFreeContent }: WorkoutInteractionsProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const { toast } = useToast();
  const { userTier, canInteract } = useAccessControl();
  const navigate = useNavigate();

  const { scheduledWorkout, refetch: refetchScheduled } = useScheduledWorkoutForContent(workoutId, 'workout');

  // Determine content type for permission check
  const contentType = isFreeContent ? "free-workout" : "workout";
  const canUserInteract = canInteract(contentType, workoutId);

  useEffect(() => {
    loadInteractions();
    markAsViewed();
  }, [workoutId]);

  const loadInteractions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('workout_interactions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('workout_id', workoutId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setIsFavorite(data.is_favorite);
        setIsCompleted(data.is_completed);
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
        .from('workout_interactions')
        .upsert({
          user_id: session.user.id,
          workout_id: workoutId,
          workout_type: workoutType,
          workout_name: workoutName,
          has_viewed: true,
        }, {
          onConflict: 'user_id,workout_id'
        });

      await supabase
        .from('user_activity_log')
        .insert({
          user_id: session.user.id,
          content_type: 'workout',
          item_id: workoutId,
          item_name: workoutName,
          action_type: 'viewed',
          activity_date: new Date().toISOString().split('T')[0]
        });
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const showUpgradePrompt = () => {
    const message = isFreeContent && userTier === "subscriber" 
      ? "This feature is available for free content. Please check your subscription status."
      : "Upgrade to Premium to favorite, rate, and track this workout!";
    
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
        .from('workout_interactions')
        .update({ is_favorite: newFavoriteStatus })
        .eq('user_id', session.user.id)
        .eq('workout_id', workoutId);

      if (error) throw error;

      setIsFavorite(newFavoriteStatus);
      toast({
        title: newFavoriteStatus ? "Added to Favorites" : "Removed from Favorites",
        description: newFavoriteStatus ? "Workout saved to your favorites" : "Workout removed from favorites",
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

  const toggleCompleted = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newCompletedStatus = !isCompleted;
      
      const { error } = await supabase
        .from('workout_interactions')
        .update({ is_completed: newCompletedStatus })
        .eq('user_id', session.user.id)
        .eq('workout_id', workoutId);

      if (error) throw error;

      // Log to activity log
      if (newCompletedStatus) {
        await supabase
          .from('user_activity_log')
          .insert({
            user_id: session.user.id,
            content_type: 'workout',
            item_id: workoutId,
            item_name: workoutName,
            action_type: 'completed',
            activity_date: new Date().toISOString().split('T')[0]
          });

        // Mark scheduled workout as completed if exists
        if (scheduledWorkout) {
          await supabase
            .from('scheduled_workouts')
            .update({ status: 'completed' })
            .eq('id', scheduledWorkout.id);
          refetchScheduled();
        }
      }

      setIsCompleted(newCompletedStatus);
      toast({
        title: newCompletedStatus ? "Marked as Completed" : "Marked as Incomplete",
        description: newCompletedStatus ? "Great job! Keep it up!" : "Workout marked as incomplete",
      });
    } catch (error) {
      console.error('Error toggling completed:', error);
      toast({
        title: "Error",
        description: "Failed to update completion status",
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
        .from('workout_interactions')
        .update({ rating: newRating })
        .eq('user_id', session.user.id)
        .eq('workout_id', workoutId);

      if (error) throw error;

      setRating(newRating);
      toast({
        title: "Rating Saved",
        description: `You rated this workout ${newRating} star${newRating > 1 ? 's' : ''}`,
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
      ? "Upgrade to Premium to track, favorite, and rate premium workouts"
      : "Log in to track, favorite, and rate workouts";

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

        <Button
          onClick={toggleCompleted}
          variant={isCompleted ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-current' : ''}`} />
          {isCompleted ? 'Completed' : 'Mark as Complete'}
        </Button>

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
          workoutId={workoutId}
          workoutName={workoutName}
          workoutType={workoutType}
        />
      </div>

      <ScheduleWorkoutDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        contentId={workoutId}
        contentName={workoutName}
        contentType="workout"
        onScheduled={refetchScheduled}
      />
    </>
  );
};
