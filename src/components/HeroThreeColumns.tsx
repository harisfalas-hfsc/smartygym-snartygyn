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
  Calendar,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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

// Define hero cards
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
              
              // Dynamic title for WOD card showing today's category
              const displayTitle = isWodCard && currentWod?.category 
                ? `WOD: ${currentWod.category}` 
                : card.title;
              
              return (
                <CarouselItem key={card.id} className="pl-4 basis-[45%]">
                  <div
                    onClick={() => navigate(card.route)}
                    className={cn(
                      "cursor-pointer group border-2 border-primary/40 rounded-xl overflow-hidden",
                      "hover:border-primary hover:shadow-lg hover:scale-[1.02]",
                      "transition-all duration-300 h-[180px]",
                      "relative bg-card"
                    )}
                  >
                    {/* Full Image Background */}
                    <img 
                      src={card.image} 
                      alt={card.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
                    
                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-4">
                      {/* Top: Title with Icon */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <h3 className="text-base font-bold text-white drop-shadow-lg">
                          {displayTitle}
                        </h3>
                      </div>
                      
                      {/* Bottom: Description & CTA */}
                      <div>
                        <p className="text-sm text-white/90 mb-2 drop-shadow-md">
                          {card.description}
                        </p>
                        
                        {/* CTA indicator */}
                        <div className="flex items-center gap-1 text-primary text-xs font-medium group-hover:gap-2 transition-all">
                          Explore
                          <ChevronRight className="w-3 h-3" />
                        </div>
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
