import { useEffect, useState } from "react";
import { useNavigation } from "react-router-dom";

export const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => {
        setProgress(0);
      }, 500);
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  // Listen to route changes
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    window.addEventListener("beforeunload", handleStart);
    
    // Monitor navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      handleStart();
      originalPushState.apply(window.history, args);
      setTimeout(handleComplete, 300);
    };

    window.history.replaceState = function(...args) {
      handleStart();
      originalReplaceState.apply(window.history, args);
      setTimeout(handleComplete, 300);
    };

    window.addEventListener("popstate", () => {
      handleStart();
      setTimeout(handleComplete, 300);
    });

    return () => {
      window.removeEventListener("beforeunload", handleStart);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-1">
      <div
        className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary transition-all duration-300 ease-out shadow-lg shadow-primary/50"
        style={{
          width: `${progress}%`,
          transition: progress === 100 ? "width 0.3s ease-out" : "width 0.2s ease-out",
        }}
      />
    </div>
  );
};
