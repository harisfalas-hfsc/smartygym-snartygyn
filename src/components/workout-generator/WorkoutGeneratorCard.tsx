import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutGeneratorForm } from "./WorkoutGeneratorForm";
import { GeneratedWorkoutDisplay } from "./GeneratedWorkoutDisplay";
import { generateWorkout } from "@/lib/workoutGenerator";
import { AlertCircle } from "lucide-react";
import type { WorkoutGeneratorInputs, GeneratedWorkout } from "@/types/workoutGenerator";

export function WorkoutGeneratorCard() {
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (inputs: WorkoutGeneratorInputs) => {
    setIsGenerating(true);
    setError(null);
    
    // Brief artificial delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const generatedWorkout = generateWorkout(inputs);
      setWorkout(generatedWorkout);
      
      // Scroll to top to show generated workout
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error generating workout:", error);
      setError(error instanceof Error ? error.message : "Failed to generate workout. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setWorkout(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-6">
      {error ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg">Unable to Generate Workout</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="pt-2">
                <h4 className="font-medium text-sm mb-2">Suggestions:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Try selecting <strong>Full Body</strong> or <strong>Lower Body</strong> for Cardio workouts</li>
                  <li>Choose time-based formats (Circuit, AMRAP, Tabata) for Cardio and Metabolic workouts</li>
                  <li>Select <strong>Reps & Sets</strong> format for Strength workouts</li>
                  <li>Ensure you have selected at least one Body Focus area</li>
                </ul>
              </div>
            </div>
          </div>
          <Button onClick={handleReset} className="w-full">
            Try Again
          </Button>
        </div>
      ) : !workout ? (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Workout Generator</h2>
            <p className="text-muted-foreground">
              Fill in your preferences below to generate your personalized workout
            </p>
          </div>
          <WorkoutGeneratorForm onSubmit={handleGenerate} isLoading={isGenerating} />
        </>
      ) : (
        <GeneratedWorkoutDisplay workout={workout} onGenerateAnother={handleReset} />
      )}
    </Card>
  );
}
