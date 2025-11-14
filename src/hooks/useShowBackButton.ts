import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

/**
 * Hook to determine if back button should be shown
 * Tracks navigation history and detects programmatic navigation
 * Shows back button when navigating via call-to-action buttons
 */
export const useShowBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);
  
  // Track the current section and navigation history within it
  const currentSectionRef = useRef<string>("");
  const sectionHistoryRef = useRef<string[]>([]);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // On initial mount, check if we can use browser history
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Check if there's a referrer state or if window.history.length > 1
      const hasReferrer = location.state?.from || window.history.length > 1;
      setCanGoBack(hasReferrer);
      return;
    }

    // Get the main section from the path (e.g., "/workout", "/trainingprogram")
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const mainSection = pathSegments.length > 0 ? `/${pathSegments[0]}` : '/';
    
    // Check if we've switched to a new section
    if (currentSectionRef.current !== mainSection) {
      // New section - but check if we have browser history
      currentSectionRef.current = mainSection;
      sectionHistoryRef.current = [location.pathname];
      
      // Show back button if we have referrer state or browser history
      const hasNavigation = location.state?.from || window.history.length > 2;
      setCanGoBack(hasNavigation);
    } else {
      // Same section - add to history if it's a new path
      const currentPath = location.pathname;
      const lastPath = sectionHistoryRef.current[sectionHistoryRef.current.length - 1];
      
      if (currentPath !== lastPath) {
        sectionHistoryRef.current.push(currentPath);
      }
      
      // Show back button if we have more than one page in section history
      setCanGoBack(sectionHistoryRef.current.length > 1);
    }
  }, [location]);

  const goBack = () => {
    if (canGoBack && sectionHistoryRef.current.length > 1) {
      // Remove current page from history
      sectionHistoryRef.current.pop();
      navigate(-1);
    } else if (canGoBack) {
      // Use browser back if we have history
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return { canGoBack, goBack };
};
