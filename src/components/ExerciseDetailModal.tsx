import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target, Activity } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  target: string;
  equipment: string;
  gifUrl: string;
  secondaryMuscles?: string[];
  instructions?: string[];
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExerciseDetailModal = ({ exercise, open, onOpenChange }: ExerciseDetailModalProps) => {
  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl capitalize">{exercise.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Exercise Image/GIF */}
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={exercise.gifUrl}
              alt={exercise.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
              <Activity className="h-3 w-3 mr-1" />
              {exercise.bodyPart}
            </Badge>
            <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
              <Target className="h-3 w-3 mr-1" />
              {exercise.target}
            </Badge>
            <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">
              <Dumbbell className="h-3 w-3 mr-1" />
              {exercise.equipment}
            </Badge>
          </div>

          {/* Secondary Muscles */}
          {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Secondary Muscles</h4>
              <div className="flex flex-wrap gap-1">
                {exercise.secondaryMuscles.map((muscle, index) => (
                  <Badge key={index} variant="secondary" className="text-xs capitalize">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Instructions</h4>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailModal;
