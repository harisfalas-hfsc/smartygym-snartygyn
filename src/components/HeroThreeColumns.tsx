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
  description?: string;
  isVisible: boolean;
}

const AnimatedBullet = ({ icon, text, delay, onClick, isLink, description, isVisible }: AnimatedBulletProps) => {
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
        "flex items-start gap-3 transition-all duration-500",
        isLink && "cursor-pointer hover:text-primary group",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      onClick={onClick}
    >
      <span className="flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-medium",
          isLink && "group-hover:text-primary transition-colors"
        )}>
          {text}
        </span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  );
};

interface CredentialCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  delay: number;
  highlight?: boolean;
  isVisible: boolean;
}

const CredentialCard = ({ icon, title, subtitle, delay, highlight, isVisible }: CredentialCardProps) => {
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
        "flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-primary/20 transition-all duration-500",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className={cn(
          "text-sm font-bold",
          highlight && "text-red-600"
        )}>
          {title}
        </span>
        {subtitle && (
          <span className="text-sm font-bold">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export const HeroThreeColumns = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
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
    { text: "Busy Adults", description: "Quick, effective workouts that fit your schedule", icon: <Users className="w-5 h-5 text-primary" /> },
    { text: "Parents", description: "Train at home while kids play nearby", icon: <Heart className="w-5 h-5 text-primary" /> },
    { text: "Beginners", description: "Start your fitness journey with guided programs", icon: <GraduationCap className="w-5 h-5 text-primary" /> },
    { text: "Intermediate Lifters", description: "Push past plateaus with structured plans", icon: <Target className="w-5 h-5 text-primary" /> },
    { text: "Travelers", description: "Stay consistent wherever you go", icon: <Plane className="w-5 h-5 text-primary" /> },
    { text: "Gym-Goers", description: "Enhance your gym routine with expert guidance", icon: <Dumbbell className="w-5 h-5 text-primary" /> },
  ];

  const credentials = [
    { title: "Online Fitness", subtitle: "Redefined", icon: <Sparkles className="w-5 h-5 text-primary" /> },
    { title: "Your Gym", subtitle: "In Your Pocket", icon: <Smartphone className="w-5 h-5 text-primary" /> },
    { title: "100% Human.", subtitle: "0% AI.", icon: <UserCheck className="w-5 h-5 text-primary" />, highlight: true },
    { title: "Train Anywhere,", subtitle: "Anytime", icon: <Plane className="w-5 h-5 text-primary" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-0 mt-8">
      {/* Column 1: Explore */}
      <div className="lg:border-r lg:border-primary/30">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
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

      {/* Flexible Spacer 1 */}
      <div className="hidden lg:block lg:flex-1 lg:min-w-12" />

      {/* Column 2: Who is SmartyGym For? */}
      <div className="lg:border-r lg:border-primary/30">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Who is <span className="text-primary ml-1">SmartyGym</span> <span className="ml-1">For?</span>
        </h3>
        <div className="space-y-3">
          {whoIsFor.map((item, index) => (
            <AnimatedBullet
              key={item.text}
              icon={item.icon}
              text={item.text}
              description={item.description}
              delay={200 + index * 100}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      {/* Flexible Spacer 2 */}
      <div className="hidden lg:block lg:flex-1 lg:min-w-12" />

      {/* Column 3: Credentials */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Why SmartyGym
        </h3>
        <div className="space-y-3">
          {credentials.map((item, index) => (
            <CredentialCard
              key={item.title}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              delay={300 + index * 100}
              highlight={item.highlight}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
