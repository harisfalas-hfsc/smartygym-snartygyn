import { useEffect, useRef, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  /** How far before the element enters viewport to start loading (default: 200px) */
  rootMargin?: string;
  /** Placeholder height to prevent layout shift */
  minHeight?: string;
}

/**
 * Lazy loads its children when they're about to enter the viewport.
 * Uses IntersectionObserver for efficient scroll detection.
 */
export function LazySection({
  children,
  className = "",
  rootMargin = "200px",
  minHeight = "100px",
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // If IntersectionObserver not supported, show immediately
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once visible, stop observing
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible ? children : null}
    </div>
  );
}
