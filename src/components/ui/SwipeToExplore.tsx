import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeToExploreProps {
  onPrev: () => void;
  onNext: () => void;
}

export const SwipeToExplore = ({ onPrev, onNext }: SwipeToExploreProps) => {
  return (
    <div className="flex items-center justify-center gap-3 mb-4 text-muted-foreground">
      <button
        onClick={onPrev}
        className="p-1 hover:text-primary transition-colors active:scale-95"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-xs animate-pulse">Swipe to explore</span>
      <button
        onClick={onNext}
        className="p-1 hover:text-primary transition-colors active:scale-95"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
};
