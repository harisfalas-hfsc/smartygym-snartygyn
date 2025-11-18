import { Button } from "./ui/button";
import type { GoalType, EquipmentType, TimeOption, QuestionType } from "@/types/smartyCoach";
import { useState } from "react";

interface SmartyCoachAnswerButtonsProps {
  questionType: QuestionType;
  onSelectAnswer: (answer: string | string[]) => void;
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

const limitedTimeOptions: { id: TimeOption; label: string }[] = [
  { id: "10", label: "10 minutes" },
  { id: "20", label: "20 minutes" },
  { id: "30", label: "30 minutes" },
];

const allTimeOptions: { id: TimeOption; label: string }[] = [
  { id: "10", label: "10 minutes" },
  { id: "20", label: "20 minutes" },
  { id: "30", label: "30 minutes" },
  { id: "45", label: "45 minutes" },
  { id: "60", label: "60 minutes" },
  { id: "unlimited", label: "Unlimited time" },
];

export const SmartyCoachAnswerButtons = ({
  questionType,
  onSelectAnswer,
  disabled = false,
}: SmartyCoachAnswerButtonsProps) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  // Multi-select for goals
  if (questionType === "goal" || questionType === "today" || questionType === "workout-or-program") {
    return (
      <div className="flex flex-col gap-2 p-4 border-t border-border max-h-[300px] overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-2">
          Choose your goals (multiple allowed):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {goalOptions.map((option) => {
            const isSelected = selectedGoals.includes(option.id);
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => {
                  const updated = isSelected
                    ? selectedGoals.filter(g => g !== option.id)
                    : [...selectedGoals, option.id];
                  setSelectedGoals(updated);
                }}
                disabled={disabled}
                className="justify-start text-left h-auto py-2 transition-all"
              >
                <span className="mr-2">{isSelected ? "✓" : ""}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
        <Button
          onClick={() => {
            onSelectAnswer(selectedGoals);
            setSelectedGoals([]);
          }}
          disabled={!selectedGoals.length || disabled}
          className="w-full mt-2 bg-green-600 hover:bg-green-700"
        >
          Done
        </Button>
      </div>
    );
  }

  // Multi-select for equipment
  if (questionType === "equipment") {
    return (
      <div className="flex flex-col gap-2 p-4 border-t border-border max-h-[300px] overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-2">
          Select your equipment (multiple allowed):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {equipmentOptions.map((option) => {
            const isSelected = selectedEquipment.includes(option.id);
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                onClick={() => {
                  const updated = isSelected
                    ? selectedEquipment.filter(e => e !== option.id)
                    : [...selectedEquipment, option.id];
                  setSelectedEquipment(updated);
                }}
                disabled={disabled}
                className="justify-start text-left h-auto py-2 transition-all"
              >
                <span className="mr-2">{isSelected ? "✓" : ""}</span>
                {option.label}
              </Button>
            );
          })}
        </div>
        <Button 
          onClick={() => {
            onSelectAnswer(selectedEquipment);
            setSelectedEquipment([]);
          }}
          disabled={!selectedEquipment.length || disabled}
          className="w-full mt-2 bg-green-600 hover:bg-green-700"
        >
          Done
        </Button>
      </div>
    );
  }

  // Single-select for time
  const timeOptions = questionType === "limited-time" ? limitedTimeOptions : allTimeOptions;
  
  return (
    <div className="flex flex-col gap-2 p-4 border-t border-border">
      {timeOptions.map((option) => (
        <Button
          key={option.id}
          variant="outline"
          onClick={() => onSelectAnswer(option.id)}
          disabled={disabled}
          className="w-full justify-start text-left h-auto py-3 hover:bg-green-500/10 hover:text-green-600 hover:border-green-600 transition-all"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};
