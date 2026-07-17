import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { WorkoutStep } from "@/utils/parseWorkoutSteps";

interface WorkoutPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  steps: WorkoutStep[];
}

interface ExerciseMedia {
  id: string;
  name: string;
  gif_url: string | null;
  frame_start_url: string | null;
  frame_end_url: string | null;
}

function useExerciseMedia(ids: string[]) {
  return useQuery({
    queryKey: ["exercise-media", ids.sort().join(",")],
    queryFn: async (): Promise<Record<string, ExerciseMedia>> => {
      if (!ids.length) return {};
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, gif_url, frame_start_url, frame_end_url")
        .in("id", ids);
      if (error) throw error;
      const map: Record<string, ExerciseMedia> = {};
      (data || []).forEach((row: any) => { map[row.id] = row; });
      return map;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function WorkoutPlayerDialog({ open, onOpenChange, title, steps }: WorkoutPlayerDialogProps) {
  const ids = useMemo(
    () => Array.from(new Set(steps.map(s => s.exerciseId).filter(Boolean) as string[])),
    [steps]
  );
  const { data: media = {} } = useExerciseMedia(open ? ids : []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  // Reset to first slide on open
  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(0, true);
      setIndex(0);
    }
  }, [open, emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, emblaApi, onOpenChange]);

  if (!open) return null;

  const total = steps.length;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground truncate">{title}</p>
          <p className="text-sm font-medium truncate">
            Exercise {index + 1} of {total}
            {steps[index]?.section ? ` · ${steps[index].section}` : ""}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          aria-label="Close player"
          className="shrink-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-3 py-2 bg-background">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Carousel */}
      <div className="relative flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {steps.map((step, i) => {
            const m = step.exerciseId ? media[step.exerciseId] : undefined;
            const gif = m?.gif_url;
            const fallback = m?.frame_start_url;
            return (
              <div
                key={i}
                className="flex-[0_0_100%] min-w-0 h-full flex flex-col items-center justify-between px-6 py-4"
              >
                {/* Prescription (top of card) */}
                <div className="text-center py-2">
                  {step.prescription && (
                    <p className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                      {step.prescription}
                    </p>
                  )}
                  <h2 className="text-xl md:text-2xl font-semibold mt-2">{step.name}</h2>
                </div>

                {/* GIF */}
                <div className="flex-1 w-full flex items-center justify-center min-h-0 py-4">
                  {gif ? (
                    <img
                      src={gif}
                      alt={step.name}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  ) : fallback ? (
                    <img
                      src={fallback}
                      alt={step.name}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <p className="text-sm">Demo not available</p>
                      <p className="text-xs mt-1">See Exercise Library for details</p>
                    </div>
                  )}
                </div>

                {/* Footer counter */}
                <div className="text-xs text-muted-foreground">
                  Swipe or use arrows to change exercise
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop arrows */}
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={index === 0}
          aria-label="Previous exercise"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-background/80 border border-border shadow-lg hover:bg-background disabled:opacity-30"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={index === total - 1}
          aria-label="Next exercise"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 items-center justify-center rounded-full bg-background/80 border border-border shadow-lg hover:bg-background disabled:opacity-30"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile bottom controls */}
      <div className="md:hidden flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-background">
        <Button
          variant="outline"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={index === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Prev
        </Button>
        <Button
          onClick={() => emblaApi?.scrollNext()}
          disabled={index === total - 1}
          className="flex-1"
        >
          Next <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default WorkoutPlayerDialog;