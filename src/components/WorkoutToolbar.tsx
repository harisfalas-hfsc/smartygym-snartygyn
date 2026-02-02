import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Calculator, Dumbbell } from "lucide-react";
import { WorkoutTimerPopup } from "./WorkoutTimerPopup";
import { OneRMCalculatorPopup } from "./OneRMCalculatorPopup";
import { ExerciseLibraryPopup } from "./ExerciseLibraryPopup";

export const WorkoutToolbar = () => {
  const [timerOpen, setTimerOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center gap-2 p-3 bg-card border-2 border-primary/30 rounded-lg shadow-sm">
        <span className="text-sm font-medium text-muted-foreground hidden sm:inline mr-2">
          Quick Tools:
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimerOpen(true)}
          className="gap-2"
        >
          <Timer className="h-4 w-4" />
          <span className="hidden sm:inline">Timer</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalculatorOpen(true)}
          className="gap-2"
        >
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">1RM</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLibraryOpen(true)}
          className="gap-2"
        >
          <Dumbbell className="h-4 w-4" />
          <span className="hidden sm:inline">Exercises</span>
        </Button>
      </div>

      <WorkoutTimerPopup open={timerOpen} onOpenChange={setTimerOpen} />
      <OneRMCalculatorPopup open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      <ExerciseLibraryPopup open={libraryOpen} onOpenChange={setLibraryOpen} />
    </>
  );
};
