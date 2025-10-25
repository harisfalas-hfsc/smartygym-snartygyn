import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Star, CheckCircle2, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";

interface ProgramInteractionsProps {
  programId: string;
  programType: string;
  programName: string;
  isFreeContent: boolean; // Add this to determine if content is free or premium
}

export const ProgramInteractions = ({ programId, programType, programName, isFreeContent }: ProgramInteractionsProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userTier, canInteract } = useAccessControl();
  const navigate = useNavigate();

  // Determine content type for permission check
  const contentType = isFreeContent ? "free-program" : "premium-program";
  const canUserInteract = canInteract(contentType);

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
      
      await supabase
        .from('program_interactions')
        .upsert({
          user_id: session.user.id,
          program_id: programId,
          program_type: programType,
          program_name: programName,
          is_favorite: newFavoriteStatus,
        }, {
          onConflict: 'user_id,program_id,program_type'
        });

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

  const toggleCompleted = async () => {
    if (!canUserInteract) {
      showUpgradePrompt();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newCompletedStatus = !isCompleted;
      
      await supabase
        .from('program_interactions')
        .upsert({
          user_id: session.user.id,
          program_id: programId,
          program_type: programType,
          program_name: programName,
          is_completed: newCompletedStatus,
        }, {
          onConflict: 'user_id,program_id,program_type'
        });

      setIsCompleted(newCompletedStatus);
      toast({
        title: newCompletedStatus ? "Marked as Completed" : "Marked as Incomplete",
        description: newCompletedStatus ? "Great job! Keep it up!" : "Program marked as incomplete",
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

      await supabase
        .from('program_interactions')
        .upsert({
          user_id: session.user.id,
          program_id: programId,
          program_type: programType,
          program_name: programName,
          rating: newRating,
        }, {
          onConflict: 'user_id,program_id,program_type'
        });

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