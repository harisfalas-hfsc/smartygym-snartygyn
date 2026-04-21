import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/contexts/AccessControlContext";
import { generateKnowledgeSuggestion, ArticleItem, KnowledgeAnswers } from "@/utils/smarty-coach/knowledgeSuggestionEngine";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface KnowledgeSuggestionFlowProps {
  onBack: () => void;
  onClose: () => void;
}

const categoryOptions = [
  { label: "Fitness", value: "fitness" },
  { label: "Nutrition", value: "nutrition" },
  { label: "Wellness", value: "wellness" },
];

const recencyOptions = [
  { label: "Something new", value: "new" as const },
  { label: "A classic read", value: "classic" as const },
];

type KnowledgeStep = 1 | 2 | 'result';

export const KnowledgeSuggestionFlow = ({ onBack, onClose }: KnowledgeSuggestionFlowProps) => {
  const navigate = useNavigate();
  const { user } = useAccessControl();
  const [currentStep, setCurrentStep] = useState<KnowledgeStep>(1);
  const [answers, setAnswers] = useState<Partial<KnowledgeAnswers>>({});

  const { data: allArticles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['smarty-coach-articles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_articles')
        .select('id, title, slug, category, excerpt, image_url, published_at, read_time')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      return (data || []) as ArticleItem[];
    },
  });

  const { data: viewedArticleIds = [] } = useQuery({
    queryKey: ['smarty-coach-viewed-articles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('blog_article_views')
        .select('article_id')
        .eq('user_id', user.id);
      return (data || []).map(d => d.article_id);
    },
    enabled: !!user?.id,
  });

  const goBack = () => {
    if (currentStep === 1) onBack();
    else if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 'result') setCurrentStep(2);
  };

  const suggestion = currentStep === 'result' && allArticles.length > 0
    ? generateKnowledgeSuggestion(allArticles, answers as KnowledgeAnswers, viewedArticleIds)
    : null;

  const totalSteps = 2;
  const currentStepNum = currentStep === 'result' ? 2 : currentStep;

  const handleSelectSuggestion = (item: ArticleItem) => {
    onClose();
    navigate(`/blog/${item.slug}`);
  };

  const isLoading = articlesLoading;

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
                alt={suggestion.item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          )}
          <div className="p-4 space-y-2">
            <h4 className="font-semibold text-foreground line-clamp-2">
              {suggestion.item.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.item.excerpt}</p>
            <div className="flex flex-wrap items-center gap-2">
              {suggestion.item.category && (
                <Badge variant="secondary" className="text-xs">{suggestion.item.category}</Badge>
              )}
              {suggestion.item.read_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{suggestion.item.read_time}
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
              {suggestion.reasons.slice(0, 3).map((reason, index) => (
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
            Read Article<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'result' && !suggestion) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No articles available to suggest at the moment.</p>
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
          <h3 className="text-lg font-medium text-foreground">What topic interests you?</h3>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, category: opt.value })); setCurrentStep(2); }}
                className="h-auto py-3 px-4 text-sm font-medium border-2 border-border hover:border-primary hover:bg-primary/5">
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
          <h3 className="text-lg font-medium text-foreground">What are you in the mood for?</h3>
          <div className="flex flex-wrap gap-2">
            {recencyOptions.map(opt => (
              <Button key={opt.value} variant="outline" onClick={() => { setAnswers(prev => ({ ...prev, recency: opt.value })); setCurrentStep('result'); }}
                className="h-auto py-3 px-4 text-sm font-medium flex-1 border-2 border-border hover:border-primary hover:bg-primary/5">
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