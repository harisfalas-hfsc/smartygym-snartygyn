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
  Crown
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

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentWodIndex, setCurrentWodIndex] = useState(0);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch both WODs for the banner
  const { data: wods } = useQuery({
    queryKey: ["wod-hero-banner"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_workouts")
        .select("id, name, category, focus, difficulty_stars, duration")
        .eq("is_workout_of_day", true)
        .limit(2);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Rotate between WODs every 2 seconds
  useEffect(() => {
    if (wods && wods.length > 1) {
      const interval = setInterval(() => {
        setCurrentWodIndex((prev) => (prev === 0 ? 1 : 0));
      }, 2000);
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
          className="cursor-pointer group border-2 border-green-500 rounded-xl p-4 
                     hover:border-primary hover:shadow-xl hover:scale-105 hover:-translate-y-1 
                     transition-all duration-300
                     flex flex-col items-center h-[220px] w-[250px] overflow-hidden"
        >
          {/* Gold Circle with Dumbbell */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full 
                            flex items-center justify-center shadow-md
                            group-hover:scale-110 transition-transform duration-300
                            ring-2 ring-red-500 dark:ring-red-400 ring-offset-2 ring-offset-background">
              <Dumbbell className="w-7 h-7 text-primary" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary/10 blur-xl -z-10" />
          </div>
          
          {/* Title */}
          <h3 className="text-base font-bold text-primary text-center mt-3 group-hover:underline transition-all">
            Workout of the Day
          </h3>
          
          {/* WOD Details - rotates between WODs */}
          {currentWod && (
            <div 
              key={currentWod.id}
              className="mt-2 text-center space-y-1 animate-fade-in h-[70px]"
            >
              <p className="text-sm font-semibold text-foreground line-clamp-2 max-w-[200px] leading-tight h-[36px]">{currentWod.name}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground flex-wrap">
                {currentWod.category && <span className="text-red-600 dark:text-red-400 font-medium">{currentWod.category}</span>}
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">{currentWod.focus || "General"}</span>
                {currentWod.difficulty_stars && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400 font-medium">{renderStars(currentWod.difficulty_stars)}</span>
                  </>
                )}
                {currentWod.duration && (
                  <>
                    <span>•</span>
                    <span className="text-purple-600 dark:text-purple-400 font-medium">{currentWod.duration}</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="flex items-center justify-center gap-1 mt-2 text-primary text-sm font-medium 
                          group-hover:gap-2 transition-all">
            View Today's WOD
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
