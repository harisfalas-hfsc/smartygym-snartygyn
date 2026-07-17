import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, SkipForward, SkipBack } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

type PlayerSlide =
  | {
      type: "exercise";
      step: WorkoutStep;
      stepIndex: number;
      isLastInSection: boolean;
    }
  | {
      type: "section-break";
      completedSection: string;
      nextSection: string;
      afterStepIndex: number;
    };

function normalizeSection(section?: string) {
  return (section || "Workout").replace(/\s+/g, " ").trim() || "Workout";
}

function buildPlayerSlides(steps: WorkoutStep[]): PlayerSlide[] {
  const slides: PlayerSlide[] = [];

  steps.forEach((step, stepIndex) => {
    const currentSection = normalizeSection(step.section);
    const previousSection = stepIndex > 0 ? normalizeSection(steps[stepIndex - 1]?.section) : currentSection;

    if (stepIndex > 0 && currentSection !== previousSection) {
      slides.push({
        type: "section-break",
        completedSection: previousSection,
        nextSection: currentSection,
        afterStepIndex: stepIndex - 1,
      });
    }

    const nextSection = stepIndex < steps.length - 1 ? normalizeSection(steps[stepIndex + 1]?.section) : currentSection;
    slides.push({
      type: "exercise",
      step,
      stepIndex,
      isLastInSection: stepIndex === steps.length - 1 || nextSection !== currentSection,
    });
  });

  return slides;
}

function hasRepOrSetPrescription(prescription: string): boolean {
  return /\b(?:reps?|repetitions?|sets?)\b/i.test(prescription);
}

// Parse a prescription string to detect a work-time in seconds.
// Matches "30 seconds", "30 sec", "30s", "0:45", "1:30".
function parseWorkSeconds(prescription: string): number | null {
  if (!prescription) return null;
  if (hasRepOrSetPrescription(prescription)) return null;
  const p = prescription
    .toLowerCase()
    .replace(/(?:^|[;,–—-])\s*rest\s*\d+\s*(?:seconds?|secs?|s|minutes?|mins?|m)?\b/g, " ")
    .replace(/\brest\s*\d+\s*(?:seconds?|secs?|s|minutes?|mins?|m)?\b/g, " ");
  // mm:ss
  const mmss = p.match(/(\d+)\s*:\s*(\d{1,2})/);
  if (mmss) return parseInt(mmss[1], 10) * 60 + parseInt(mmss[2], 10);
  const sec = p.match(/(\d+)\s*(?:seconds?|secs?|s)\b/);
  if (sec) return parseInt(sec[1], 10);
  const min = p.match(/(\d+)\s*(?:minutes?|mins?|m)\b/);
  if (min) return parseInt(min[1], 10) * 60;
  return null;
}

function isTabataSection(section?: string): boolean {
  if (!section) return false;
  return /tabata/i.test(section);
}

export function WorkoutPlayerDialog({ open, onOpenChange, title, steps }: WorkoutPlayerDialogProps) {
  const slides = useMemo(() => buildPlayerSlides(steps), [steps]);
  const ids = useMemo(
    () => Array.from(new Set(steps.map(s => s.exerciseId).filter(Boolean) as string[])),
    [steps]
  );
  const { data: media = {} } = useExerciseMedia(open ? ids : []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: "center" });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"work" | "rest">("work");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const tickRef = useRef<number | null>(null);

  const currentSlide = slides[index];
  const currentStep = currentSlide?.type === "exercise" ? currentSlide.step : undefined;
  const workSeconds = useMemo(
    () => (currentStep ? parseWorkSeconds(currentStep.prescription) : null),
    [currentStep]
  );
  const tabata = isTabataSection(currentStep?.section);
  const activeDuration = tabata
    ? phase === "work" ? 20 : 10
    : workSeconds;
  const isTimed = tabata || workSeconds != null;

  const goToSlide = (targetIndex: number, jump = false) => {
    const nextIndex = Math.max(0, Math.min(targetIndex, slides.length - 1));
    setRunning(false);
    emblaApi?.scrollTo(nextIndex, jump);
    if (!emblaApi) setIndex(nextIndex);
  };

  const restartPlayer = () => {
    setPhase("work");
    setRemaining(null);
    setRunning(false);
    emblaApi?.scrollTo(0, true);
    setIndex(0);
  };

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    if (open && emblaApi) {
      emblaApi.scrollTo(0, true);
      setIndex(0);
      emblaApi.reInit();
    }
  }, [open, emblaApi, slides.length]);

  // When step changes: reset phase/timer, auto-start if timed
  useEffect(() => {
    if (!open) return;
    if (!currentSlide || currentSlide.type === "section-break") {
      setPhase("work");
      setRemaining(null);
      setRunning(false);
      return;
    }
    setPhase("work");
    if (tabata) {
      setRemaining(20);
      setRunning(true);
    } else if (workSeconds != null) {
      setRemaining(workSeconds);
      setRunning(true);
    } else {
      setRemaining(null);
      setRunning(false);
    }
  }, [currentSlide, index, open, tabata, workSeconds]);

  // Timer tick
  useEffect(() => {
    if (!running || remaining == null) return;
    if (remaining <= 0) {
      // Phase / step transition
      if (tabata && phase === "work") {
        setPhase("rest");
        setRemaining(10);
        return;
      }
      // Advance immediately. If the next slide is a section break, the next
      // effect stops the timer and waits for a manual Continue.
      if (index < slides.length - 1) {
        emblaApi?.scrollTo(index + 1, true);
      } else {
        setRunning(false);
      }
      return;
    }
    tickRef.current = window.setTimeout(() => setRemaining(r => (r == null ? r : r - 1)), 1000);
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
  }, [running, remaining, tabata, phase, index, slides.length, emblaApi]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
      if (e.key === "ArrowRight") goToSlide(index + 1);
      if (e.key === "ArrowLeft") goToSlide(index - 1);
      if (e.key === " " && isTimed) { e.preventDefault(); setRunning(r => !r); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, emblaApi, onOpenChange, index, isTimed, slides.length]);

  const total = steps.length;
  const activeStepIndex = currentSlide?.type === "exercise" ? currentSlide.stepIndex : currentSlide?.afterStepIndex ?? -1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 gap-0 overflow-hidden [&>button:last-child]:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{title}</p>
            <p className="text-sm font-medium truncate">
              {currentSlide?.type === "section-break"
                ? `${currentSlide.completedSection} complete`
                : `${normalizeSection(currentStep?.section)} · Exercise ${(currentSlide as Extract<PlayerSlide, { type: "exercise" }> | undefined)?.stepIndex != null ? (currentSlide as Extract<PlayerSlide, { type: "exercise" }>).stepIndex + 1 : 1} of ${total}`}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close player" className="shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-3 py-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= activeStepIndex ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, i) => {
              if (slide.type === "section-break") {
                return (
                  <div key={`break-${i}`} className="flex-[0_0_100%] min-w-0 flex flex-col items-center justify-center text-center px-8 py-12" style={{ minHeight: "min(50vh, 340px)" }}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Section complete</p>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3">{slide.completedSection}</h2>
                    <p className="text-sm text-muted-foreground mb-6">Next: {slide.nextSection}</p>
                    <Button onClick={() => goToSlide(index + 1, true)} className="gap-2">
                      Continue
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              }
              const step = slide.step;
              const m = step.exerciseId ? media[step.exerciseId] : undefined;
              const gif = m?.gif_url;
              const fallback = m?.frame_start_url;
              const displayName = (step.name && step.name.trim()) || m?.name || "Exercise";
              return (
                <div key={`step-${slide.stepIndex}`} className="flex-[0_0_100%] min-w-0 flex flex-col items-center px-4 pt-3 pb-2">
                  <p className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">{normalizeSection(step.section)}</p>
                  <h2 className="text-lg md:text-xl font-semibold text-center">{displayName}</h2>
                  {step.prescription && (
                    <p className="text-sm text-muted-foreground mt-0.5">{step.prescription}</p>
                  )}
                  <div className="w-full flex items-center justify-center mt-2" style={{ height: "min(50vh, 340px)" }}>
                    {gif ? (
                      <img src={gif} alt={displayName} className="max-h-full max-w-full object-contain rounded-xl" />
                    ) : fallback ? (
                      <img src={fallback} alt={displayName} className="max-h-full max-w-full object-contain rounded-xl" />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <p className="text-sm">Demo not available</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Side arrows */}
          <button
            type="button"
            onClick={() => goToSlide(index - 1)}
            disabled={index === 0}
            aria-label="Previous exercise"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-background/80 border border-border shadow hover:bg-background disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goToSlide(index + 1)}
            disabled={index === slides.length - 1}
            aria-label="Next exercise"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full bg-background/80 border border-border shadow hover:bg-background disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Control bar */}
        <div className="border-t border-border px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isTimed && remaining != null ? (
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {tabata ? (phase === "work" ? "Work" : "Rest") : "Time"}
                </p>
                <p className={`text-3xl font-bold tabular-nums ${tabata && phase === "rest" ? "text-muted-foreground" : "text-primary"}`}>
                  {formatTime(remaining)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {currentSlide?.type === "section-break" ? "Manual — continue when ready" : "Manual — tap Next when done"}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={restartPlayer}
            aria-label="Start over"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          {isTimed && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRunning(r => !r)}
                aria-label={running ? "Pause" : "Play"}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setPhase("work");
                  setRemaining(activeDuration ?? null);
                  setRunning(false);
                }}
                aria-label="Reset timer"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            onClick={() => {
              if (index < slides.length - 1) goToSlide(index + 1, true);
              else onOpenChange(false);
            }}
            aria-label="Skip / Next"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            {index === slides.length - 1 ? "Finish" : currentSlide?.type === "section-break" ? "Continue" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WorkoutPlayerDialog;