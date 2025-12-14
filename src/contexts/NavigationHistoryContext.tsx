import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Pages that should NOT be tracked in navigation history
const EXCLUDED_PATHS = ['/auth', '/reset-password', '/payment-success', '/payment-cancelled'];

interface NavigationHistoryContextType {
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export const NavigationHistoryProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([]);
  
  // Track when we're going back to prevent re-adding to history
  const isGoingBack = useRef(false);

  useEffect(() => {
    const currentPath = location.pathname;

    // Skip excluded paths (auth-related, payment confirmations)
    if (EXCLUDED_PATHS.includes(currentPath)) {
      return;
    }

    // Skip if we're in the middle of a back navigation
    if (isGoingBack.current) {
      isGoingBack.current = false;
      return;
    }

    // Only add if it's a new path (not the same as last)
    setHistory(prev => {
      if (prev[prev.length - 1] !== currentPath) {
        return [...prev, currentPath];
      }
      return prev;
    });
  }, [location.pathname]);

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      
      // Skip any excluded paths when going back
      while (newHistory.length > 0 && EXCLUDED_PATHS.includes(newHistory[newHistory.length - 1])) {
        newHistory.pop();
      }
      
      if (newHistory.length > 0) {
        const previousPath = newHistory[newHistory.length - 1];
        isGoingBack.current = true;
        setHistory(newHistory);
        navigate(previousPath);
      } else {
        isGoingBack.current = true;
        setHistory(["/"]);
        navigate("/");
      }
    } else {
      isGoingBack.current = true;
      setHistory(["/"]);
      navigate("/");
    }
  };

  const canGoBack = history.length > 1;

  return (
    <NavigationHistoryContext.Provider value={{ history, goBack, canGoBack }}>
      {children}
    </NavigationHistoryContext.Provider>
  );
};

export const useNavigationHistory = () => {
  const context = useContext(NavigationHistoryContext);
  if (!context) {
    throw new Error("useNavigationHistory must be used within NavigationHistoryProvider");
  }
  return context;
};
