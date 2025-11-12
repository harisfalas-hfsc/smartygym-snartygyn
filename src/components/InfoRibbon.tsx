import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface InfoRibbonProps {
  children: ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
}

export const InfoRibbon = ({ children, ctaText, onCtaClick, className = "" }: InfoRibbonProps) => {
  return (
    <div className={`bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 text-center ${className}`}>
      <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
        {children}
      </div>
      {ctaText && onCtaClick && (
        <Button variant="default" size="sm" onClick={onCtaClick} className="mt-3 text-xs sm:text-sm">
          {ctaText}
        </Button>
      )}
    </div>
  );
};
