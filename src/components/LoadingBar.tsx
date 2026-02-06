import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

export const LoadingBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const prevPathRef = useRef(location.pathname);

  // Detect route changes via useLocation
  useEffect(() => {
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setIsLoading(true);
      // Route has changed, briefly show loading then complete
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

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

  if (!isLoading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1">
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
