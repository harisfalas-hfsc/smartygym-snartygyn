import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Timer, ListOrdered, Dumbbell, Calculator } from "lucide-react";
import { WorkoutTimerPopup } from "./WorkoutTimerPopup";
import { RoundsCounterPopup } from "./RoundsCounterPopup";
import { OneRMCalculatorPopup } from "./OneRMCalculatorPopup";
import { ExerciseLibraryPopup } from "./ExerciseLibraryPopup";

export const WorkoutToolsMobile = () => {
  const [timerOpen, setTimerOpen] = useState(false);
  const [roundsOpen, setRoundsOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-center gap-3 sm:gap-4 p-3 bg-card border-2 border-primary/30 rounded-lg shadow-md">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">
          Tools:
        </span>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setTimerOpen(true)}
          className="h-10 w-10"
          aria-label="Workout Timer"
          title="Workout Timer"
        >
          <Timer className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setRoundsOpen(true)}
          className="h-10 w-10"
          aria-label="Rounds Counter"
          title="Rounds Counter"
        >
          <ListOrdered className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setCalculatorOpen(true)}
          className="h-10 w-10"
          aria-label="1RM Calculator"
          title="1RM Calculator"
        >
          <Calculator className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setLibraryOpen(true)}
          className="h-10 w-10"
          aria-label="Exercise Library"
          title="Exercise Library"
        >
          <Dumbbell className="h-5 w-5" />
        </Button>
      </div>

      <WorkoutTimerPopup open={timerOpen} onOpenChange={setTimerOpen} />
      <RoundsCounterPopup open={roundsOpen} onOpenChange={setRoundsOpen} />
      <OneRMCalculatorPopup open={calculatorOpen} onOpenChange={setCalculatorOpen} />
      <ExerciseLibraryPopup open={libraryOpen} onOpenChange={setLibraryOpen} />
    </>
  );
};
