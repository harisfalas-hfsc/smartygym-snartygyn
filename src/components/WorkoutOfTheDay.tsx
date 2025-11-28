import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Clock, Dumbbell, Star, Crown, ShoppingBag } from "lucide-react";

export const WorkoutOfTheDay = () => {
  const navigate = useNavigate();

  const { data: wod, isLoading } = useQuery({
    queryKey: ["workout-of-the-day"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching WOD:", error);
        return null;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const getDifficultyColor = (stars: number | null) => {
    if (!stars) return "bg-gray-500/20 text-gray-600 border-gray-500/40";
    if (stars <= 2) return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/40";
    if (stars <= 4) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/40";
    return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40";
  };

  const renderStars = (count: number | null) => {
    if (!count) return null;
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-primary/10 via-background to-primary/10 border-2 border-primary/50 shadow-gold overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-32 w-full max-w-md rounded-lg" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/10 via-background to-primary/10 border-2 border-primary/50 shadow-gold overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Title */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-primary animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-bold text-primary">
            Workout of the Day
          </h2>
          <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-primary animate-pulse" />
        </div>

        {/* Description */}
        <p className="text-sm sm:text-base text-muted-foreground text-center max-w-3xl mx-auto mb-6">
          Every day at 7:00 AM, SmartyGym delivers a fresh, expertly designed workout following a strategic 
          periodization cycle. Each day focuses on a different training style: Strength, Calorie Burning, 
          Metabolic, Cardio, Mobility & Stability, and Challenge — rotating continuously for balanced, 
          progressive training.
        </p>

        {/* Current WOD Display */}
        {wod ? (
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-primary/30 max-w-2xl mx-auto">
            {/* WOD Image */}
            {wod.image_url && (
              <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden mb-4">
                <img 
                  src={wod.image_url} 
                  alt={wod.name || "Workout of the Day"} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">
                    {wod.name}
                  </h3>
                </div>
              </div>
            )}

            {/* WOD Details */}
            {!wod.image_url && (
              <h3 className="text-lg sm:text-xl font-bold text-center mb-3">
                {wod.name}
              </h3>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {/* Category Badge */}
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
                {wod.category}
              </Badge>

              {/* Format Badge */}
              {wod.format && (
                <Badge variant="outline" className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40">
                  {wod.format}
                </Badge>
              )}

              {/* Difficulty Badge */}
              <Badge variant="outline" className={getDifficultyColor(wod.difficulty_stars)}>
                {wod.difficulty} {renderStars(wod.difficulty_stars)}
              </Badge>

              {/* Equipment Badge */}
              <Badge variant="outline" className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/40">
                <Dumbbell className="w-3 h-3 mr-1" />
                {wod.equipment}
              </Badge>

              {/* Duration Badge */}
              {wod.duration && (
                <Badge variant="outline" className="bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/40">
                  <Clock className="w-3 h-3 mr-1" />
                  {wod.duration}
                </Badge>
              )}
            </div>

            {/* Premium & Price Badges */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                <ShoppingBag className="w-3 h-3 mr-1" />
                BUY €{wod.price?.toFixed(2)}
              </Badge>
            </div>

            {/* View Button */}
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate(`/workout/${wod.category?.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}/${wod.id}`)}
                className="cta-button"
              >
                View Today's Workout
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-primary/30 max-w-md mx-auto text-center">
            <p className="text-muted-foreground mb-2">
              No Workout of the Day available yet.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Check back at 7:00 AM for today's fresh workout!
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
