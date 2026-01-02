import { ChevronRight, Clock, Dumbbell, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@/utils/smartly-suggest/suggestionEngine";
import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  item: ContentItem;
  reasons: string[];
  contentType: 'workout' | 'program';
  onSelect: () => void;
}

export const SuggestionCard = ({ item, reasons, contentType, onSelect }: SuggestionCardProps) => {
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
    <Card 
      className={cn(
        "overflow-hidden cursor-pointer",
        "border-2 border-primary/20 hover:border-primary/40",
        "transition-all duration-200 hover:shadow-lg"
      )}
      onClick={onSelect}
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-semibold text-lg text-foreground line-clamp-2">
          {item.name}
        </h4>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2">
          {item.category && (
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
          )}
          
          {item.difficulty && (
            <Badge 
              variant="outline" 
              className={cn("text-xs", getDifficultyColor(item.difficulty))}
            >
              {item.difficulty}
            </Badge>
          )}

          {item.duration && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {item.duration}
            </div>
          )}

          {item.equipment && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Dumbbell className="h-3 w-3" />
              {item.equipment}
            </div>
          )}
        </div>

        {/* Why we suggest this */}
        {reasons.length > 0 && (
          <div className="flex items-start gap-2 pt-2 border-t border-border">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              {reasons.slice(0, 2).join(' • ')}
            </p>
          </div>
        )}

        {/* CTA */}
        <Button 
          className="w-full mt-2" 
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {contentType === 'workout' ? 'Start Workout' : 'View Program'}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
};
