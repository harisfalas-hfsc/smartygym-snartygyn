import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, CheckCircle2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";

interface WorkoutInteractionsProps {
  workoutId: string;
  workoutType: string;
  workoutName: string;
}

export const WorkoutInteractions = ({ workoutId, workoutType, workoutName }: WorkoutInteractionsProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userTier } = useAccessControl();
  const navigate = useNavigate();

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
        .eq('workout_type', workoutType)
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
          onConflict: 'user_id,workout_id,workout_type'
        });
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const showUpgradePrompt = () => {
    toast({
      title: "Premium Feature",
      description: "Upgrade to Premium to favorite, rate, and track workouts!",
      action: (
        <Button size="sm" onClick={() => navigate("/")}>
          <Crown className="w-4 h-4 mr-2" />
          Upgrade
        </Button>
      ),
    });
  };

  const toggleFavorite = async () => {
    if (userTier !== "premium") {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newFavoriteStatus = !isFavorite;
      
      await supabase
        .from('workout_interactions')
        .upsert({
          user_id: session.user.id,
          workout_id: workoutId,
          workout_type: workoutType,
          workout_name: workoutName,
          is_favorite: newFavoriteStatus,
        }, {
          onConflict: 'user_id,workout_id,workout_type'
        });

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
    if (userTier !== "premium") {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newCompletedStatus = !isCompleted;
      
      await supabase
        .from('workout_interactions')
        .upsert({
          user_id: session.user.id,
          workout_id: workoutId,
          workout_type: workoutType,
          workout_name: workoutName,
          is_completed: newCompletedStatus,
        }, {
          onConflict: 'user_id,workout_id,workout_type'
        });

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
    if (userTier !== "premium") {
      showUpgradePrompt();
      return;
    }

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
          rating: newRating,
        }, {
          onConflict: 'user_id,workout_id,workout_type'
        });

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

  if (isLoading) {
    return null;
  }

  // Don't show interactions for guests or subscribers
  if (userTier === "guest" || userTier === "subscriber") {
    return (
      <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-primary/30 text-center">
        <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-sm font-semibold mb-1">Premium Feature</p>
        <p className="text-xs text-muted-foreground mb-3">
          Upgrade to track, favorite, and rate workouts
        </p>
        <Button size="sm" onClick={() => navigate("/")}>
          View Plans
        </Button>
      </div>
    );
  }

  return (
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
    </div>
  );
};