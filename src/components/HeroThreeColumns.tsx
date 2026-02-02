import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCyprusTodayStr } from "@/lib/cyprusDate";
import { 
  Dumbbell,
  Calculator, 
  FileText, 
  Video,
  ChevronRight,
  Star,
  Clock,
  Calendar,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";

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

// Define hero cards matching mobile design
const heroCards = [
  {
    id: "wod",
    title: "Workout of the Day",
    description: "Fresh daily workouts crafted by experts",
    icon: Dumbbell,
    route: "/workout/wod",
    isWod: true
  },
  {
    id: "workouts",
    title: "Smarty Workouts",
    description: "Complete workout library for every goal",
    icon: Dumbbell,
    route: "/workout",
    isWod: false
  },
  {
    id: "programs",
    title: "Smarty Programs",
    description: "Structured multi-week training plans",
    icon: Calendar,
    route: "/trainingprogram",
    isWod: false
  },
  {
    id: "ritual",
    title: "Smarty Ritual",
    description: "Daily wellness habits and routines",
    icon: Sparkles,
    route: "/daily-ritual",
    isWod: false
  },
  {
    id: "tools",
    title: "Smarty Tools",
    description: "Calculators for fitness metrics",
    icon: Calculator,
    route: "/tools",
    isWod: false
  },
  {
    id: "blog",
    title: "Blog & Insights",
    description: "Expert articles and fitness tips",
    icon: FileText,
    route: "/blog",
    isWod: false
  },
  {
    id: "library",
    title: "Exercise Library",
    description: "Video demos for every exercise",
    icon: Video,
    route: "/exerciselibrary",
    isWod: false
  }
];

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Fetch WOD for the dynamic card
  const cyprusToday = getCyprusTodayStr();
  const { data: wods } = useQuery({
    queryKey: ["wod-hero-banner", cyprusToday],
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

  // Track current slide for dots
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <div className="mt-6 px-12 relative">
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {heroCards.map((card) => {
            const Icon = card.icon;
            const isWodCard = card.isWod;
            
            return (
              <CarouselItem key={card.id} className="pl-4 basis-[42%]">
                <div
                  onClick={() => navigate(card.route)}
                  className={cn(
                    "cursor-pointer group border-2 border-primary/40 rounded-xl p-6",
                    "hover:border-primary hover:shadow-lg hover:scale-[1.02]",
                    "transition-all duration-300 h-[180px]",
                    "flex flex-col items-center justify-center text-center gap-4",
                    "bg-card"
                  )}
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                  
                  {/* Description - show WOD info if available */}
                  {isWodCard && currentWod ? (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="text-primary font-medium">{currentWod.category}</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {getDifficultyLabel(currentWod.difficulty_stars, isRecoveryWod(currentWod))}
                      </span>
                      {currentWod.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {currentWod.duration}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  )}
                  
                  {/* CTA indicator */}
                  <div className="flex items-center gap-1 text-primary text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Navigation arrows */}
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
      
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-4">
        {heroCards.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              current === index 
                ? "bg-primary w-4" 
                : "bg-primary/30 hover:bg-primary/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
