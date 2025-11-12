import bodywieghtInfernoImg from "@/assets/bodyweight-inferno-workout.jpg";
import hiitInfernoImg from "@/assets/hiit-inferno-workout.jpg";
import cardioBlastImg from "@/assets/cardio-blast-workout.jpg";
import powerSurgeImg from "@/assets/power-surge-workout.jpg";
import metabolicBurnImg from "@/assets/metabolic-burn-workout.jpg";
import explosiveEngineImg from "@/assets/explosive-engine-workout.jpg";
import functionalStrengthImg from "@/assets/functional-strength-program.jpg";
import cardioEnduranceImg from "@/assets/cardio-endurance-program.jpg";
import muscleHypertrophyImg from "@/assets/muscle-hypertrophy-program.jpg";

// Smarty Gym Brand Identity
export const BRAND_IDENTITY = {
  name: "Smarty Gym",
  tagline: "Your gym reimagined. Anywhere, anytime.",
  logo: "/smarty-gym-logo.png",
  
  colors: {
    primary: "hsl(var(--primary))", // Gold
    secondary: "hsl(var(--secondary))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    accent: "hsl(var(--accent))",
  },
  
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  
  values: [
    "Expert-Designed Workouts",
    "Professional Training Programs",
    "Advanced Fitness Tools",
    "100% Human Expertise",
  ],
};

// Get actual workout images from the project
export const WORKOUT_IMAGES = [
  bodywieghtInfernoImg,
  hiitInfernoImg,
  cardioBlastImg,
  powerSurgeImg,
  metabolicBurnImg,
  explosiveEngineImg,
  functionalStrengthImg,
  cardioEnduranceImg,
  muscleHypertrophyImg,
];

export const getRandomWorkoutImage = (): string => {
  return WORKOUT_IMAGES[Math.floor(Math.random() * WORKOUT_IMAGES.length)];
};
