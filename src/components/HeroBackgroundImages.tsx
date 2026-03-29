import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import heroGymGroup from "@/assets/hero-gym-group.jpg";
import heroHomeCouple from "@/assets/hero-home-couple.jpg";
import heroParkCouple from "@/assets/hero-park-couple.jpg";

const heroImages = [
  { src: heroParkCouple, filter: "" },
  { src: heroGymGroup, filter: "brightness-[0.6]" },
  { src: heroParkCouple, filter: "" },
  { src: heroHomeCouple, filter: "brightness-[0.65]" },
];

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
      {heroImages.map((img, index) => (
        <img
          key={index}
          src={img.src}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000",
            currentIndex === index ? "opacity-100" : "opacity-0",
            img.filter,
            className,
          )}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </>
  );
}
