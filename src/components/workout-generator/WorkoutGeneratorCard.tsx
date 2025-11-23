import { useState } from "react";
import { Card } from "@/components/ui/card";
import { WorkoutGeneratorForm } from "./WorkoutGeneratorForm";
import { GeneratedWorkoutDisplay } from "./GeneratedWorkoutDisplay";
import { generateWorkout } from "@/lib/workoutGenerator";
import type { WorkoutGeneratorInputs, GeneratedWorkout } from "@/types/workoutGenerator";

export function WorkoutGeneratorCard() {
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (inputs: WorkoutGeneratorInputs) => {
    setIsGenerating(true);
    
    // Brief artificial delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const generatedWorkout = generateWorkout(inputs);
      setWorkout(generatedWorkout);
      
      // Scroll to top to show generated workout
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error generating workout:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setWorkout(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-6">
      {!workout ? (
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
