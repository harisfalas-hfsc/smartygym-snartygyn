import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkoutGeneratorForm } from "./WorkoutGeneratorForm";
import { GeneratedWorkoutDisplay } from "./GeneratedWorkoutDisplay";
import { generateWorkout } from "@/lib/workoutGenerator";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { AlertCircle, Lock, Crown } from "lucide-react";
import type { WorkoutGeneratorInputs, GeneratedWorkout } from "@/types/workoutGenerator";

export function WorkoutGeneratorCard() {
  const navigate = useNavigate();
  const { userTier, user } = useAccessControl();
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);

  const handleGenerate = async (inputs: WorkoutGeneratorInputs) => {
    // Check premium access first
    if (userTier !== "premium") {
      setShowPremiumPrompt(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

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
    setShowPremiumPrompt(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Card className="p-4 sm:p-6">
      {showPremiumPrompt ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Premium Feature Required
              </h3>
              <p className="text-muted-foreground">
                Smarty Coach is an exclusive tool available only to Premium members. 
                Unlock unlimited access to personalized workout generation powered by Coach Haris Falas's expertise.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => navigate("/premiumbenefits")} className="gap-2">
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </Button>
                {userTier === "guest" && (
                  <Button onClick={() => navigate("/auth")} variant="outline">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button onClick={handleReset} variant="outline" className="w-full">
            Back to Generator
          </Button>
        </div>
      ) : error ? (
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
            <h2 className="text-2xl font-bold mb-2">Your Smarty Coach is asking...</h2>
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
