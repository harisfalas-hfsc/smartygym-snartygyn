import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Printer, RotateCcw, Save } from "lucide-react";
import type { GeneratedWorkout } from "@/types/workoutGenerator";

interface GeneratedWorkoutDisplayProps {
  workout: GeneratedWorkout;
  onGenerateAnother: () => void;
}

export function GeneratedWorkoutDisplay({ workout, onGenerateAnother }: GeneratedWorkoutDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/40">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl">{workout.name}</CardTitle>
          <div className="inline-block px-3 py-1 mt-2 text-xs font-mono bg-primary/20 rounded">
            {workout.serialNumber}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Focus</div>
              <div className="font-semibold">{workout.focus}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Difficulty</div>
              <div className="font-semibold capitalize">{workout.difficulty}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="font-semibold">{workout.duration}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Equipment</div>
              <div className="font-semibold">{workout.equipment}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workout Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{workout.description}</p>
        </CardContent>
      </Card>

      {/* Format & Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Format & Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="inline-block px-3 py-1 mb-2 text-sm font-semibold bg-primary/20 rounded">
              {workout.format}
            </div>
            <p className="text-muted-foreground">{workout.instructions}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Safety Tips:</h4>
            <p className="text-muted-foreground">{workout.tips}</p>
          </div>
        </CardContent>
      </Card>

      {/* Workout Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Workout Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {workout.workoutPlan.map((block, blockIndex) => (
            <div key={blockIndex} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xl font-bold">{block.name}</h3>
                {block.rounds && <span className="text-sm text-muted-foreground">{block.rounds} Rounds</span>}
              </div>

              {block.instructions && (
                <p className="text-sm text-muted-foreground italic">{block.instructions}</p>
              )}

              <div className="space-y-3">
                {block.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="font-medium mb-2 sm:mb-0">{exercise.name}</div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {exercise.sets && <span>Sets: {exercise.sets}</span>}
                      {exercise.reps && <span>Reps: {exercise.reps}</span>}
                      {exercise.duration && <span>Duration: {exercise.duration}</span>}
                      {exercise.rest && <span>Rest: {exercise.rest}</span>}
                      {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {block.restBetweenRounds && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Rest between rounds: <span className="font-semibold">{block.restBetweenRounds}</span>
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <Button onClick={onGenerateAnother} variant="default" size="lg" className="flex-1 sm:flex-none">
          <RotateCcw className="mr-2 h-4 w-4" />
          Generate Another Workout
        </Button>
        <Button onClick={handlePrint} variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Printer className="mr-2 h-4 w-4" />
          Print Workout
        </Button>
        <Button variant="outline" size="lg" className="flex-1 sm:flex-none" disabled title="Coming Soon">
          <Save className="mr-2 h-4 w-4" />
          Save Workout
        </Button>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Show only the workout content */
          [class*="GeneratedWorkoutDisplay"] * {
            visibility: visible;
          }
          /* Optimize for print */
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
