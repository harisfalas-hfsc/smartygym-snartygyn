import { useState, useEffect } from "react";

interface ExerciseFrameAnimationProps {
  frameStartUrl: string;
  frameEndUrl: string;
  altText?: string;
}

const ExerciseFrameAnimation = ({ frameStartUrl, frameEndUrl, altText = "Exercise demonstration" }: ExerciseFrameAnimationProps) => {
  const [showStart, setShowStart] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowStart((prev) => !prev);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border-2 border-border relative">
      <img
        src={frameStartUrl}
        alt={`${altText} - starting position`}
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
        style={{ opacity: showStart ? 1 : 0 }}
        loading="lazy"
      />
      <img
        src={frameEndUrl}
        alt={`${altText} - ending position`}
        className="absolute inset-0 w-full h-full object-contain transition-opacity duration-500"
        style={{ opacity: showStart ? 0 : 1 }}
        loading="lazy"
      />
    </div>
  );
};

export default ExerciseFrameAnimation;
