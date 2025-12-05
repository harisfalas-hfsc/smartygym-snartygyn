import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationHistoryContextType {
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export const NavigationHistoryProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = historyRef.current[historyRef.current.length - 1];

    // Only add if it's a new path (not the same as last)
    if (currentPath !== lastPath) {
      historyRef.current = [...historyRef.current, currentPath];
    }
  }, [location.pathname]);

  const goBack = () => {
    if (historyRef.current.length > 1) {
      // Remove current page
      historyRef.current.pop();
      // Get previous page
      const previousPath = historyRef.current[historyRef.current.length - 1];
      navigate(previousPath);
    } else {
      // No history, go to homepage
      historyRef.current = ["/"];
      navigate("/");
    }
  };

  const canGoBack = historyRef.current.length > 1;

  return (
    <NavigationHistoryContext.Provider value={{ history: historyRef.current, goBack, canGoBack }}>
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
