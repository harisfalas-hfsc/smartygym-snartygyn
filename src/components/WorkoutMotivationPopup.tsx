import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

interface WorkoutItem {
  name: string;
  image: string;
  route: string;
  type: "workout" | "program";
}

const workoutItems: WorkoutItem[] = [
  // Metabolic Workouts
  { name: "MetaboShock", image: "/src/assets/metaboshock-workout.jpg", route: "/workout/metabolic/metaboshock", type: "workout" },
  { name: "Metabo Inferno", image: "/src/assets/metabo-inferno-workout.jpg", route: "/workout/metabolic/metabo-inferno", type: "workout" },
  { name: "Metabo Surge", image: "/src/assets/metabo-surge-workout.jpg", route: "/workout/metabolic/metabo-surge", type: "workout" },
  { name: "Metabo Charge", image: "/src/assets/metabo-charge-workout.jpg", route: "/workout/metabolic/metabo-charge", type: "workout" },
  { name: "Metabo Flow", image: "/src/assets/metabo-flow-workout.jpg", route: "/workout/metabolic/metabo-flow", type: "workout" },
  { name: "Metabo Start", image: "/src/assets/metabo-start-workout.jpg", route: "/workout/metabolic/metabo-start", type: "workout" },
  { name: "Metabo Lite", image: "/src/assets/metabo-lite-workout.jpg", route: "/workout/metabolic/metabo-lite", type: "workout" },
  
  // Cardio Workouts
  { name: "Cardio Blast", image: "/src/assets/cardio-blast-workout.jpg", route: "/workout/cardio/cardio-blast", type: "workout" },
  { name: "Sweat Storm", image: "/src/assets/sweat-storm-workout.jpg", route: "/workout/cardio/sweat-storm", type: "workout" },
  { name: "Pulse Igniter", image: "/src/assets/pulse-igniter-workout.jpg", route: "/workout/cardio/pulse-igniter", type: "workout" },
  { name: "Fat Furnace", image: "/src/assets/fat-furnace-workout.jpg", route: "/workout/cardio/fat-furnace", type: "workout" },
  { name: "Calorie Crusher", image: "/src/assets/calorie-crusher-workout.jpg", route: "/workout/cardio/calorie-crusher", type: "workout" },
  { name: "Burn Start", image: "/src/assets/burn-start-workout.jpg", route: "/workout/cardio/burn-start", type: "workout" },
  { name: "Metabolic Burn", image: "/src/assets/metabolic-burn-workout.jpg", route: "/workout/cardio/metabolic-burn", type: "workout" },
  { name: "Metabolic Ignition", image: "/src/assets/metabolic-ignition-workout.jpg", route: "/workout/cardio/metabolic-ignition", type: "workout" },
  { name: "Inferno Flow", image: "/src/assets/inferno-flow-workout.jpg", route: "/workout/cardio/inferno-flow", type: "workout" },
  
  // Bodyweight Workouts
  { name: "Bodyweight Beast", image: "/src/assets/bodyweight-beast-workout.jpg", route: "/workout/bodyweight/bodyweight-beast", type: "workout" },
  { name: "Gravity Grind", image: "/src/assets/gravity-grind-workout.jpg", route: "/workout/bodyweight/gravity-grind", type: "workout" },
  { name: "Body Blast", image: "/src/assets/body-blast-workout.jpg", route: "/workout/bodyweight/body-blast", type: "workout" },
  { name: "Body Burnout", image: "/src/assets/body-burnout-workout.jpg", route: "/workout/bodyweight/body-burnout", type: "workout" },
  { name: "Bodyweight Blitz", image: "/src/assets/bodyweight-blitz-workout.jpg", route: "/workout/bodyweight/bodyweight-blitz", type: "workout" },
  { name: "Flow Starter", image: "/src/assets/flow-starter-workout.jpg", route: "/workout/bodyweight/flow-starter", type: "workout" },
  
  // Strength Workouts
  { name: "Iron Core", image: "/src/assets/iron-core-workout.jpg", route: "/workout/strength/iron-core", type: "workout" },
  { name: "Power Surge", image: "/src/assets/power-surge-workout.jpg", route: "/workout/strength/power-surge", type: "workout" },
  { name: "Iron Engine", image: "/src/assets/iron-engine-workout.jpg", route: "/workout/strength/iron-engine", type: "workout" },
  { name: "Iron Circuit", image: "/src/assets/iron-circuit-workout.jpg", route: "/workout/strength/iron-circuit", type: "workout" },
  { name: "Power Foundation", image: "/src/assets/power-foundation-workout.jpg", route: "/workout/strength/power-foundation", type: "workout" },
  { name: "Starter Strength", image: "/src/assets/starter-strength-workout.jpg", route: "/workout/strength/starter-strength", type: "workout" },
  { name: "Power Primer", image: "/src/assets/power-primer-workout.jpg", route: "/workout/strength/power-primer", type: "workout" },
  
  // Circuit Workouts
  { name: "Ultimate Challenge", image: "/src/assets/ultimate-challenge-workout.jpg", route: "/workout/circuit/ultimate-challenge", type: "workout" },
  { name: "Elite Gauntlet", image: "/src/assets/elite-gauntlet-workout.jpg", route: "/workout/circuit/elite-gauntlet", type: "workout" },
  { name: "Power Surge Elite", image: "/src/assets/power-surge-elite-workout.jpg", route: "/workout/circuit/power-surge-elite", type: "workout" },
  { name: "Sweat Circuit", image: "/src/assets/sweat-circuit-workout.jpg", route: "/workout/circuit/sweat-circuit", type: "workout" },
  { name: "Challenge Circuit Pro", image: "/src/assets/challenge-circuit-pro-workout.jpg", route: "/workout/circuit/challenge-circuit-pro", type: "workout" },
  { name: "Power Circuit Pro", image: "/src/assets/power-circuit-pro-workout.jpg", route: "/workout/circuit/power-circuit-pro", type: "workout" },
  { name: "Explosive Engine", image: "/src/assets/explosive-engine-workout.jpg", route: "/workout/circuit/explosive-engine", type: "workout" },
  { name: "Final Form", image: "/src/assets/final-form-workout.jpg", route: "/workout/circuit/final-form", type: "workout" },
  { name: "Starter Gauntlet", image: "/src/assets/starter-gauntlet-workout.jpg", route: "/workout/circuit/starter-gauntlet", type: "workout" },
  { name: "Challenge Prep", image: "/src/assets/challenge-prep-workout.jpg", route: "/workout/circuit/challenge-prep", type: "workout" },
  { name: "Explosive Start", image: "/src/assets/explosive-start-workout.jpg", route: "/workout/circuit/explosive-start", type: "workout" },
  
  // Core & Mobility Workouts
  { name: "Core Builder", image: "/src/assets/core-builder-workout.jpg", route: "/workout/core/core-builder", type: "workout" },
  { name: "Core Flow", image: "/src/assets/core-flow-workout.jpg", route: "/workout/core/core-flow", type: "workout" },
  { name: "Mobility Mastery", image: "/src/assets/mobility-mastery-workout.jpg", route: "/workout/mobility/mobility-mastery", type: "workout" },
  { name: "Flow Mobility", image: "/src/assets/flow-mobility-workout.jpg", route: "/workout/mobility/flow-mobility", type: "workout" },
  { name: "FlowForge", image: "/src/assets/flowforge-workout.jpg", route: "/workout/mobility/flowforge", type: "workout" },
  { name: "Stability Circuit", image: "/src/assets/stability-circuit-workout.jpg", route: "/workout/mobility/stability-circuit", type: "workout" },
  { name: "Balance Forge", image: "/src/assets/balance-forge-workout.jpg", route: "/workout/mobility/balance-forge", type: "workout" },
  { name: "Band Balance", image: "/src/assets/band-balance-workout.jpg", route: "/workout/mobility/band-balance", type: "workout" },
  
  // Training Programs
  { name: "Cardio Endurance Program", image: "/src/assets/cardio-endurance-program.jpg", route: "/training-program/cardio-endurance", type: "program" },
  { name: "Functional Strength Program", image: "/src/assets/functional-strength-program.jpg", route: "/training-program/functional-strength", type: "program" },
  { name: "Muscle Hypertrophy Program", image: "/src/assets/muscle-hypertrophy-program.jpg", route: "/training-program/muscle-hypertrophy", type: "program" },
];

const motivationalMessages = [
  "Ready to make your first step to a healthier and more fulfilling life?",
  "Let's get moving! Your journey starts now.",
  "I have a challenge for you. Are you ready?",
  "Transform your body, transform your life.",
  "Every workout brings you closer to your goals.",
  "Your future self will thank you for starting today.",
  "Push your limits. Discover your strength.",
  "The only bad workout is the one you didn't do.",
];

export const WorkoutMotivationPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem | null>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup on every page load
    const timer = setTimeout(() => {
      const randomWorkout = workoutItems[Math.floor(Math.random() * workoutItems.length)];
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setSelectedWorkout(randomWorkout);
      setMessage(randomMessage);
      setIsOpen(true);
    }, 1000); // Small delay to let page load

    return () => clearTimeout(timer);
  }, []);

  const handleStartWorkout = () => {
    if (selectedWorkout) {
      setIsOpen(false);
      navigate(selectedWorkout.route);
    }
  };

  if (!selectedWorkout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-2 border-primary p-0 gap-0 overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-3 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background/80 p-1"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="relative w-full h-48 overflow-hidden">
          <img 
            src={selectedWorkout.image} 
            alt={selectedWorkout.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-transparent" />
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-center">
              {selectedWorkout.name}
            </h3>
            <p className="text-base text-muted-foreground text-center">
              {message}
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={handleStartWorkout} size="lg" className="w-full">
              {selectedWorkout.type === "workout" ? "Start Workout" : "View Program"}
            </Button>
            <Button onClick={() => setIsOpen(false)} variant="outline" size="lg" className="w-full">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
