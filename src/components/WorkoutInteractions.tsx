import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, CheckCircle2, Crown, CalendarClock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";
import { CommentDialog } from "@/components/CommentDialog";
import { ScheduleWorkoutDialog } from "@/components/ScheduleWorkoutDialog";
import { AddToCalendarDialog } from "@/components/AddToCalendarDialog";
import { useScheduledWorkoutForContent } from "@/hooks/useScheduledWorkouts";
import { format } from "date-fns";
import { GoalAchievementCelebration } from "@/components/dashboard/GoalAchievementCelebration";
import { checkCompletionGoalAchievement, sendGoalAchievementNotification } from "@/hooks/useGoalAchievementCheck";

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
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievedGoals, setAchievedGoals] = useState<Array<{ type: "weight" | "body_fat" | "muscle_mass" | "workouts_completed" | "programs_completed"; target: number; current: number }>>([]);
  const [calendarDialogData, setCalendarDialogData] = useState<{
    title: string;
    date: string;
    time?: string;
    reminderMinutes: number;
    notes?: string;
    contentType: "workout" | "program";
    contentRouteType: string;
    contentId: string;
  } | null>(null);
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
        <Button size="sm" onClick={() => navigate("/smarty-premium")}>
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

        // Check for goal achievement
        const achieved = await checkCompletionGoalAchievement(session.user.id, "workouts_completed");
        if (achieved) {
          setAchievedGoals([achieved]);
          setShowCelebration(true);
          await sendGoalAchievementNotification(session.user.id, achieved);
        }

        // Show calendar dialog for completed workout
        const now = new Date();
        setTimeout(() => {
          if (typeof document !== "undefined") {
            document.body.style.pointerEvents = "";
          }
          setCalendarDialogData({
            title: `Completed: ${workoutName}`,
            date: format(now, 'yyyy-MM-dd'),
            time: format(now, 'HH:mm'),
            reminderMinutes: 0,
            notes: `Great job finishing "${workoutName}"! Keep showing up and pushing your limits -- every rep counts toward a stronger you. Open in SmartyGym to find your next challenge.`,
            contentType: "workout",
            contentRouteType: workoutType,
            contentId: workoutId,
          });
        }, 450);
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

  const handleScheduleSuccess = (details: typeof calendarDialogData) => {
    setCalendarDialogData(details);
  };

  if (isLoading) {
    return null;
  }

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
          {userTier === "guest" ? "Log In" : "Upgrade to Premium"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <TooltipProvider delayDuration={150}>
        <div className="flex flex-col gap-1.5 p-2 bg-muted/60 rounded-lg border border-border">
          <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-5 lg:flex-1">
            <Button
              onClick={toggleFavorite}
              variant={isFavorite ? "default" : "ghost"}
              size="sm"
              className="h-10 gap-2 justify-start px-3 lg:justify-center"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{isFavorite ? 'Favorited' : 'Favorite'}</span>
            </Button>

            <Button
              onClick={handleScheduleClick}
              variant={scheduledWorkout ? "default" : "ghost"}
              size="sm"
              className="h-10 gap-2 justify-start px-3 lg:justify-center"
            >
              <CalendarClock className="w-4 h-4" />
              <span className="text-xs font-medium truncate">
                {scheduledWorkout ? format(new Date(scheduledWorkout.scheduled_date), 'MMM d') : 'Schedule'}
              </span>
            </Button>

            <Button
              onClick={toggleCompleted}
              variant={isCompleted ? "default" : "ghost"}
              size="sm"
              className="h-10 gap-2 justify-start px-3 lg:justify-center"
            >
              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{isCompleted ? 'Completed' : 'Complete'}</span>
            </Button>

            <div className="col-span-2 lg:col-span-1 h-10 flex items-center justify-start gap-2 rounded-md px-3 hover:bg-accent/50 transition-colors lg:justify-center" role="group" aria-label="Rate this workout">
              <div className="flex items-center gap-1.5">
                <Star className={`w-4 h-4 shrink-0 ${rating > 0 ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                <span className="text-xs font-medium whitespace-nowrap">Rate workout</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-3 h-3 ${
                        star <= rating
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-muted-foreground/50'
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
              triggerVariant="ghost"
              triggerClassName="h-10 w-full gap-2 justify-start px-3 text-xs font-medium lg:h-full lg:justify-center"
            />
          </div>
        </div>
      </TooltipProvider>

      <ScheduleWorkoutDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        contentId={workoutId}
        contentName={workoutName}
        contentType="workout"
        contentRouteType={workoutType}
        onScheduled={refetchScheduled}
        onScheduleSuccess={handleScheduleSuccess}
      />

      <AddToCalendarDialog
        isOpen={!!calendarDialogData}
        onClose={() => setCalendarDialogData(null)}
        eventDetails={calendarDialogData}
      />

      <GoalAchievementCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        achievedGoals={achievedGoals}
      />
    </>
  );
};
