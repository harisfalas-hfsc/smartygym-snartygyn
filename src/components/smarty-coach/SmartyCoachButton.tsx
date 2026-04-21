import { useState } from "react";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartyCoachModal } from "./SmartyCoachModal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartyCoachButtonProps {
  className?: string;
}

export const SmartyCoachButton = ({ className }: SmartyCoachButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className={cn(
                "fixed top-32 right-4 z-[80]",
                "h-20 w-20 rounded-full shadow-xl ring-2 ring-background/80",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "animate-in slide-in-from-right-5 duration-300",
                className
              )}
            >
              <Brain className="h-10 w-10 text-green-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Smarty Coach</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SmartyCoachModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};