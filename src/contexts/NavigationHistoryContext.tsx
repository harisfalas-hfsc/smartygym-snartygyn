import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Pages that should NOT be tracked in navigation history
const EXCLUDED_PATHS = ['/auth', '/reset-password', '/payment-success', '/payment-cancelled'];

interface NavigationHistoryContextType {
  history: string[];
  goBack: () => void;
  canGoBack: boolean;
  goForward: () => void;
  canGoForward: boolean;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType | undefined>(undefined);

export const NavigationHistoryProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<string[]>([]);
  const [forwardStack, setForwardStack] = useState<string[]>([]);

  // Track when we're going back/forward programmatically to control stack mutation
  const isGoingBack = useRef(false);
  const isGoingForward = useRef(false);

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

    // If we're going forward, history is mutated by goForward — don't re-add
    if (isGoingForward.current) {
      isGoingForward.current = false;
      return;
    }

    // Only add if it's a new path (not the same as last)
    setHistory(prev => {
      if (prev[prev.length - 1] !== currentPath) {
        return [...prev, currentPath];
      }
      return prev;
    });

    // Any new (non-back/forward) navigation clears the forward stack — native behavior
    setForwardStack([]);
  }, [location.pathname]);

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      const popped = newHistory.pop();

      // Skip any excluded paths when going back
      while (newHistory.length > 0 && EXCLUDED_PATHS.includes(newHistory[newHistory.length - 1])) {
        newHistory.pop();
      }

      if (popped && !EXCLUDED_PATHS.includes(popped)) {
        setForwardStack(prev => [...prev, popped]);
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

  const goForward = () => {
    if (forwardStack.length === 0) return;
    const next = forwardStack[forwardStack.length - 1];
    setForwardStack(prev => prev.slice(0, -1));
    setHistory(prev => (prev[prev.length - 1] === next ? prev : [...prev, next]));
    isGoingForward.current = true;
    navigate(next);
  };

  const canGoBack = history.length > 1;
  const canGoForward = forwardStack.length > 0;

  return (
    <NavigationHistoryContext.Provider value={{ history, goBack, canGoBack, goForward, canGoForward }}>
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
