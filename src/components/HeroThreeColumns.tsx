import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Dumbbell,
  Calculator, 
  FileText, 
  Video,
  ChevronRight,
  Calendar,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SwipeToExplore } from "@/components/ui/SwipeToExplore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Import images
import heroWorkoutsImage from "@/assets/hero-workouts.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library-new.jpg";
import heroCommunityImage from "@/assets/hero-gym-group.jpg";

// Define hero cards - ordered: Workouts, Programs, Library, Blog, Tools, Community
const heroCards = [
  {
    id: "workouts",
    title: "Smarty Workouts",
    description: "Complete workout library for every goal",
    icon: Dumbbell,
    route: "/workout",
    image: heroWorkoutsImage
  },
  {
    id: "programs",
    title: "Smarty Programs",
    description: "Structured multi-week training plans",
    icon: Calendar,
    route: "/trainingprogram",
    image: heroProgramsImage
  },
  {
    id: "library",
    title: "Exercise Library",
    description: "Video demos for every exercise",
    icon: Video,
    route: "/exerciselibrary",
    image: heroLibraryImage
  },
  {
    id: "blog",
    title: "Blog & Insights",
    description: "Expert articles and fitness tips",
    icon: FileText,
    route: "/blog",
    image: heroBlogImage
  },
  {
    id: "tools",
    title: "Smarty Tools",
    description: "Calculators for fitness metrics",
    icon: Calculator,
    route: "/tools",
    image: heroToolsImage
  },
  {
    id: "community",
    title: "Community",
    description: "Connect, share and grow with fellow fitness enthusiasts worldwide",
    icon: Users,
    route: "/community",
    image: heroCommunityImage
  }
];

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [api, setApi] = useState<CarouselApi>();
  const autoplayRef = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );
  const [current, setCurrent] = useState(0);

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
      {/* Swipe to explore indicator */}
      <div className="flex md:hidden">
        <SwipeToExplore onPrev={() => api?.scrollPrev()} onNext={() => api?.scrollNext()} />
      </div>

      {/* Carousel container */}
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[autoplayRef.current]}
        className="w-full"
        onMouseEnter={() => autoplayRef.current.stop()}
        onMouseLeave={() => autoplayRef.current.play()}
      >
        <CarouselContent className="-ml-3">
          {heroCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <CarouselItem key={card.id} className="pl-3 basis-[32%]">
                <div
                  onClick={() => navigate(card.route)}
                  className={cn(
                    "cursor-pointer group border-2 border-primary/40 rounded-xl overflow-hidden",
                    "hover:border-primary hover:shadow-2xl hover:scale-[1.05] hover:z-10",
                    "transition-all duration-300 ease-out h-[180px]",
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
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 flex flex-col justify-end z-10">
                    {/* Title with Icon */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">{card.title}</h3>
                      <div className="w-8 h-8 rounded-full bg-background/90 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{card.description}</p>
                    
                    {/* CTA indicator */}
                    <div className="flex items-center justify-center gap-1 text-primary text-[9px] font-medium group-hover:gap-2 transition-all mt-1">
                      Explore
                      <ChevronRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Arrows positioned behind cards */}
        <CarouselPrevious className="-left-4 w-8 h-8 border-border bg-background/80 hover:bg-accent" />
        <CarouselNext className="-right-4 w-8 h-8 border-border bg-background/80 hover:bg-accent" />
      </Carousel>
      
      {/* Navigation dots - below cards */}
      <div className="flex justify-center gap-2 mt-3">
        {heroCards.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              current === index 
                ? "bg-primary w-3" 
                : "bg-primary/30 hover:bg-primary/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
