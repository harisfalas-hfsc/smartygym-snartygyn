import { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Target, Activity, ListOrdered, Info, Gauge, ImageOff } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ExerciseFrameAnimation from "./ExerciseFrameAnimation";

// Interface matching ExerciseDB schema in database
interface Exercise {
  id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string[];
  instructions: string[];
  gif_url: string | null;
  description: string | null;
  difficulty: string | null;
  category: string | null;
  frame_start_url?: string | null;
  frame_end_url?: string | null;
}

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Capitalize first letter of each word
const formatLabel = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ExerciseDetailModal = ({ exercise, open, onOpenChange }: ExerciseDetailModalProps) => {
  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const viewport = scrollRootRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLElement | null;
    viewport?.scrollTo({ top: 0 });
  }, [open, exercise?.id]);

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollRootRef} className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Exercise GIF or Frame Animation */}
            {exercise.gif_url ? (
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border-2 border-border flex items-center justify-center">
                <img
                  src={exercise.gif_url}
                  alt={`SmartyGym ${exercise.name} exercise demonstration - Haris Falas online fitness platform smartygym.com`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : exercise.frame_start_url && exercise.frame_end_url ? (
              <ExerciseFrameAnimation
                frameStartUrl={exercise.frame_start_url}
                frameEndUrl={exercise.frame_end_url}
                altText={`SmartyGym ${exercise.name} exercise demonstration`}
              />
            ) : (
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-white border-2 border-border flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="h-6 w-6" />
                  <p className="text-sm">GIF not available yet</p>
                </div>
              </div>
            )}

            {/* Tags Section */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                <Activity className="h-3 w-3 mr-1" />
                {formatLabel(exercise.body_part)}
              </Badge>
              <Badge variant="outline" className="border-purple-500 text-purple-600 dark:text-purple-400">
                <Dumbbell className="h-3 w-3 mr-1" />
                {formatLabel(exercise.equipment)}
              </Badge>
              <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400">
                <Target className="h-3 w-3 mr-1" />
                {formatLabel(exercise.target)}
              </Badge>
              {exercise.difficulty && (
                <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                  <Gauge className="h-3 w-3 mr-1" />
                  {formatLabel(exercise.difficulty)}
                </Badge>
              )}
              {exercise.category && (
                <Badge variant="outline" className="border-cyan-500 text-cyan-600 dark:text-cyan-400">
                  {formatLabel(exercise.category)}
                </Badge>
              )}
            </div>

            {/* Description */}
            {exercise.description && (
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Description
                </h4>
                <p className="text-sm text-muted-foreground">{exercise.description}</p>
              </div>
            )}

            {/* Secondary Muscles */}
            {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Secondary Muscles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.secondary_muscles.map((muscle, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {formatLabel(muscle)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Instructions Section */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground flex items-center gap-2">
                  <ListOrdered className="h-4 w-4" />
                  Instructions
                </h4>
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailModal;
