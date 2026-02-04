import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import heroGymGroup from "@/assets/hero-gym-group.jpg";
import heroHomeCouple from "@/assets/hero-home-couple.jpg";
import heroParkCouple from "@/assets/hero-park-couple.jpg";

const heroImages = [heroGymGroup, heroHomeCouple, heroParkCouple];

type HeroBackgroundImagesProps = {
  className?: string;
  /** Interval in milliseconds between image transitions */
  interval?: number;
};

/**
 * Background images carousel helper:
 * - Shows rotating fitness images with smooth fade transitions
 * - Changes every 2.5 seconds by default
 */
export function HeroBackgroundImages({
  className,
  interval = 2500,
}: HeroBackgroundImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return (
    <>
      {heroImages.map((src, index) => (
        <img
          key={index}
          src={src}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000",
            currentIndex === index ? "opacity-100" : "opacity-0",
            className,
          )}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </>
  );
}
