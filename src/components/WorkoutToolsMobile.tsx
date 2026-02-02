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
      <div className="flex items-center justify-center gap-2 p-3 bg-card border-2 border-primary/30 rounded-lg">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          Tools:
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTimerOpen(true)}
          className="gap-1.5 h-9 px-3"
        >
          <Timer className="h-4 w-4" />
          <span className="text-xs">Timer</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCalculatorOpen(true)}
          className="gap-1.5 h-9 px-3"
        >
          <Calculator className="h-4 w-4" />
          <span className="text-xs">1RM</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLibraryOpen(true)}
          className="gap-1.5 h-9 px-3"
        >
          <Dumbbell className="h-4 w-4" />
          <span className="text-xs">Exercises</span>
        </Button>
      </div>

      <WorkoutTimerPopup open={timerOpen} onOpenChange={setTimerOpen} />
      <OneRMCalculatorPopup open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      <ExerciseLibraryPopup open={libraryOpen} onOpenChange={setLibraryOpen} />
    </>
  );
};
