import { useState, useEffect } from "react";
import { X, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSmartyContext } from "@/hooks/useSmartyContext";
import { useConfidenceLevel } from "@/hooks/useConfidenceLevel";
import { selectQuestions, Question } from "@/utils/smartly-suggest/questionSelector";
import { generateSuggestions, ContentItem, ScoredContent, QuestionAnswers } from "@/utils/smartly-suggest/suggestionEngine";
import { generateSmartNote, SmartNote } from "@/utils/smartly-suggest/smartNoteGenerator";
import { QuestionStep } from "./QuestionStep";
import { SuggestionCard } from "./SuggestionCard";
import { AlternativeCard } from "./AlternativeCard";
import { SmartNoteDisplay } from "./SmartNote";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface SmartlySuggestSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'workout' | 'program';
}

export const SmartlySuggestSheet = ({ isOpen, onClose, contentType }: SmartlySuggestSheetProps) => {
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
      action_taken: 'accepted' | 'alternative_1' | 'alternative_2' | 'dismissed';
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

  // Initialize questions when sheet opens
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

    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleSelectSuggestion = (item: ContentItem, actionType: 'accepted' | 'alternative_1' | 'alternative_2') => {
    logInteraction.mutate({
      suggested_content_id: item.id,
      action_taken: actionType,
    });

    onClose();
    
    // Navigate to the content
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

  // Generate suggestions when showing results
  const suggestions = showResults && allContent.length > 0
    ? generateSuggestions(allContent, context, answers, contentType)
    : null;

  const smartNote = suggestions?.main
    ? generateSmartNote(context, suggestions.main.item)
    : null;

  const isLoading = context.isLoading || contentLoading;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl px-4 pb-8 overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-foreground">
                Smartly Suggest
              </SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your activity and goals
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="flex gap-3">
                <Skeleton className="h-32 flex-1 rounded-xl" />
                <Skeleton className="h-32 flex-1 rounded-xl" />
              </div>
            </div>
          ) : !showResults && questions.length > 0 ? (
            // Questions phase
            <QuestionStep
              question={questions[currentQuestionIndex]}
              currentStep={currentQuestionIndex + 1}
              totalSteps={questions.length}
              onAnswer={(value) => handleAnswer(questions[currentQuestionIndex].id, value)}
            />
          ) : suggestions ? (
            // Results phase
            <>
              {/* Main Suggestion */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  {contentType === 'workout' ? 'Your Workout' : 'Your Program'}
                </h3>
                <SuggestionCard
                  item={suggestions.main.item}
                  reasons={suggestions.main.reasons}
                  contentType={contentType}
                  onSelect={() => handleSelectSuggestion(suggestions.main.item, 'accepted')}
                />
              </div>

              {/* Alternatives */}
              {suggestions.alternatives.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                    Or Try These
                  </h3>
                  <div className="flex gap-3">
                    {suggestions.alternatives.map((alt, index) => (
                      <AlternativeCard
                        key={alt.item.id}
                        item={alt.item}
                        contentType={contentType}
                        onSelect={() => handleSelectSuggestion(
                          alt.item, 
                          index === 0 ? 'alternative_1' : 'alternative_2'
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Note */}
              {smartNote && (
                <SmartNoteDisplay note={smartNote} />
              )}
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No {contentType}s available to suggest at the moment.</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
