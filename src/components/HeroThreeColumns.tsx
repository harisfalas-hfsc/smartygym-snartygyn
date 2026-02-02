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

// Import images
import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroRitualImage from "@/assets/hero-ritual.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library-new.jpg";

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
    image: heroWodImage,
    isWod: true
  },
  {
    id: "workouts",
    title: "Smarty Workouts",
    description: "Complete workout library for every goal",
    icon: Dumbbell,
    route: "/workout",
    image: heroWorkoutsImage,
    isWod: false
  },
  {
    id: "programs",
    title: "Smarty Programs",
    description: "Structured multi-week training plans",
    icon: Calendar,
    route: "/trainingprogram",
    image: heroProgramsImage,
    isWod: false
  },
  {
    id: "ritual",
    title: "Smarty Ritual",
    description: "Daily wellness habits and routines",
    icon: Sparkles,
    route: "/daily-ritual",
    image: heroRitualImage,
    isWod: false
  },
  {
    id: "tools",
    title: "Smarty Tools",
    description: "Calculators for fitness metrics",
    icon: Calculator,
    route: "/tools",
    image: heroToolsImage,
    isWod: false
  },
  {
    id: "blog",
    title: "Blog & Insights",
    description: "Expert articles and fitness tips",
    icon: FileText,
    route: "/blog",
    image: heroBlogImage,
    isWod: false
  },
  {
    id: "library",
    title: "Exercise Library",
    description: "Video demos for every exercise",
    icon: Video,
    route: "/exerciselibrary",
    image: heroLibraryImage,
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
    <div className="mt-6 relative">
      {/* Container with padding for arrows outside */}
      <div className="flex items-center gap-4">
        {/* Left Arrow - Outside carousel */}
        <button
          onClick={() => api?.scrollPrev()}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Previous slide"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>

        {/* Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="flex-1 overflow-hidden"
        >
          <CarouselContent className="-ml-4">
            {heroCards.map((card) => {
              const Icon = card.icon;
              const isWodCard = card.isWod;
              
              return (
                <CarouselItem key={card.id} className="pl-4 basis-[45%]">
                  <div
                    onClick={() => navigate(card.route)}
                    className={cn(
                      "cursor-pointer group border-2 border-primary/40 rounded-xl overflow-hidden",
                      "hover:border-primary hover:shadow-2xl hover:scale-[1.08] hover:z-10",
                      "transition-all duration-300 ease-out h-[220px]",
                      "relative bg-card"
                    )}
                  >
                    {/* Image Section - Full height */}
                    <div className="absolute inset-0 overflow-hidden">
                      <img 
                        src={card.image} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-colors duration-300" />
                    </div>
                    
                    {/* Content Section - Positioned at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 flex flex-col justify-end z-10">
                      {/* Title with Icon */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{card.title}</h3>
                        <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      
                      {/* Description - show WOD info if available */}
                      {isWodCard && currentWod ? (
                        <div className="flex items-center gap-2 text-xs text-white/80 mt-0.5">
                          <span className="text-primary font-medium">{currentWod.category}</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {getDifficultyLabel(currentWod.difficulty_stars, isRecoveryWod(currentWod))}
                          </span>
                          {currentWod.duration && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-white/80" />
                              {currentWod.duration}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{card.description}</p>
                      )}
                      
                      {/* CTA indicator */}
                      <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-medium group-hover:gap-2 transition-all mt-1.5">
                        Explore
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Right Arrow - Outside carousel */}
        <button
          onClick={() => api?.scrollNext()}
          className="flex-shrink-0 w-10 h-10 rounded-full border border-border bg-background hover:bg-accent flex items-center justify-center transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
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
