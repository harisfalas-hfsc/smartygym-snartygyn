import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { SmartyCoachChat } from "./SmartyCoachChat";

export const SmartyCoach = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Interface */}
      {isOpen && <SmartyCoachChat onClose={() => setIsOpen(false)} />}

      {/* Floating Bubble */}
      <div className="fixed bottom-24 right-6 z-40 group">
        <Button
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-gold hover:scale-110 transition-all bg-gradient-to-r from-accent via-primary to-primary/90 relative"
        >
          <Sparkles className="h-6 w-6" />
          {/* Pulse animation for first-time users */}
          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        </Button>

        {/* Hover Label */}
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-lg text-sm font-medium shadow-lg border border-border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          SmartyCoach
        </span>
      </div>
    </>
  );
};
