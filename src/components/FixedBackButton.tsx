import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

/**
 * Global fixed back button component that stays visible while scrolling.
 * Uses the existing useShowBackButton hook for navigation logic.
 * Hidden on homepage where back navigation doesn't make sense.
 */
export const FixedBackButton = () => {
  const location = useLocation();
  const { goBack } = useShowBackButton();
  
  // Hide on homepage
  if (location.pathname === '/') return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={goBack}
      className="fixed left-4 z-40 gap-2 
        bg-background/80 backdrop-blur-md 
        border border-primary/30 
        rounded-full shadow-lg
        hover:bg-background/90
        hover:scale-105 active:scale-95
        transition-all duration-200"
      style={{ top: 'calc(var(--app-header-h, 100px) + 0.5rem)' }}
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Back</span>
    </Button>
  );
};
