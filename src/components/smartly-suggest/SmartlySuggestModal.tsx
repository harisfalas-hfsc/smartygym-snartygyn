import { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, Clock, Dumbbell, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSmartyContext } from "@/hooks/useSmartyContext";
import { generateSuggestions, ContentItem, QuestionAnswers } from "@/utils/smartly-suggest/suggestionEngine";
import { generateSmartNote } from "@/utils/smartly-suggest/smartNoteGenerator";
import { SmartNoteDisplay } from "./SmartNote";
import { useNavigate, Link } from "react-router-dom";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SmartlySuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mood emojis matching MorningCheckInForm
const moodEmojis = [
  { value: 1, emoji: "😰", label: "Very stressed" },
  { value: 2, emoji: "😔", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😁", label: "Very positive" },
];

// Energy labels
const energyLabels: Record<number, string> = {
  0: "Exhausted",
  1: "Exhausted",
  2: "Very tired",
  3: "Very tired",
  4: "Tired",
  5: "OK",
  6: "OK",
  7: "Good",
  8: "Good",
  9: "On fire",
  10: "On fire",
};

// Goal options
const goalOptions = [
  { label: "Burn fat", value: "fat_loss" },
  { label: "Build muscle", value: "muscle_gain" },
  { label: "Get stronger", value: "strength" },
  { label: "Improve mobility", value: "flexibility" },
  { label: "Just move", value: "general_fitness" },
];

// Duration options
const durationOptions = [
  { label: "15 min", value: 15 },
  { label: "20 min", value: 20 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
];

// Equipment options
const equipmentOptions = [
  { label: "No equipment", value: "bodyweight" },
  { label: "Equipment available", value: "equipment" },
];

// Category slug helper
const getCategorySlug = (category: string) => {
  return category?.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") || "strength";
};

// Steps: 1=Mood, 2=Energy, 3=Goal, 4=Duration, 5=Equipment
type Step = 1 | 2 | 3 | 4 | 5 | 'result';

export const SmartlySuggestModal = ({ isOpen, onClose }: SmartlySuggestModalProps) => {
  const navigate = useNavigate();
  const { user } = useAccessControl();
  const context = useSmartyContext();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [energyValue, setEnergyValue] = useState(5);

  // Fetch all workouts only
  const { data: allContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['smartly-suggest-workouts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_workouts')
        .select('id, name, category, difficulty, duration, equipment, format, image_url, description, is_premium, type')
        .eq('is_visible', true)
        .order('created_at', { ascending: false });
      return (data || []).map(w => ({
        ...w,
        category: w.category || w.type || 'General',
      })) as ContentItem[];
    },
    enabled: isOpen,
  });

  // Fetch user measurement goals to determine if user has goals set
  const { data: measurementGoals } = useQuery({
    queryKey: ['smartly-suggest-measurement-goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_measurement_goals')
        .select('target_weight, target_body_fat, target_muscle_mass')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: isOpen && !!user?.id,
  });

  // Determine if user has any goals (fitness goals or measurement goals)
  const hasFitnessGoals = !!context.userGoal?.primary_goal;
  const hasMeasurementGoals = !!(
    measurementGoals?.target_weight ||
    measurementGoals?.target_body_fat ||
    measurementGoals?.target_muscle_mass
  );
  const hasAnyGoals = hasFitnessGoals || hasMeasurementGoals;

  // Compute default goal based on existing goals
  const defaultGoal = useMemo(() => {
    // Priority: fitness goals first, then infer from measurement goals
    if (context.userGoal?.primary_goal) {
      return context.userGoal.primary_goal;
    }
    
    // Infer from measurement goals
    if (measurementGoals) {
      // If user has weight or body fat targets → fat loss
      if (measurementGoals.target_weight || measurementGoals.target_body_fat) {
        return 'fat_loss';
      }
      // If user has muscle mass target → muscle gain
      if (measurementGoals.target_muscle_mass) {
        return 'muscle_gain';
      }
    }
    
    return null;
  }, [context.userGoal?.primary_goal, measurementGoals]);

  // Get goal source for reasoning
  const goalSource = useMemo(() => {
    if (context.userGoal?.primary_goal) return 'fitnessGoals';
    if (measurementGoals?.target_weight || measurementGoals?.target_body_fat || measurementGoals?.target_muscle_mass) {
      return 'measurementGoals';
    }
    return 'manual';
  }, [context.userGoal?.primary_goal, measurementGoals]);

  // Log interaction mutation
  const logInteraction = useMutation({
    mutationFn: async (data: {
      suggested_content_id: string;
      action_taken: 'accepted' | 'dismissed';
    }) => {
      if (!user?.id) return;
      await supabase.from('smartly_suggest_interactions').insert([{
        user_id: user.id,
        suggested_content_type: 'workout',
        suggested_content_id: data.suggested_content_id,
        confidence_level: 'direct',
        questions_asked: ['mood', 'energy', 'goal', 'duration', 'equipment'] as unknown as any,
        user_responses: answers as unknown as any,
        action_taken: data.action_taken,
      }]);
    },
  });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setAnswers({});
      setEnergyValue(5);
    }
  }, [isOpen]);

  // Back navigation handler
  const goBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 4) setCurrentStep(3);
    else if (currentStep === 5) setCurrentStep(4);
    else if (currentStep === 'result') setCurrentStep(5);
  };

  // Handle mood selection
  const handleMoodSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, mood: value }));
    setCurrentStep(2);
  };

  // Handle energy confirm
  const handleEnergyConfirm = () => {
    setAnswers(prev => ({ ...prev, energy: energyValue }));
    setCurrentStep(3);
  };

  // Handle goal selection
  const handleGoalSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, goal: value, goalSource }));
    setCurrentStep(4);
  };

  // Handle duration selection
  const handleDurationSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, time: value }));
    setCurrentStep(5);
  };

  // Handle equipment selection
  const handleEquipmentSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, equipment: value }));
    setCurrentStep('result');
  };

  // Handle selecting the suggestion
  const handleSelectSuggestion = (item: ContentItem) => {
    logInteraction.mutate({
      suggested_content_id: item.id,
      action_taken: 'accepted',
    });

    onClose();
    
    const categorySlug = getCategorySlug(item.category);
    navigate(`/workout/${categorySlug}/${item.id}`);
  };

  const handleDismiss = () => {
    if (suggestion) {
      logInteraction.mutate({
        suggested_content_id: suggestion.item.id,
        action_taken: 'dismissed',
      });
    }
    onClose();
  };

  // Generate suggestion when on result step
  const suggestion = currentStep === 'result' && allContent.length > 0
    ? generateSuggestions(allContent, context, answers)
    : null;

  const smartNote = suggestion
    ? generateSmartNote(context, suggestion.item)
    : null;

  const isLoading = context.isLoading || contentLoading;

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

  const totalSteps = 5;
  const currentStepNum = currentStep === 'result' ? 5 : currentStep;

  // Get default goal label
  const defaultGoalLabel = defaultGoal
    ? goalOptions.find(g => g.value === defaultGoal)?.label || defaultGoal
    : null;

  // Determine goal source label for display
  const goalSourceLabel = goalSource === 'fitnessGoals' 
    ? 'Based on your fitness goals' 
    : goalSource === 'measurementGoals' 
      ? 'Based on your active goals (weight/body composition)' 
      : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Smartly Suggest
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Let's find the perfect workout
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : currentStep !== 'result' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
              {/* Progress indicator */}
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

              {/* Step 1: Mood */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    How is your mood?
                  </h3>
                  <div className="grid grid-cols-5 gap-1 sm:flex sm:justify-between sm:gap-2">
                    {moodEmojis.map((mood) => (
                      <button
                        key={mood.value}
                        onClick={() => handleMoodSelect(mood.value)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 p-2 sm:p-3 rounded-xl transition-all",
                          "border-2 border-border hover:border-primary hover:bg-primary/5",
                          "focus:outline-none focus:ring-2 focus:ring-primary"
                        )}
                      >
                        <span className="text-xl sm:text-2xl">{mood.emoji}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Energy */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    How's your energy?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0</span>
                      <span className="font-medium text-foreground">
                        {energyValue} - {energyLabels[energyValue]}
                      </span>
                      <span>10</span>
                    </div>
                    <Slider
                      value={[energyValue]}
                      onValueChange={(val) => setEnergyValue(val[0])}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                      </Button>
                      <Button onClick={handleEnergyConfirm} className="flex-1">
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Goal */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    What's your focus?
                  </h3>
                  
                  {/* Show pre-selected goal if user has goals */}
                  {defaultGoal && (
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">
                        {goalSourceLabel}:
                      </p>
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => handleGoalSelect(defaultGoal)}
                      >
                        {defaultGoalLabel}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {defaultGoal ? (
                      <p className="text-sm text-muted-foreground">Or choose different focus:</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Choose your focus:</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {goalOptions
                        .filter(g => !defaultGoal || g.value !== defaultGoal)
                        .map((goal) => (
                          <Button
                            key={goal.value}
                            variant="outline"
                            onClick={() => handleGoalSelect(goal.value)}
                            className="h-auto py-2 px-3 text-sm"
                          >
                            {goal.label}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Show "Set your goals now" only if user has NO goals at all */}
                  {!hasAnyGoals && (
                    <Link 
                      to="/userdashboard?scroll=active-goals" 
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      onClick={onClose}
                    >
                      Set your goals now
                    </Link>
                  )}

                  {/* Back button for step 3 */}
                  <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              )}

              {/* Step 4: Duration */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    How much time do you have?
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((dur) => (
                      <Button
                        key={dur.value}
                        variant="outline"
                        onClick={() => handleDurationSelect(dur.value)}
                        className={cn(
                          "h-auto py-2 px-3 sm:py-3 sm:px-4 text-sm font-medium",
                          "border-2 border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {dur.label}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              )}

              {/* Step 5: Equipment */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-foreground">
                    What equipment do you have?
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map((eq) => (
                      <Button
                        key={eq.value}
                        variant="outline"
                        onClick={() => handleEquipmentSelect(eq.value)}
                        className={cn(
                          "h-auto py-2 px-3 sm:py-3 sm:px-4 text-sm font-medium flex-1",
                          "border-2 border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {eq.label}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              )}
            </div>
          ) : suggestion ? (
            <>
              {/* Suggestion Card */}
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
                      <Badge variant="secondary" className="text-xs">
                        {suggestion.item.category}
                      </Badge>
                    )}
                    
                    {suggestion.item.difficulty && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getDifficultyColor(suggestion.item.difficulty))}
                      >
                        {suggestion.item.difficulty}
                      </Badge>
                    )}

                    {suggestion.item.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {suggestion.item.duration}
                      </div>
                    )}

                    {suggestion.item.equipment && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Dumbbell className="h-3 w-3" />
                        {suggestion.item.equipment}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Why This For You */}
              {suggestion.reasons.length > 0 && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Why This For You
                    </span>
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

              {/* Smart Note */}
              {smartNote && (
                <SmartNoteDisplay note={smartNote} />
              )}

              {/* Back and CTA Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={goBack} className="flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => handleSelectSuggestion(suggestion.item)}
                >
                  Start Workout
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No workouts available to suggest at the moment.</p>
              <Button variant="outline" onClick={goBack} className="mt-4 flex items-center gap-1 mx-auto">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
