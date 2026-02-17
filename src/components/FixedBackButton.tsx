import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

/**
 * Global fixed back button component that stays visible while scrolling.
 * Uses the existing useShowBackButton hook for navigation logic.
 * Hidden on homepage and main dashboard grid where back navigation doesn't make sense.
 */
export const FixedBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { goBack } = useShowBackButton();
  
  const isDashboardGrid = location.pathname === '/userdashboard' && !searchParams.get('tab');
  
  // Hide on homepage and main dashboard grid (user's "home")
  if (location.pathname === '/' || isDashboardGrid) return null;
  
  const handleBack = () => {
    // If on a dashboard tab, go back to dashboard grid
    if (location.pathname === '/userdashboard' && searchParams.get('tab')) {
      navigate('/userdashboard');
      return;
    }
    goBack();
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="hidden md:inline-flex fixed left-4 z-40 gap-2 
        bg-background/80 backdrop-blur-md 
        border border-primary/30 
        rounded-full shadow-lg
        hover:bg-background/90
        hover:scale-105 active:scale-95
        transition-all duration-200"
      style={{ top: 'calc(var(--app-header-h, 100px) + 3rem)' }}
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-xs sm:text-sm">Back</span>
    </Button>
  );
};
