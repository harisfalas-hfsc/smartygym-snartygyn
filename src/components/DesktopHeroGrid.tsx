import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCyprusTodayStr } from "@/lib/cyprusDate";
import { 
  Dumbbell,
  FileText, 
  Star,
  Clock,
  ChevronRight,
  UserCheck,
  Ban,
  Brain,
  CheckCircle2,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Import images
import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";

// Helper to convert star count to difficulty label
const getDifficultyLabel = (stars: number | null | undefined, isRecovery: boolean): string => {
  if (isRecovery || !stars || stars === 0) return "All Levels";
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced";
};

// Check if WOD is recovery type
const isRecoveryWod = (wod: { equipment?: string | null; category?: string | null }): boolean => {
  return wod.equipment?.toUpperCase() === "VARIOUS" || wod.category?.toUpperCase() === "RECOVERY";
};

interface DesktopHeroGridProps {
  isPremium: boolean;
  onNavigate: (path: string) => void;
}

export const DesktopHeroGrid = ({ isPremium, onNavigate }: DesktopHeroGridProps) => {
  const navigate = useNavigate();

  // Fetch WOD for the dynamic card
  const cyprusToday = getCyprusTodayStr();
  const { data: wods } = useQuery({
    queryKey: ["wod-desktop-grid", cyprusToday],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_workouts")
        .select("id, name, category, focus, difficulty_stars, duration, equipment, is_premium, type, format")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", cyprusToday)
        .limit(2);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const currentWod = wods?.[0];

  // Shared image card styles
  const imageCardStyles = cn(
    "cursor-pointer group border-2 border-primary/40 rounded-xl overflow-hidden",
    "hover:border-primary hover:shadow-2xl hover:scale-[1.02]",
    "transition-all duration-300 ease-out h-[220px]",
    "relative bg-card"
  );

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      {/* Row 1: WOD Card (Left) + Your Gym Re-imagined (Right) */}
      
      {/* WOD Card - Image-based */}
      <div
        onClick={() => navigate("/workout/wod")}
        className={imageCardStyles}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroWodImage} 
            alt="Workout of the Day"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-colors duration-300" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Workout of the Day</h3>
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {currentWod ? (
            <div className="flex items-center gap-3 text-sm text-white/80 mt-1">
              <span className="text-primary font-medium">{currentWod.category}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {getDifficultyLabel(currentWod.difficulty_stars, isRecoveryWod(currentWod))}
              </span>
              {currentWod.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-white/80" />
                  {currentWod.duration}
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80 mt-1">Fresh daily workouts crafted by experts</p>
          )}
          
          <div className="flex items-center justify-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all mt-2">
            Start Today's Workout
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Your Gym Re-imagined Card - Text-based */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 h-[220px] relative overflow-hidden">
        {!isPremium && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("/joinpremium");
            }} 
            className="absolute top-3 right-3 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md z-10"
          >
            Join Now
          </Button>
        )}
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <div className="space-y-2 text-center">
            <h3 className="text-lg font-bold">
              Your Gym Re-imagined Anywhere, Anytime
            </h3>
            <p className="text-sm font-semibold text-primary">
              We are not here to replace your gym. We are here to back you up when life gets in the way.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — 
              SmartyGym is your backup plan. Wherever you are, your gym comes with you.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Row 2: 100% Human (Left) + Smarty Workouts (Right) */}
      
      {/* 100% Human. 0% AI Card - Text-based */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 h-[220px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" aria-hidden="true"></div>
        
        {!isPremium && (
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onNavigate("/smarty-plans");
            }} 
            size="sm"
            className="absolute top-2 left-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs z-10"
          >
            <Crown className="mr-1 h-3 w-3" />
            Transform Your Fitness
          </Button>
        )}
        
        <CardContent className="p-4 h-full flex flex-col justify-center pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-primary" />
            </div>
            <Ban className="w-6 h-6 text-destructive" />
            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-destructive" />
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-center mb-2">
            100% Human. 0% AI.
          </h3>
          
          <p className="text-xs text-center text-muted-foreground mb-3">
            Every workout is science-based and personally created by Haris Falas. Never by AI.
          </p>
          
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1 p-1.5 bg-background/50 rounded border border-primary/20">
              <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-[10px] font-medium">Real Expertise</span>
            </div>
            <div className="flex items-center gap-1 p-1.5 bg-background/50 rounded border border-primary/20">
              <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-[10px] font-medium">Personal Touch</span>
            </div>
            <div className="flex items-center gap-1 p-1.5 bg-background/50 rounded border border-primary/20">
              <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-[10px] font-medium">Not a Robot</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smarty Workouts Card - Image-based */}
      <div
        onClick={() => navigate("/workout")}
        className={imageCardStyles}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroWorkoutsImage} 
            alt="Smarty Workouts"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-colors duration-300" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Smarty Workouts</h3>
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <p className="text-sm text-white/80 mt-1">500+ expert-designed workout routines for every goal</p>
          
          <div className="flex items-center justify-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all mt-2">
            Browse Workouts
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Row 3: Blog & Insights (Left) + SmartyGym Promise (Right) */}
      
      {/* Blog & Insights Card - Image-based */}
      <div
        onClick={() => navigate("/blog")}
        className={imageCardStyles}
      >
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={heroBlogImage} 
            alt="Blog & Insights"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-colors duration-300" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col justify-end z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Blog & Insights</h3>
            <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          <p className="text-sm text-white/80 mt-1">Expert articles and fitness tips from professional coaches</p>
          
          <div className="flex items-center justify-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all mt-2">
            Read Articles
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* The SmartyGym Promise Card - Text-based */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20 h-[220px] overflow-hidden">
        <CardContent className="p-4 h-full flex flex-col justify-center">
          <h3 className="text-lg font-bold mb-3 text-center">The SmartyGym Promise</h3>
          <div className="space-y-2">
            <p className="text-xs leading-relaxed text-center text-muted-foreground">
              Every workout and training program at <span className="text-primary font-semibold">SmartyGym</span> is crafted with one goal: to help you reach YOUR fitness goals. 
              Whether you're building muscle, losing weight, improving endurance, or simply staying active, 
              we provide the structure and guidance you need to succeed.
            </p>
            <p className="text-sm font-semibold text-center text-primary">
              Real coaching. Real results. Anywhere you train.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
