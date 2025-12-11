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
}

const AnimatedBullet = ({ icon, text, delay, onClick, isLink, isVisible, highlight }: AnimatedBulletProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, delay]);

  return (
    <div 
      className={cn(
        "flex items-center gap-3 transition-all duration-300 rounded-md px-2 py-1 -mx-2",
        isLink && "cursor-pointer hover:text-primary hover:bg-primary/5 group",
        !isLink && "hover:bg-muted/50",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      onClick={onClick}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className={cn(
        "text-sm font-medium",
        isLink && "group-hover:text-primary transition-colors",
        highlight && "text-red-600"
      )}>
        {text}
      </span>
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
    { text: "Smarty Workouts", icon: <Dumbbell className="w-5 h-5 text-primary" />, route: "/workout" },
    { text: "Smarty Programs", icon: <Calendar className="w-5 h-5 text-primary" />, route: "/trainingprogram" },
    { text: "Smarty Ritual", icon: <Sparkles className="w-5 h-5 text-primary" />, route: "/daily-ritual" },
    { text: "Smarty Tools", icon: <Calculator className="w-5 h-5 text-primary" />, route: "/tools" },
    { text: "Blog & Expert Articles", icon: <FileText className="w-5 h-5 text-primary" />, route: "/blog" },
    { text: "Exercise Library", icon: <Video className="w-5 h-5 text-primary" />, route: "/exerciselibrary" },
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
      <div className="lg:pr-6">
        <h3 className="text-lg font-bold text-foreground mb-4">
          Explore
        </h3>
        <div className="space-y-3">
          {exploreLinks.map((item, index) => (
            <AnimatedBullet
              key={item.text}
              icon={item.icon}
              text={item.text}
              delay={100 + index * 100}
              onClick={() => navigate(item.route)}
              isLink
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      {/* Column 2: Who is SmartyGym For? */}
      <div className="lg:pl-6 lg:pr-6">
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
      <div className="lg:pl-6">
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
