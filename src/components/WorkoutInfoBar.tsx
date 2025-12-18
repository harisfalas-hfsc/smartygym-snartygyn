import { Clock, Dumbbell, TrendingUp, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkoutInfoBarProps {
  duration: string;
  equipment: string;
  difficulty: string;
  focus: string;
}

export const WorkoutInfoBar = ({ duration, equipment, difficulty, focus }: WorkoutInfoBarProps) => {
  const getDifficultyColor = (diff: string) => {
    const lower = diff.toLowerCase();
    if (lower.includes("beginner")) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"; // Beginner = YELLOW
    if (lower.includes("intermediate")) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"; // Intermediate = GREEN
    if (lower.includes("advanced")) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"; // Advanced = RED
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-card border border-border rounded-lg mb-6">
      <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{duration}</span>
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
        <Dumbbell className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{equipment}</span>
      </Badge>
      <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 ${getDifficultyColor(difficulty)}`}>
        <TrendingUp className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{difficulty}</span>
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
        <Target className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{focus}</span>
      </Badge>
    </div>
  );
};
