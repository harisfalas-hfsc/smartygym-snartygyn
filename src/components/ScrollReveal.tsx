import { useEffect, useRef, ReactNode, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ScrollReveal = ({ children, delay = 0, className = "" }: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Fallback timeout to ensure content is always visible (especially on mobile)
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
      if (element) {
        element.classList.add("animate-fade-in");
        element.classList.remove("opacity-0");
      }
    }, delay + 500); // Show after delay + 500ms max

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            clearTimeout(fallbackTimer);
            setTimeout(() => {
              setIsVisible(true);
              entry.target.classList.add("animate-fade-in");
              entry.target.classList.remove("opacity-0");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01, // Lower threshold for better mobile support
        rootMargin: "0px 0px 0px 0px", // Simplified for mobile
      }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={elementRef} className={`${isVisible ? '' : 'opacity-0'} transition-opacity duration-500 ${className}`}>
      {children}
    </div>
  );
};
