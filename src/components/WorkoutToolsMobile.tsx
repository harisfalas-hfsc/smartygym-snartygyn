import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, Calculator, Dumbbell } from "lucide-react";
import { WorkoutTimerPopup } from "./WorkoutTimerPopup";
import { OneRMCalculatorPopup } from "./OneRMCalculatorPopup";
import { ExerciseLibraryPopup } from "./ExerciseLibraryPopup";

export const WorkoutToolsMobile = () => {
  const [timerOpen, setTimerOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-center gap-2 sm:gap-3 p-3 bg-card border-2 border-primary/30 rounded-lg shadow-md">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground mr-1 sm:mr-2">
          Tools:
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimerOpen(true)}
          className="gap-1.5 h-9 px-3 sm:px-4"
        >
          <Timer className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Timer</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalculatorOpen(true)}
          className="gap-1.5 h-9 px-3 sm:px-4"
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs sm:text-sm">1RM</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLibraryOpen(true)}
          className="gap-1.5 h-9 px-3 sm:px-4"
        >
          <Dumbbell className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Exercises</span>
        </Button>
      </div>

      <WorkoutTimerPopup open={timerOpen} onOpenChange={setTimerOpen} />
      <OneRMCalculatorPopup open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      <ExerciseLibraryPopup open={libraryOpen} onOpenChange={setLibraryOpen} />
    </>
  );
};
