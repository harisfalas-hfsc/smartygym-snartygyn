import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PhoneMockupProps {
  children?: ReactNode;
  className?: string;
}

export const PhoneMockup = ({ children, className }: PhoneMockupProps) => {
  return (
    <div
      className={cn(
        "relative mx-auto w-[210px] sm:w-[230px] aspect-[9/19.5] rounded-[2.25rem] border border-border bg-card shadow-lg",
        className
      )}
    >
      {/* Notch */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-16 rounded-full bg-border/70" />

      {/* Screen */}
      <div className="absolute inset-2 rounded-[1.85rem] overflow-hidden border border-border/70 bg-background">
        {children ?? (
          <div className="h-full w-full bg-gradient-to-b from-primary/15 to-background" />
        )}
      </div>
    </div>
  );
};
