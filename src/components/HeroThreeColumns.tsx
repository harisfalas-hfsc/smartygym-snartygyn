import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Crown,
  Flame,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import static images
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library.jpg";
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

// Reusable Feature Card component
interface FeatureCardProps {
  title: string;
  headerIcon: React.ReactNode;
  borderColor: string;
  headerGradient: string;
  imageUrl: string;
  description: string;
  ctaText: string;
  onClick: () => void;
}

const FeatureCard = ({
  title,
  headerIcon,
  borderColor,
  headerGradient,
  imageUrl,
  description,
  ctaText,
  onClick
}: FeatureCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer group border-2 rounded-xl",
        "hover:shadow-xl hover:scale-105 hover:-translate-y-1",
        "transition-all duration-300",
        "flex flex-col h-[220px] w-full overflow-hidden",
        borderColor
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-center gap-2 py-2 border-b",
        headerGradient
      )}>
        {headerIcon}
        <span className="text-xs font-bold text-primary uppercase tracking-wide">{title}</span>
      </div>
      
      {/* Image Section */}
      <div className="relative h-[130px] overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      
      {/* Content Section */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        
        {/* CTA */}
        <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-medium 
                        group-hover:gap-2 transition-all mt-1">
          {ctaText}
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [currentWodIndex, setCurrentWodIndex] = useState(0);

  // Fetch both WODs for the banner with full card data - filtered by Cyprus date
  const cyprusToday = getCyprusTodayStr();
  const { data: wods } = useQuery({
    queryKey: ["wod-hero-banner", cyprusToday],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_workouts")
        .select("id, name, category, focus, difficulty_stars, duration, image_url, equipment, is_premium, type, format")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", cyprusToday)
        .limit(2);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Rotate between WODs every 4 seconds
  useEffect(() => {
    if (wods && wods.length > 1) {
      const interval = setInterval(() => {
        setCurrentWodIndex((prev) => (prev === 0 ? 1 : 0));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [wods]);

  const currentWod = wods?.[currentWodIndex] || wods?.[0];

  const featureCards = [
    {
      title: "Smarty Tools",
      headerIcon: <Calculator className="w-4 h-4 text-primary" />,
      borderColor: "border-orange-500 hover:border-primary",
      headerGradient: "bg-gradient-to-r from-orange-500/10 to-primary/10 border-orange-500/30",
      imageUrl: heroToolsImage,
      description: "Fitness calculators for BMR, calories, 1RM & more",
      ctaText: "Explore Tools",
      route: "/tools"
    },
    {
      title: "Exercise Library",
      headerIcon: <Video className="w-4 h-4 text-primary" />,
      borderColor: "border-emerald-500 hover:border-primary",
      headerGradient: "bg-gradient-to-r from-emerald-500/10 to-primary/10 border-emerald-500/30",
      imageUrl: heroLibraryImage,
      description: "Video demonstrations for every exercise",
      ctaText: "Browse Library",
      route: "/exerciselibrary"
    },
    {
      title: "Blog & News",
      headerIcon: <FileText className="w-4 h-4 text-primary" />,
      borderColor: "border-red-500 hover:border-primary",
      headerGradient: "bg-gradient-to-r from-red-500/10 to-primary/10 border-red-500/30",
      imageUrl: heroBlogImage,
      description: "Expert insights by Haris Falas",
      ctaText: "Read Articles",
      route: "/blog"
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {/* Static Feature Cards */}
      {featureCards.map((card) => (
        <FeatureCard
          key={card.title}
          title={card.title}
          headerIcon={card.headerIcon}
          borderColor={card.borderColor}
          headerGradient={card.headerGradient}
          imageUrl={card.imageUrl}
          description={card.description}
          ctaText={card.ctaText}
          onClick={() => navigate(card.route)}
        />
      ))}

      {/* WOD Card - Dynamic */}
      <div 
        onClick={() => navigate("/workout/wod")}
        className="cursor-pointer group border-2 border-green-500 rounded-xl 
                   hover:border-primary hover:shadow-xl hover:scale-105 hover:-translate-y-1 
                   transition-all duration-300
                   flex flex-col h-[220px] w-full overflow-hidden"
      >
        {/* Header: Workout of the Day with icon */}
        <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500/10 to-primary/10 border-b border-green-500/30">
          <Dumbbell className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Workout of the Day</span>
        </div>
        
        {/* WOD Card Content - smooth crossfade between WODs OR preparing message */}
        <div className="flex-1 relative overflow-hidden">
          {wods && wods.length > 0 ? (
            wods.slice(0, 2).map((wod, index) => (
              <div 
                key={wod.id}
                className={cn(
                  "absolute inset-0 flex flex-col transition-opacity duration-700 ease-in-out",
                  index === currentWodIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                {/* Image Section */}
                <div className="relative h-[130px] overflow-hidden bg-muted">
                  {wod.image_url ? (
                    <img 
                      src={wod.image_url} 
                      alt={wod.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                  {/* Equipment Badge - Only show for non-recovery workouts */}
                  {!isRecoveryWod(wod) && (
                    <div className="absolute top-2 left-2">
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                        wod.equipment?.toLowerCase().includes("none") || wod.equipment?.toLowerCase().includes("bodyweight")
                          ? "bg-emerald-500 text-white"
                          : "bg-blue-500 text-white"
                      )}>
                        {wod.equipment?.toLowerCase().includes("none") || wod.equipment?.toLowerCase().includes("bodyweight") 
                          ? "Bodyweight" 
                          : "Equipment"}
                      </span>
                    </div>
                  )}
                  {/* Premium Badge */}
                  {wod.is_premium && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" />
                        Premium
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="flex-1 p-2 flex flex-col justify-between">
                  {/* Workout Name */}
                  <p className="text-xs font-bold text-foreground line-clamp-1">{wod.name}</p>
                  
                  {/* Metadata Grid - 2 columns */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                    {/* Row 1: Category + Format */}
                    {wod.category && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-600 dark:text-orange-400 font-semibold uppercase">{wod.category}</span>
                      </div>
                    )}
                    {wod.format && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <Target className="w-3 h-3 text-primary" />
                        <span className="text-primary font-semibold uppercase">{wod.format}</span>
                      </div>
                    )}
                    
                    {/* Row 2: Difficulty + Duration */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400 font-semibold uppercase">
                        {getDifficultyLabel(wod.difficulty_stars, isRecoveryWod(wod))}
                      </span>
                    </div>
                    {wod.duration && (
                      <div className="flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3 text-purple-500" />
                        <span className="text-purple-600 dark:text-purple-400 font-semibold uppercase">{wod.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* CTA */}
                  <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-medium 
                                  group-hover:gap-2 transition-all mt-1">
                    View Today's WOD
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Preparing message when no WODs are available */
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Clock className="w-8 h-8 text-primary/50 mb-2 animate-pulse" />
              <p className="text-xs font-medium text-foreground">Today's Workouts</p>
              <p className="text-[10px] text-muted-foreground">Being Prepared</p>
              <p className="text-[10px] text-primary mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
