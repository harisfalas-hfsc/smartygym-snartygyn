import { useEffect, useRef, ReactNode, useState } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ScrollReveal = ({ children, delay = 0, className = "" }: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  // Start visible immediately to prevent blank page - animation is progressive enhancement
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Skip animation entirely if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setTimeout(() => {
              setHasAnimated(true);
              entry.target.classList.add("animate-fade-in");
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: "50px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [delay, hasAnimated]);

  // Always render content visible - animation is just an enhancement
  return (
    <div ref={elementRef} className={`transition-opacity duration-300 ${className}`}>
      {children}
    </div>
  );
};
