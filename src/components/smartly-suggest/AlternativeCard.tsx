import { ChevronRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentItem } from "@/utils/smartly-suggest/suggestionEngine";
import { cn } from "@/lib/utils";

interface AlternativeCardProps {
  item: ContentItem;
  contentType: 'workout' | 'program';
  onSelect: () => void;
}

export const AlternativeCard = ({ item, contentType, onSelect }: AlternativeCardProps) => {
  return (
    <Card 
      className={cn(
        "flex-1 overflow-hidden cursor-pointer",
        "border hover:border-primary/40",
        "transition-all duration-200 hover:shadow-md"
      )}
      onClick={onSelect}
    >
      {/* Image */}
      {item.image_url && (
        <div className="relative h-20 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="p-3 space-y-2">
        {/* Title */}
        <h5 className="font-medium text-sm text-foreground line-clamp-2">
          {item.name}
        </h5>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-1.5">
          {item.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {item.category}
            </Badge>
          )}

          {item.duration && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="h-2.5 w-2.5" />
              {item.duration}
            </div>
          )}
        </div>

        {/* Subtle CTA */}
        <div className="flex items-center justify-end text-xs text-primary font-medium pt-1">
          <span>{contentType === 'workout' ? 'Start' : 'View'}</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </Card>
  );
};
