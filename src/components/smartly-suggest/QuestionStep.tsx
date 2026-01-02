import { Button } from "@/components/ui/button";
import { Question } from "@/utils/smartly-suggest/questionSelector";
import { cn } from "@/lib/utils";

interface QuestionStepProps {
  question: Question;
  currentStep: number;
  totalSteps: number;
  onAnswer: (value: string | number) => void;
}

export const QuestionStep = ({ question, currentStep, totalSteps, onAnswer }: QuestionStepProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Question */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-foreground">
          {question.question}
        </h3>

        {/* Options as chips */}
        <div className="flex flex-wrap gap-2">
          {question.options.map((option) => (
            <Button
              key={String(option.value)}
              variant="outline"
              onClick={() => onAnswer(option.value)}
              className={cn(
                "h-auto py-3 px-4 text-sm font-medium",
                "border-2 border-border hover:border-primary hover:bg-primary/5",
                "transition-all duration-200"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
