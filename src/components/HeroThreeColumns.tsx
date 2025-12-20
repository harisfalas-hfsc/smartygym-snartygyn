import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dumbbell, 
  Calendar, 
  Sparkles, 
  Calculator, 
  FileText, 
  Video,
  Users,
  Heart,
  GraduationCap,
  Target,
  Plane,
  Smartphone,
  UserCheck,
  CalendarCheck,
  ChevronRight,
  Star,
  CircleDollarSign,
  Crown,
  Flame,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessControl } from "@/contexts/AccessControlContext";

interface AnimatedBulletProps {
  icon: React.ReactNode;
  text: string;
  delay: number;
  onClick?: () => void;
  isLink?: boolean;
  isVisible: boolean;
  highlight?: boolean;
  subtitle?: string;
}

const AnimatedBullet = ({ icon, text, delay, onClick, isLink, isVisible, highlight, subtitle }: AnimatedBulletProps) => {
  const [show, setShow] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div 
      className={cn(
        "flex items-center gap-2 transition-all duration-300 rounded-md px-2 py-1 -mx-2",
        isLink && "cursor-pointer hover:text-primary hover:bg-primary/10 group",
        !isLink && "hover:bg-muted/50",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        isHovered && "bg-primary/10 scale-[1.02]"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="flex-shrink-0">{icon}</span>
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-medium",
          isLink && "group-hover:text-primary transition-colors",
          highlight && "text-red-600",
          isHovered && "text-primary"
        )}>
          {text}
        </span>
        {subtitle && (
          <span className={cn(
            "text-xs text-muted-foreground transition-all duration-300",
            isHovered ? "opacity-100 max-h-5" : "opacity-0 max-h-0 overflow-hidden"
          )}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

// Helper to convert star count to difficulty label
const getDifficultyLabel = (stars: number): string => {
  if (stars <= 2) return "Beginner";
  if (stars <= 4) return "Intermediate";
  return "Advanced"; // 5-6 stars
};

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentWodIndex, setCurrentWodIndex] = useState(0);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch both WODs for the banner with full card data
  const { data: wods } = useQuery({
    queryKey: ["wod-hero-banner"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_workouts")
        .select("id, name, category, focus, difficulty_stars, duration, image_url, equipment, is_premium, type")
        .eq("is_workout_of_day", true)
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

  const exploreLinks = [
    { text: "Smarty Workouts", subtitle: "500+ workouts", icon: <Dumbbell className="w-4 h-4 text-primary" />, route: "/workout" },
    { text: "Smarty Programs", subtitle: "structured long-term plans", icon: <Calendar className="w-4 h-4 text-blue-500" />, route: "/trainingprogram" },
    { text: "Smarty Ritual", subtitle: "daily wellness guide", icon: <Sparkles className="w-4 h-4 text-purple-500" />, route: "/daily-ritual" },
    { text: "Smarty Tools", subtitle: "fitness calculators", icon: <Calculator className="w-4 h-4 text-orange-500" />, route: "/tools" },
    { text: "Blog & Expert Articles", subtitle: "designed by Haris Falas", icon: <FileText className="w-4 h-4 text-red-500" />, route: "/blog" },
    { text: "Exercise Library", subtitle: "demonstration videos", icon: <Video className="w-4 h-4 text-emerald-500" />, route: "/exerciselibrary" },
  ];

  const whoIsFor = [
    { text: "Busy Adults", icon: <Users className="w-4 h-4 text-blue-500" /> },
    { text: "Parents", icon: <Heart className="w-4 h-4 text-pink-500" /> },
    { text: "Beginners", icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
    { text: "Intermediate Lifters", icon: <Target className="w-4 h-4 text-orange-500" /> },
    { text: "Travelers", icon: <Plane className="w-4 h-4 text-cyan-500" /> },
    { text: "Gym-Goers", icon: <Dumbbell className="w-4 h-4 text-purple-500" /> },
  ];

  const credentials = [
    { text: "Online Fitness Redefined", icon: <Sparkles className="w-4 h-4 text-purple-500" /> },
    { text: "Your Gym In Your Pocket", icon: <Smartphone className="w-4 h-4 text-cyan-500" /> },
    { text: "100% Human. 0% AI.", icon: <UserCheck className="w-4 h-4 text-red-500" />, highlight: true },
    { text: "Train Anywhere, Anytime", icon: <Plane className="w-4 h-4 text-emerald-500" /> },
  ];

  const renderStars = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-3 h-3 fill-primary text-primary" />
    ));
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-4 mt-6">
      {/* Column 1: Explore */}
      <div className="pt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Explore
        </h3>
        <div className="space-y-1.5">
          {exploreLinks.map((item, index) => (
            <AnimatedBullet
              key={item.text}
              icon={item.icon}
              text={item.text}
              subtitle={item.subtitle}
              delay={100 + index * 100}
              onClick={() => navigate(item.route)}
              isLink
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      {/* Column 2: Who is SmartyGym For? */}
      <div className="pt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Who is <span className="text-primary">SmartyGym</span> For
        </h3>
        <div className="space-y-1.5">
          {whoIsFor.map((item, index) => (
            <AnimatedBullet
              key={item.text}
              icon={item.icon}
              text={item.text}
              delay={200 + index * 100}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      {/* Column 3: Why SmartyGym */}
      <div className="pt-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Why SmartyGym
        </h3>
        <div className="space-y-1.5">
          {credentials.map((item, index) => (
            <AnimatedBullet
              key={item.text}
              icon={item.icon}
              text={item.text}
              delay={300 + index * 100}
              isVisible={isVisible}
              highlight={item.highlight}
            />
          ))}
        </div>
        
        {/* Simple CTA Link */}
        <div 
          onClick={() => navigate("/human-performance")}
          className="mt-1.5 flex items-center gap-2 cursor-pointer group hover:text-primary transition-colors rounded-md px-2 py-1 -mx-2 hover:bg-primary/10"
        >
          <CircleDollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
          <span className="text-sm font-bold text-green-500 group-hover:text-primary transition-colors">Why SmartyGym?</span>
        </div>
        
        {/* Join SmartyGym Now - Only for non-premium users */}
        {!isPremium && (
          <div 
            onClick={() => navigate("/joinpremium")}
            className="mt-1.5 flex items-center gap-2 cursor-pointer group hover:text-primary transition-colors rounded-md px-2 py-1 -mx-2 hover:bg-primary/10"
          >
            <Crown className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span className="text-sm font-bold text-sky-500 group-hover:text-primary transition-colors">Join SmartyGym Now</span>
          </div>
        )}
      </div>

      {/* Column 4: WOD Promotional Banner */}
      <div className="pt-8">
        <div 
          onClick={() => navigate("/workout/wod")}
          className="cursor-pointer group border-2 border-green-500 rounded-xl 
                     hover:border-primary hover:shadow-xl hover:scale-105 hover:-translate-y-1 
                     transition-all duration-300
                     flex flex-col h-[220px] w-[250px] overflow-hidden"
        >
          {/* Header: Workout of the Day with icon */}
          <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500/10 to-primary/10 border-b border-green-500/30">
            <Dumbbell className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wide">Workout of the Day</span>
          </div>
          
          {/* WOD Card Content - smooth crossfade between WODs */}
          <div className="flex-1 relative overflow-hidden">
            {wods?.slice(0, 2).map((wod, index) => (
              <div 
                key={wod.id}
                className={cn(
                  "absolute inset-0 flex flex-col transition-opacity duration-700 ease-in-out",
                  index === currentWodIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                )}
              >
                {/* Image Section */}
                <div className="relative h-[100px] overflow-hidden bg-muted">
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
                  {/* Equipment Badge */}
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
                  
                  {/* Type with icon */}
                  {wod.type && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Target className="w-3 h-3 text-primary" />
                      <span className="text-primary font-semibold uppercase">{wod.type}</span>
                    </div>
                  )}
                  
                  {/* Category with icon */}
                  {wod.category && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-orange-600 dark:text-orange-400 font-medium">{wod.category}</span>
                    </div>
                  )}
                  
                  {/* Difficulty Level with icon and text label */}
                  {wod.difficulty_stars && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                        {getDifficultyLabel(wod.difficulty_stars)}
                      </span>
                    </div>
                  )}
                  
                  {/* Duration with icon */}
                  {wod.duration && (
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <Clock className="w-3 h-3 text-purple-500" />
                      <span className="text-purple-600 dark:text-purple-400 font-medium">{wod.duration}</span>
                    </div>
                  )}
                  
                  {/* CTA */}
                  <div className="flex items-center justify-center gap-1 text-primary text-[10px] font-medium 
                                  group-hover:gap-2 transition-all mt-1">
                    View Today's WOD
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
