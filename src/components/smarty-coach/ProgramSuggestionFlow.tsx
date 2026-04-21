import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSmartyContext } from "@/hooks/useSmartyContext";
import { generateProgramSuggestion, ProgramItem, ProgramAnswers } from "@/utils/smarty-coach/programSuggestionEngine";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getProgramUrl } from "@/utils/smarty-coach/routes";

interface ProgramSuggestionFlowProps {
  onBack: () => void;
  onClose: () => void;
}

const categoryOptions = [
  { label: "Cardio Endurance", value: "cardio_endurance" },
  { label: "Functional Strength", value: "functional_strength" },
  { label: "Muscle Hypertrophy", value: "muscle_hypertrophy" },
  { label: "Weight Loss", value: "weight_loss" },
  { label: "Low Back Pain", value: "low_back_pain" },
  { label: "Mobility & Stability", value: "mobility_stability" },
];

const difficultyOptions = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const durationOptions = [
  { label: "4 weeks", value: "4" },
  { label: "6 weeks", value: "6" },
  { label: "8 weeks", value: "8" },
  { label: "12 weeks", value: "12" },
];

const equipmentOptions = [
  { label: "No equipment (bodyweight)", value: "bodyweight" },
  { label: "Equipment available", value: "equipment" },
];

type ProgramStep = 1 | 2 | 3 | 4 | 'result';

const getDifficultyColor = (difficulty: string | null) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'intermediate':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    case 'advanced':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const ProgramSuggestionFlow = ({ onBack, onClose }: ProgramSuggestionFlowProps) => {
  const navigate = useNavigate();
  const context = useSmartyContext();
  const [currentStep, setCurrentStep] = useState<ProgramStep>(1);
  const [answers, setAnswers] = useState<Partial<ProgramAnswers>>({});

  const { data: allPrograms = [], isLoading } = useQuery({
    queryKey: ['smarty-coach-programs'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_training_programs')
        .select('id, name, category, difficulty, duration, equipment, weeks, image_url, description, is_premium')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });
      return (data || []) as ProgramItem[];
    },
  });

  const goBack = () => {
    if (currentStep === 1) onBack();
    else if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 'result') setCurrentStep(4);
  };

  const suggestion = currentStep === 'result' && allPrograms.length > 0
    ? generateProgramSuggestion(allPrograms, answers as ProgramAnswers, context)
    : null;

  const totalSteps = 4;
  const currentStepNum = currentStep === 'result' ? 4 : currentStep;

  const handleSelectSuggestion = (item: ProgramItem) => {
    onClose();
    navigate(getProgramUrl(item.category, item.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (currentStep === 'result' && suggestion) {
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
        <div 
          className={cn(
            "overflow-hidden rounded-xl cursor-pointer",
            "border-2 border-primary/20 hover:border-primary/40",
            "transition-all duration-200 hover:shadow-lg"
          )}
          onClick={() => handleSelectSuggestion(suggestion.item)}
        >
          {suggestion.item.image_url && (
            <div className="relative h-32 overflow-hidden">
              <img
                src={suggestion.item.image_url}
                alt={suggestion.item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-foreground line-clamp-2">
              {suggestion.item.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {suggestion.item.category && (
                <Badge variant="secondary" className="text-xs">{suggestion.item.category}</Badge>
              )}
              {suggestion.item.difficulty && (
                <Badge variant="outline" className={cn("text-xs", getDifficultyColor(suggestion.item.difficulty))}>
                  {suggestion.item.difficulty}
                </Badge>
              )}
              {suggestion.item.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{suggestion.item.duration}
                </div>
              )}
              {suggestion.item.equipment && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Dumbbell className="h-3 w-3" />{suggestion.item.equipment}
                </div>
              )}
            </div>
          </div>
        </div>

        {suggestion.reasons.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Why This For You</span>
            </div>
            <ul className="space-y-1.5">
              {suggestion.reasons.slice(0, 4).map((reason, index) => (
                <li key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
          <Button className="flex-1" onClick={() => handleSelectSuggestion(suggestion.item)}>
            View Program<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'result' && !suggestion) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No programs available to suggest at the moment.</p>
        <Button variant="outline" onClick={goBack} className="mt-4 flex items-center gap-1 mx-auto">
          <ChevronLeft className="h-4 w-4" />Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < currentStepNum ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">What type of program?</h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, category: opt.value })); setCurrentStep(2); }}
                className="h-auto py-2 px-3 text-sm border-2 border-border hover:border-primary hover:bg-primary/5">
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">What's your level?</h3>
          <div className="flex flex-wrap gap-2">
            {difficultyOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, difficulty: opt.value })); setCurrentStep(3); }}
                className="h-auto py-2 px-3 text-sm border-2 border-border hover:border-primary hover:bg-primary/5">
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">How long should it be?</h3>
          <div className="flex flex-wrap gap-2">
            {durationOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, duration: opt.value })); setCurrentStep(4); }}
                className="h-auto py-2 px-3 text-sm border-2 border-border hover:border-primary hover:bg-primary/5">
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground">What equipment do you have?</h3>
          <div className="flex flex-wrap gap-2">
            {equipmentOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, equipment: opt.value })); setCurrentStep('result'); }}
                className="h-auto py-2 px-3 sm:py-3 sm:px-4 text-sm font-medium flex-1 border-2 border-border hover:border-primary hover:bg-primary/5">
                {opt.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />Back
          </Button>
        </div>
      )}
    </div>
  );
};