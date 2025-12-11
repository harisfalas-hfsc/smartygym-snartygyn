import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        "flex items-center gap-3 transition-all duration-300 rounded-md px-2 py-1.5 -mx-2",
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const exploreLinks = [
    { text: "Smarty Workouts", subtitle: "500+ workouts", icon: <Dumbbell className="w-5 h-5 text-primary" />, route: "/workout" },
    { text: "Smarty Programs", subtitle: "structured long-term plans", icon: <Calendar className="w-5 h-5 text-primary" />, route: "/trainingprogram" },
    { text: "Smarty Ritual", subtitle: "daily wellness guide", icon: <Sparkles className="w-5 h-5 text-primary" />, route: "/daily-ritual" },
    { text: "Smarty Tools", subtitle: "fitness calculators", icon: <Calculator className="w-5 h-5 text-primary" />, route: "/tools" },
    { text: "Blog & Expert Articles", subtitle: "designed by Haris Falas", icon: <FileText className="w-5 h-5 text-primary" />, route: "/blog" },
    { text: "Exercise Library", subtitle: "demonstration videos", icon: <Video className="w-5 h-5 text-primary" />, route: "/exerciselibrary" },
  ];

  const whoIsFor = [
    { text: "Busy Adults", icon: <Users className="w-5 h-5 text-primary" /> },
    { text: "Parents", icon: <Heart className="w-5 h-5 text-primary" /> },
    { text: "Beginners", icon: <GraduationCap className="w-5 h-5 text-primary" /> },
    { text: "Intermediate Lifters", icon: <Target className="w-5 h-5 text-primary" /> },
    { text: "Travelers", icon: <Plane className="w-5 h-5 text-primary" /> },
    { text: "Gym-Goers", icon: <Dumbbell className="w-5 h-5 text-primary" /> },
  ];

  const credentials = [
    { text: "Online Fitness Redefined", icon: <Sparkles className="w-5 h-5 text-primary" /> },
    { text: "Your Gym In Your Pocket", icon: <Smartphone className="w-5 h-5 text-primary" /> },
    { text: "100% Human. 0% AI.", icon: <UserCheck className="w-5 h-5 text-primary" />, highlight: true },
    { text: "Train Anywhere, Anytime", icon: <Plane className="w-5 h-5 text-primary" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0 mt-8">
      {/* Column 1: Explore */}
      <div className="lg:pr-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Explore
        </h3>
        <div className="space-y-3">
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
      <div className="lg:pl-8 lg:pr-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Who is <span className="text-primary">SmartyGym</span> For?
        </h3>
        <div className="space-y-3">
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
      <div className="lg:pl-8">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Why SmartyGym
        </h3>
        <div className="space-y-3">
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
      </div>
    </div>
  );
};
