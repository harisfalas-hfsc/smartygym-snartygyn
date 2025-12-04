import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Clock, Dumbbell, Star, Crown, ShoppingBag, Archive, Home } from "lucide-react";

export const WorkoutOfTheDay = () => {
  const navigate = useNavigate();
  
  const { data: wods, isLoading } = useQuery({
    queryKey: ["workout-of-the-day-dual"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true);
      
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching WODs:", error);
        return [];
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const bodyweightWOD = wods?.find(w => w.equipment === "BODYWEIGHT");
  const equipmentWOD = wods?.find(w => w.equipment === "EQUIPMENT");
  const hasWODs = bodyweightWOD || equipmentWOD;

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

  const renderMiniCard = (wod: typeof bodyweightWOD, isBodyweight: boolean) => {
    if (!wod) return null;
    
    const equipmentIcon = isBodyweight ? <Home className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />;
    const equipmentLabel = isBodyweight ? "No Equipment" : "With Equipment";
    const bgColor = isBodyweight ? "bg-blue-500" : "bg-orange-500";

    return (
      <div 
        className="bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-primary/30 cursor-pointer hover:border-primary/60 transition-all"
        onClick={() => navigate(`/workout/wod/${wod.id}`)}
      >
        {/* Image */}
        {wod.image_url && (
          <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
            <img 
              src={wod.image_url} 
              alt={wod.name || "Workout"} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <Badge className={`absolute top-2 left-2 ${bgColor} text-white border-0 text-xs py-0.5`}>
              {equipmentIcon}
              <span className="ml-1">{isBodyweight ? "Home" : "Gym"}</span>
            </Badge>
          </div>
        )}

        {/* Title */}
        <h4 className="text-sm font-bold text-foreground line-clamp-1 mb-1">
          {wod.name}
        </h4>

        {/* Mini Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {wod.format && (
            <Badge variant="outline" className="text-xs py-0 px-1.5">
              {wod.format}
            </Badge>
          )}
          <Badge variant="outline" className={`text-xs py-0 px-1.5 ${getDifficultyColor(wod.difficulty_stars)}`}>
            {wod.difficulty_stars}⭐
          </Badge>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs">
            <ShoppingBag className="w-3 h-3 mr-1" />
            €{wod.price?.toFixed(2)}
          </Badge>
          <span className="text-xs text-muted-foreground">{equipmentLabel}</span>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="mb-8 bg-gradient-to-br from-primary/10 via-background to-primary/10 border-2 border-primary/50 shadow-gold overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-8 bg-gradient-to-br from-primary/10 via-background to-primary/10 border-2 border-primary/50 shadow-gold overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Icon Container */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <CalendarCheck className="w-8 h-8 text-primary" />
          </div>
          
          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-primary mb-3">
            Workout of the Day
          </h2>
          
          {/* Description */}
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto mb-4">
            Every day at 7:00 AM, <span className="text-primary font-semibold">SmartyGym</span> delivers <strong>TWO</strong> fresh workouts — one with equipment, one without. Choose based on where you are!
          </p>
        </div>

        {/* Shared Info (Category, Format, Difficulty) */}
        {hasWODs && (bodyweightWOD || equipmentWOD) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/40">
              {(bodyweightWOD || equipmentWOD)?.category}
            </Badge>
            {(bodyweightWOD || equipmentWOD)?.format && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/40">
                {(bodyweightWOD || equipmentWOD)?.format}
              </Badge>
            )}
            <Badge variant="outline" className={getDifficultyColor((bodyweightWOD || equipmentWOD)?.difficulty_stars || null)}>
              {(bodyweightWOD || equipmentWOD)?.difficulty} {renderStars((bodyweightWOD || equipmentWOD)?.difficulty_stars || null)}
            </Badge>
          </div>
        )}

        {/* Two WOD Cards */}
        {hasWODs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto mb-4">
            {renderMiniCard(bodyweightWOD, true)}
            {renderMiniCard(equipmentWOD, false)}
          </div>
        ) : (
          <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-primary/30 max-w-md mx-auto text-center mb-4">
            <p className="text-muted-foreground mb-2">
              No Workouts of the Day available yet.
            </p>
            <p className="text-sm text-muted-foreground/70">
              Check back at 7:00 AM for today's fresh workouts!
            </p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mb-2">
          <Button onClick={() => navigate("/workout/wod")} className="cta-button">
            View Today's Workouts
          </Button>
        </div>

        {/* Link to Archive */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate("/wod-archive")} className="text-muted-foreground hover:text-primary text-sm">
            <Archive className="w-4 h-4 mr-2" />
            Browse Past WODs
          </Button>
        </div>
      </div>
    </Card>
  );
};
