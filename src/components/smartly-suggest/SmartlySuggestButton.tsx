import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { SmartlySuggestModal } from "./SmartlySuggestModal";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SmartlySuggestButtonProps {
  className?: string;
}

export const SmartlySuggestButton = ({ className }: SmartlySuggestButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userTier, isLoading } = useAccessControl();

  // Only show for premium users
  if (isLoading || userTier !== 'premium') {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              size="icon"
              className={cn(
                "fixed top-32 right-4 z-40",
                "h-14 w-14 rounded-full shadow-xl",
                "bg-primary hover:bg-primary/90 text-primary-foreground",
                "animate-in slide-in-from-right-5 duration-300",
                className
              )}
            >
              <Lightbulb className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Smartly Suggest</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <SmartlySuggestModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};
