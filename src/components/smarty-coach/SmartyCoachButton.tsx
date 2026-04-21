import { useState } from "react";
import { SmartyCoachModal } from "./SmartyCoachModal";
import { cn } from "@/lib/utils";
import smartyCoachIcon from "@/assets/smarty-coach-icon.png";
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
            <button
              onClick={() => setIsOpen(true)}
              className={cn(
                "fixed z-[80]",
                "top-[33vh] right-[calc(var(--sar)+0.75rem)]",
                "p-0 border-0 bg-transparent cursor-pointer",
                "hover:scale-110 active:scale-95 transition-transform duration-200",
                "animate-in slide-in-from-right-5 duration-300",
                "smarty-coach-attention motion-reduce:animate-none",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                className
              )}
              aria-label="Smarty Coach"
            >
              <img src={smartyCoachIcon} alt="Smarty Coach" className="h-12 w-12 drop-shadow-lg rounded-lg" loading="lazy" width={48} height={48} />
            </button>
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