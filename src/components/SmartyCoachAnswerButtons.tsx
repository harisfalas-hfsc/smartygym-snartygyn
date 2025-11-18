import { Button } from "./ui/button";
import type { GoalType, EquipmentType, TimeOption, QuestionType } from "@/types/smartyCoach";

interface SmartyCoachAnswerButtonsProps {
  questionType: QuestionType;
  onSelectAnswer: (answer: string) => void;
  disabled?: boolean;
}

const goalOptions: { id: GoalType; label: string }[] = [
  { id: "lose-fat", label: "Lose fat" },
  { id: "sweat", label: "Sweat" },
  { id: "get-stronger", label: "Get stronger" },
  { id: "build-muscle", label: "Build muscle mass" },
  { id: "improve-cardio", label: "Improve cardio" },
  { id: "improve-mobility", label: "Improve mobility" },
  { id: "improve-endurance", label: "Improve endurance" },
  { id: "tone-body", label: "Tone my body" },
  { id: "increase-explosiveness", label: "Increase explosiveness" },
  { id: "improve-functional-strength", label: "Improve functional strength" },
  { id: "increase-power", label: "Increase power" },
  { id: "increase-stamina", label: "Increase stamina" },
  { id: "general-fitness", label: "General fitness" },
  { id: "reduce-stress", label: "Reduce stress" },
  { id: "fix-posture", label: "Fix my posture" },
];

const equipmentOptions: { id: EquipmentType; label: string }[] = [
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "full-gym", label: "Full gym access" },
  { id: "rack-barbell", label: "Rack + Barbell + Plates" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "jump-rope", label: "Jump rope" },
  { id: "medicine-ball", label: "Medicine ball" },
  { id: "pull-up-bar", label: "Pull-up bar" },
  { id: "resistance-bands", label: "Resistance bands" },
  { id: "trx", label: "TRX / Suspension trainer" },
  { id: "bench", label: "Bench" },
  { id: "step-platform", label: "Step platform" },
  { id: "sandbag", label: "Sandbag" },
  { id: "ankle-weights", label: "Ankle weights" },
  { id: "weighted-vest", label: "Weighted vest" },
];

const timeOptions: { id: TimeOption; label: string }[] = [
  { id: "10", label: "10 minutes" },
  { id: "20", label: "20 minutes" },
  { id: "30", label: "30 minutes" },
  { id: "45", label: "45 minutes" },
  { id: "60", label: "60 minutes" },
];

export const SmartyCoachAnswerButtons = ({
  questionType,
  onSelectAnswer,
  disabled = false,
}: SmartyCoachAnswerButtonsProps) => {
  let options: { id: string; label: string }[] = [];

  if (questionType === "goal" || questionType === "today" || questionType === "workout-or-program") {
    options = goalOptions;
  } else if (questionType === "equipment") {
    options = equipmentOptions;
  } else if (questionType === "time") {
    options = timeOptions;
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-t border-border max-h-[300px] overflow-y-auto">
      <p className="text-sm text-muted-foreground mb-2">
        {questionType === "goal" || questionType === "today" || questionType === "workout-or-program"
          ? "Choose your goal:"
          : questionType === "equipment"
          ? "Select your equipment:"
          : "How much time do you have?"}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option) => (
          <Button
            key={option.id}
            variant="outline"
            onClick={() => onSelectAnswer(option.id)}
            disabled={disabled}
            className="justify-start text-left h-auto py-2 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
