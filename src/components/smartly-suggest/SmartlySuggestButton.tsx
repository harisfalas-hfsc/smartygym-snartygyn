import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { SmartlySuggestSheet } from "./SmartlySuggestSheet";
import { cn } from "@/lib/utils";

interface SmartlySuggestButtonProps {
  contentType: 'workout' | 'program';
  className?: string;
}

export const SmartlySuggestButton = ({ contentType, className }: SmartlySuggestButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { userTier, isLoading } = useAccessControl();

  // Only show for premium users
  if (isLoading || userTier !== 'premium') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "rounded-full px-4 py-2 h-auto",
          "flex items-center gap-2",
          "animate-in slide-in-from-bottom-5 duration-300",
          className
        )}
      >
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">Smartly Suggest</span>
      </Button>

      <SmartlySuggestSheet 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        contentType={contentType}
      />
    </>
  );
};
