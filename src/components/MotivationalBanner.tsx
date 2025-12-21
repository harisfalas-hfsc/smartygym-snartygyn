import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dumbbell, Target, Zap } from "lucide-react";

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
      text: `Hello ${userName}, let's crush it today! Time to get stronger and invest in your health. 💪`,
    },
    {
      text: `${userName}, what's up today? Are you ready to smash your goals? 🔥`,
    },
    {
      text: `Let me challenge you, ${userName}. Ready for a personalized workout? 💥`,
      action: {
        label: "Create Workout",
        route: "/workout",
        icon: Dumbbell,
      },
    },
    {
      text: `${userName}, it's time to level up! How about a complete training program? 🎯`,
      action: {
        label: "Start Program",
        route: "/trainingprogram",
        icon: Target,
      },
    },
    {
      text: `Hey ${userName}, champions are built daily. What will you conquer today? ⚡`,
    },
    {
      text: `${userName}, your future self will thank you for today's effort! 🌟`,
    },
    {
      text: `Ready to transform, ${userName}? Every rep counts, every meal matters. 🚀`,
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
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-sky-500/10 to-primary/5 animate-gradient-xy">
      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 100% 50%;
          }
          50% {
            background-position: 100% 100%;
          }
          75% {
            background-position: 0% 100%;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
      
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-shimmer" 
           style={{ animation: 'shimmer 3s infinite' }} />
      
      <div className="container mx-auto max-w-7xl px-3 py-3 sm:py-4 relative z-10">
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 transition-all duration-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-center max-w-full px-2">
            <div className="relative flex-shrink-0 hidden sm:block">
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-primary animate-bounce drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-sky-400 absolute inset-0 animate-ping opacity-75" />
            </div>
            <p
              className="text-xs sm:text-base md:text-xl font-bold bg-gradient-to-r from-primary via-sky-500 to-primary bg-clip-text text-transparent leading-tight sm:leading-normal"
              style={{ 
                fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                backgroundSize: '200% auto',
              }}
            >
              {currentMessage.text}
            </p>
            <div className="relative flex-shrink-0 hidden sm:block">
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-primary animate-bounce drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]" style={{ animationDelay: '0.2s' }} />
              <Zap className="h-5 w-5 sm:h-7 sm:w-7 text-sky-400 absolute inset-0 animate-ping opacity-75" style={{ animationDelay: '0.2s' }} />
            </div>
          </div>
          
          {currentMessage.action && (
            <div className="mt-1 sm:mt-0">
              <Button
                onClick={() => navigate(currentMessage.action!.route)}
                variant="default"
                size="sm"
                className="shadow-primary hover:scale-105 transition-all duration-300 bg-gradient-to-r from-primary to-sky-500 font-bold text-xs sm:text-base px-4 sm:px-8"
              >
                <currentMessage.action.icon className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {currentMessage.action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};