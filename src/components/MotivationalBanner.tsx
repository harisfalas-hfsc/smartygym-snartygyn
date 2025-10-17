import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Utensils, Target, Zap } from "lucide-react";

interface MotivationalBannerProps {
  userName: string;
}

interface Message {
  text: string;
  action?: {
    label: string;
    route: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

export const MotivationalBanner = ({ userName }: MotivationalBannerProps) => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages: Message[] = [
    {
      text: `Hello ${userName}, let's crush it today! Time to get stronger and invest in your health.`,
    },
    {
      text: `${userName}, what's up today? Are we ready to smash our goals?`,
    },
    {
      text: `Let me challenge you, ${userName}. Ready for a personalized workout?`,
      action: {
        label: "Create Workout",
        route: "/workout",
        icon: Dumbbell,
      },
    },
    {
      text: `Feeling hungry for success, ${userName}? Let's design your perfect diet plan.`,
      action: {
        label: "Build Diet Plan",
        route: "/diet-plan",
        icon: Utensils,
      },
    },
    {
      text: `${userName}, it's time to level up! How about a complete training program?`,
      action: {
        label: "Start Program",
        route: "/training-program",
        icon: Target,
      },
    },
    {
      text: `Hey ${userName}, champions are built daily. What will you conquer today?`,
    },
    {
      text: `${userName}, your future self will thank you for today's effort!`,
    },
    {
      text: `Ready to transform, ${userName}? Every rep counts, every meal matters.`,
    },
  ];

  useEffect(() => {
    // Random interval between 60-90 seconds
    const getRandomInterval = () => Math.floor(Math.random() * 30000) + 60000;
    
    const rotateMessage = () => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 300);
    };

    const intervalId = setInterval(rotateMessage, getRandomInterval());

    return () => clearInterval(intervalId);
  }, [messages.length]);

  const currentMessage = messages[currentMessageIndex];

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <Zap className="h-6 w-6 text-primary animate-pulse" />
            <p
              className="text-base sm:text-lg font-medium"
              style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
            >
              {currentMessage.text}
            </p>
          </div>
          
          {currentMessage.action && (
            <Button
              onClick={() => navigate(currentMessage.action!.route)}
              variant="default"
              className="shadow-gold animate-scale-in"
            >
              <currentMessage.action.icon className="mr-2 h-4 w-4" />
              {currentMessage.action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};