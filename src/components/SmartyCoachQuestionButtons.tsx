import { Button } from "./ui/button";
import type { QuestionType } from "@/types/smartyCoach";

interface SmartyCoachQuestionButtonsProps {
  onSelectQuestion: (question: QuestionType) => void;
  disabled?: boolean;
}

const questions: { id: QuestionType; label: string }[] = [
  { id: "today", label: "What should I do today?" },
  { id: "workout-or-program", label: "Workout or training program?" },
  { id: "goal", label: "What is your goal?" },
  { id: "equipment", label: "Best for my equipment?" },
  { id: "time", label: "I have limited time" },
];

export const SmartyCoachQuestionButtons = ({
  onSelectQuestion,
  disabled = false,
}: SmartyCoachQuestionButtonsProps) => {
  return (
    <div className="flex flex-col gap-2 p-4 border-t border-border">
      {questions.map((q) => (
        <Button
          key={q.id}
          variant="outline"
          onClick={() => onSelectQuestion(q.id)}
          disabled={disabled}
          className="w-full justify-start text-left h-auto py-3 hover:bg-primary/10 hover:text-primary hover:border-primary transition-all"
        >
          {q.label}
        </Button>
      ))}
    </div>
  );
};
