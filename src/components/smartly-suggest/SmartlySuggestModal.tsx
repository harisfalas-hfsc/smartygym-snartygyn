import { useState, useEffect } from "react";
import { ChevronRight, Clock, Dumbbell, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSmartyContext } from "@/hooks/useSmartyContext";
import { useConfidenceLevel } from "@/hooks/useConfidenceLevel";
import { selectQuestions, Question } from "@/utils/smartly-suggest/questionSelector";
import { generateSuggestions, ContentItem, QuestionAnswers } from "@/utils/smartly-suggest/suggestionEngine";
import { generateSmartNote } from "@/utils/smartly-suggest/smartNoteGenerator";
import { QuestionStep } from "./QuestionStep";
import { SmartNoteDisplay } from "./SmartNote";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SmartlySuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'workout' | 'program';
}

export const SmartlySuggestModal = ({ isOpen, onClose, contentType }: SmartlySuggestModalProps) => {
  const navigate = useNavigate();
  const { user } = useAccessControl();
  const context = useSmartyContext();
  const confidenceResult = useConfidenceLevel(context);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [showResults, setShowResults] = useState(false);

  // Fetch all workouts or programs
  const { data: allContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ['smartly-suggest-content', contentType],
    queryFn: async () => {
      if (contentType === 'workout') {
        const { data } = await supabase
          .from('admin_workouts')
          .select('id, name, category, difficulty, duration, equipment, format, image_url, description, is_premium, type')
          .eq('is_visible', true)
          .order('created_at', { ascending: false });
        return (data || []).map(w => ({
          ...w,
          category: w.category || w.type || 'General',
        })) as ContentItem[];
      } else {
        const { data } = await supabase
          .from('admin_training_programs')
          .select('id, name, category, difficulty, duration, equipment, image_url, description, is_premium')
          .eq('is_visible', true)
          .order('created_at', { ascending: false });
        return (data || []).map(p => ({
          ...p,
          format: null,
          type: 'program',
        })) as ContentItem[];
      }
    },
    enabled: isOpen,
  });

  // Log interaction mutation
  const logInteraction = useMutation({
    mutationFn: async (data: {
      suggested_content_id: string;
      action_taken: 'accepted' | 'dismissed';
    }) => {
      if (!user?.id) return;
      await supabase.from('smartly_suggest_interactions').insert([{
        user_id: user.id,
        suggested_content_type: contentType,
        suggested_content_id: data.suggested_content_id,
        confidence_level: confidenceResult.level,
        questions_asked: questions.map(q => q.id) as unknown as any,
        user_responses: answers as unknown as any,
        action_taken: data.action_taken,
      }]);
    },
  });

  // Initialize questions when modal opens
  useEffect(() => {
    if (isOpen && !context.isLoading) {
      const selectedQuestions = selectQuestions(confidenceResult.level, context);
      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResults(selectedQuestions.length === 0);
    }
  }, [isOpen, context.isLoading, confidenceResult.level]);

  const handleAnswer = (questionId: string, value: string | number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleSelectSuggestion = (item: ContentItem) => {
    logInteraction.mutate({
      suggested_content_id: item.id,
      action_taken: 'accepted',
    });

    onClose();
    
    if (contentType === 'workout') {
      navigate(`/workout/${item.id}`);
    } else {
      navigate(`/trainingprogram/${item.id}`);
    }
  };

  const handleDismiss = () => {
    if (suggestions?.main) {
      logInteraction.mutate({
        suggested_content_id: suggestions.main.item.id,
        action_taken: 'dismissed',
      });
    }
    onClose();
  };

  // Generate suggestion when showing results
  const suggestions = showResults && allContent.length > 0
    ? generateSuggestions(allContent, context, answers, contentType)
    : null;

  const smartNote = suggestions?.main
    ? generateSmartNote(context, suggestions.main.item)
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Smartly Suggest
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Based on your activity and goals
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ) : !showResults && questions.length > 0 ? (
            <QuestionStep
              question={questions[currentQuestionIndex]}
              currentStep={currentQuestionIndex + 1}
              totalSteps={questions.length}
              onAnswer={(value) => handleAnswer(questions[currentQuestionIndex].id, value)}
            />
          ) : suggestions ? (
            <>
              {/* Suggestion Card */}
              <div 
                className={cn(
                  "overflow-hidden rounded-xl cursor-pointer",
                  "border-2 border-primary/20 hover:border-primary/40",
                  "transition-all duration-200 hover:shadow-lg"
                )}
                onClick={() => handleSelectSuggestion(suggestions.main.item)}
              >
                {suggestions.main.item.image_url && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={suggestions.main.item.image_url}
                      alt={suggestions.main.item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                )}

                <div className="p-4 space-y-2">
                  <h4 className="font-semibold text-foreground line-clamp-2">
                    {suggestions.main.item.name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2">
                    {suggestions.main.item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {suggestions.main.item.category}
                      </Badge>
                    )}
                    
                    {suggestions.main.item.difficulty && (
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getDifficultyColor(suggestions.main.item.difficulty))}
                      >
                        {suggestions.main.item.difficulty}
                      </Badge>
                    )}

                    {suggestions.main.item.duration && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {suggestions.main.item.duration}
                      </div>
                    )}

                    {suggestions.main.item.equipment && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Dumbbell className="h-3 w-3" />
                        {suggestions.main.item.equipment}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Why This For You */}
              {suggestions.main.reasons.length > 0 && (
                <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Why This For You
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {suggestions.main.reasons.slice(0, 4).map((reason, index) => (
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

              {/* CTA Button */}
              <Button 
                className="w-full" 
                onClick={() => handleSelectSuggestion(suggestions.main.item)}
              >
                {contentType === 'workout' ? 'Start Workout' : 'View Program'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No {contentType}s available to suggest at the moment.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
