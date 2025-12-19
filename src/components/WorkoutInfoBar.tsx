import { Clock, Dumbbell, TrendingUp, Target, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkoutInfoBarProps {
  duration: string;
  equipment: string;
  difficulty: string;
  focus: string;
  category?: string;
}

export const WorkoutInfoBar = ({ duration, equipment, difficulty, focus, category }: WorkoutInfoBarProps) => {
  const getDifficultyColor = (diff: string) => {
    const lower = diff.toLowerCase();
    if (lower.includes("beginner")) return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"; // Beginner = YELLOW
    if (lower.includes("intermediate")) return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"; // Intermediate = GREEN
    if (lower.includes("advanced")) return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"; // Advanced = RED
    return "bg-muted text-muted-foreground border-border";
  };

  const getCategoryColor = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("strength")) return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
    if (lower.includes("cardio")) return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    if (lower.includes("mobility")) return "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20";
    if (lower.includes("challenge")) return "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20";
    if (lower.includes("stability")) return "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20";
    if (lower.includes("metabolic")) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-card border border-border rounded-lg mb-6">
      {category && (
        <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 ${getCategoryColor(category)}`}>
          <Layers className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{category}</span>
        </Badge>
      )}
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
