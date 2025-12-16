import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target, Activity, ListOrdered, Users, Layers } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Interface matching exact Gym Fit API response
interface ExerciseDetail {
  name: string;
  bodyPart: string;
  muscles: {
    role: string;
    name: string;
    group: string;
  }[];
  instructions: {
    order: number;
    description: string;
  }[];
  alternatives: {
    id: string;
    name: string;
  }[];
  variations: {
    id: string;
    name: string;
  }[];
}

interface ExerciseDetailModalProps {
  exercise: ExerciseDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExerciseDetailModal = ({ exercise, open, onOpenChange }: ExerciseDetailModalProps) => {
  if (!exercise) return null;

  // Group muscles by role
  const musclesByRole = exercise.muscles?.reduce((acc, muscle) => {
    if (!acc[muscle.role]) acc[muscle.role] = [];
    acc[muscle.role].push(muscle);
    return acc;
  }, {} as Record<string, typeof exercise.muscles>) || {};

  // Sort instructions by order
  const sortedInstructions = [...(exercise.instructions || [])].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Body Part Badge */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                <Activity className="h-3 w-3 mr-1" />
                {exercise.bodyPart}
              </Badge>
            </div>

            {/* Muscles Section */}
            {exercise.muscles && exercise.muscles.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Muscles Worked
                </h4>
                <div className="space-y-3">
                  {Object.entries(musclesByRole).map(([role, muscles]) => (
                    <div key={role}>
                      <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                        {role}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {muscles.map((muscle, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className={`text-xs ${
                              role === 'Target' ? 'bg-primary/20 text-primary' :
                              role === 'Synergist' ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400' :
                              'bg-muted'
                            }`}
                          >
                            {muscle.name}
                            {muscle.group && (
                              <span className="ml-1 text-[10px] opacity-70">({muscle.group})</span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Instructions Section */}
            {sortedInstructions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  Instructions
                </h4>
                <ol className="space-y-2">
                  {sortedInstructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {instruction.order}
                      </span>
                      <span className="text-muted-foreground">{instruction.description}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Alternatives Section */}
            {exercise.alternatives && exercise.alternatives.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Alternative Exercises ({exercise.alternatives.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.alternatives.map((alt) => (
                      <Badge key={alt.id} variant="outline" className="text-xs">
                        {alt.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Variations Section */}
            {exercise.variations && exercise.variations.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Variations ({exercise.variations.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.variations.map((variation) => (
                      <Badge key={variation.id} variant="outline" className="text-xs">
                        {variation.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailModal;
