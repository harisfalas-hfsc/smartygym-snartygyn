import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Hook to determine if back button should be shown
 * Only shows back button when there's actual navigation history
 * (not when user directly lands on a page or comes from external link)
 */
export const useShowBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // Check if there's navigation state or if we're not on the first page
    // location.key === "default" means this is the first page load
    const hasHistory = location.key !== "default" && window.history.length > 1;
    setCanGoBack(hasHistory);
  }, [location]);

  const goBack = () => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return { canGoBack, goBack };
};
