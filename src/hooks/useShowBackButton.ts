import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";

/**
 * Hook to handle back button navigation
 * Always shows back button on desktop - hidden on mobile (users use native gestures)
 */
export const useShowBackButton = () => {
  const navigate = useNavigate();
  const { canGoBack: contextCanGoBack, goBack: contextGoBack } = useNavigationHistory();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Hide back button on mobile — users use native back gesture/button
  const canGoBack = !isMobile;

  const goBack = () => {
    if (contextCanGoBack) {
      contextGoBack();
    } else {
      navigate("/");
    }
  };

  return { canGoBack, goBack };
};
