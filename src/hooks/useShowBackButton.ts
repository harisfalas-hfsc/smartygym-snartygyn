import { useNavigate } from "react-router-dom";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

/**
 * Hook to handle back button navigation
 * Always shows back button - goes to previous page or homepage if no history
 */
export const useShowBackButton = () => {
  const navigate = useNavigate();
  const { history, goBack: contextGoBack } = useNavigationHistory();

  // Always show back button
  const canGoBack = true;

  const goBack = () => {
    if (history.length > 1) {
      // Go to previous page in our in-app history
      contextGoBack();
    } else {
      // No in-app history, go to homepage
      navigate("/");
    }
  };

  return { canGoBack, goBack };
};
