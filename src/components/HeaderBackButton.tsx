import { ChevronLeft } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

/**
 * Small circular back button rendered inline in the header, just to the
 * left of the SMARTYGYM wordmark. Mirrors the pattern used on
 * smartymove.com/onboarding/parq. Hidden on the homepage and the top-level
 * dashboard / admin grids where "back" would be meaningless.
 */
export const HeaderBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canGoBack, goBack } = useNavigationHistory();

  const isDashboardGrid = location.pathname === "/userdashboard" && !searchParams.get("tab");
  const isAdminGrid = location.pathname === "/admin" && !searchParams.get("section");

  if (location.pathname === "/" || isDashboardGrid || isAdminGrid) return null;

  const handleBack = () => {
    if (location.pathname === "/userdashboard" && searchParams.get("tab")) {
      navigate("/userdashboard");
      return;
    }
    if (location.pathname === "/admin" && searchParams.get("section")) {
      navigate("/admin");
      return;
    }
    if (canGoBack) {
      goBack();
    } else {
      navigate("/");
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back to previous page"
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
  );
};
