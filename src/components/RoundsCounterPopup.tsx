import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Plus, Minus, X, Minimize2, Maximize2, Volume2, VolumeX, Vibrate } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundsCounterPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "rounds" | "rounds-reps";
type Direction = "down" | "up";

export const RoundsCounterPopup = ({ open, onOpenChange }: RoundsCounterPopupProps) => {
  const [mode, setMode] = useState<Mode>("rounds");
  const [direction, setDirection] = useState<Direction>("down");
  const [targetRounds, setTargetRounds] = useState(10);
  const [targetReps, setTargetReps] = useState(10);
  const [targetRoundsInput, setTargetRoundsInput] = useState("10");
  const [targetRepsInput, setTargetRepsInput] = useState("10");
  const [roundsDone, setRoundsDone] = useState(0);
  const [repsDone, setRepsDone] = useState(0);
  const [flash, setFlash] = useState<"none" | "tap" | "done">("none");
  const [isMinimized, setIsMinimized] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [hapticOn, setHapticOn] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const isDone = roundsDone >= targetRounds;

  const beep = useCallback((freq = 800, dur = 0.15) => {
    if (!soundOn) return;
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return;
        ctx = new Ctor();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.32, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch {
      // Ignore unsupported audio contexts.
    }
  }, [soundOn]);

  const vibrate = useCallback((ms: number | number[]) => {
    if (!hapticOn) return;
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  }, [hapticOn]);

  const commit = (val: string, setVal: (n: number) => void, setInput: (s: string) => void) => {
    const n = Math.max(1, parseInt(val) || 1);
    setVal(n);
    setInput(String(n));
  };

  const handleReset = () => {
    setRoundsDone(0);
    setRepsDone(0);
    setFlash("none");
  };

  const handleClose = () => {
    handleReset();
    setIsMinimized(false);
    onOpenChange(false);
  };

  const tapRound = () => {
    const next = roundsDone + 1;
    setRoundsDone(next);
    setRepsDone(0);
    if (next >= targetRounds) {
      beep(1200, 0.6);
      vibrate([80, 60, 160]);
      setFlash("done");
      setTimeout(() => setFlash("none"), 1200);
    } else {
      beep(800, 0.15);
      vibrate(45);
      setFlash("tap");
      setTimeout(() => setFlash("none"), 180);
    }
  };

  const tapRep = () => {
    const nextReps = repsDone + 1;
    if (nextReps >= targetReps) {
      const nextRounds = roundsDone + 1;
      setRoundsDone(nextRounds);
      setRepsDone(0);
      if (nextRounds >= targetRounds) {
        beep(1200, 0.6);
        vibrate([80, 60, 160]);
        setFlash("done");
        setTimeout(() => setFlash("none"), 1200);
      } else {
        beep(1000, 0.25);
        vibrate([55, 35, 55]);
        setFlash("tap");
        setTimeout(() => setFlash("none"), 220);
      }
    } else {
      setRepsDone(nextReps);
      beep(700, 0.08);
      vibrate(25);
      setFlash("tap");
      setTimeout(() => setFlash("none"), 120);
    }
  };

  const handleBigTap = () => {
    if (isDone) return;
    if (mode === "rounds") tapRound();
    else tapRep();
  };

  const handleUndo = () => {
    if (mode === "rounds") {
      setRoundsDone((r) => Math.max(0, r - 1));
    } else {
      if (repsDone > 0) setRepsDone((r) => r - 1);
      else if (roundsDone > 0) {
        setRoundsDone((r) => r - 1);
        setRepsDone(Math.max(0, targetReps - 1));
      }
    }
    vibrate(20);
  };

  const roundsRemaining = Math.max(0, targetRounds - roundsDone);
  const bigDisplay = mode === "rounds"
    ? (direction === "down" ? roundsRemaining : roundsDone)
    : repsDone;
  const bigSub = mode === "rounds"
    ? (direction === "down" ? `of ${targetRounds} left` : `of ${targetRounds} done`)
    : `rep of ${targetReps}`;

  if (!open) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pl-2 pr-3 py-2 rounded-full bg-background/80 backdrop-blur-md border-2 border-primary/50 shadow-lg">
        <button
          onClick={handleBigTap}
          disabled={isDone}
          aria-label="Tap to count"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full select-none touch-manipulation transition-all active:scale-95",
            flash === "done"
              ? "bg-emerald-500 text-white"
              : flash === "tap"
                ? "bg-primary/90 text-primary-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/95",
            isDone && "opacity-70"
          )}
        >
          <div className="text-2xl font-black tabular-nums leading-none">
            {bigDisplay}
          </div>
          <div className="text-[10px] font-semibold opacity-90 text-left leading-tight">
            {isDone ? "🎉" : (mode === "rounds-reps" ? `R${roundsDone}/${targetRounds}` : "tap +1")}
            {mode === "rounds-reps" && !isDone && (
              <div className="opacity-80">{repsDone}/{targetReps}</div>
            )}
          </div>
        </button>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setIsMinimized(false)} aria-label="Expand">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-6 pointer-events-none">
      <div className="bg-background/90 backdrop-blur-md border-2 border-primary/50 rounded-xl shadow-2xl p-3 w-full max-w-sm max-h-[calc(100svh-8rem)] overflow-y-auto pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-primary">Rounds Counter</h3>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="inline-flex rounded-full bg-muted p-0.5 w-full mb-2">
          <button
            onClick={() => { setMode("rounds"); handleReset(); }}
            className={cn(
              "flex-1 h-7 rounded-full text-[11px] font-semibold transition-colors",
              mode === "rounds" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Rounds
          </button>
          <button
            onClick={() => { setMode("rounds-reps"); handleReset(); }}
            className={cn(
              "flex-1 h-7 rounded-full text-[11px] font-semibold transition-colors",
              mode === "rounds-reps" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            )}
          >
            Rounds + Reps
          </button>
        </div>

        {/* Targets */}
        <div className={cn("grid gap-2 mb-2", mode === "rounds-reps" ? "grid-cols-2" : "grid-cols-1")}>
          <div>
            <Label className="text-[10px] font-semibold">Target Rounds</Label>
            <Input
              type="number"
              value={targetRoundsInput}
              onChange={(e) => setTargetRoundsInput(e.target.value)}
              onBlur={() => commit(targetRoundsInput, setTargetRounds, setTargetRoundsInput)}
              className="h-7 text-xs text-center border border-primary/40 bg-background/50"
            />
          </div>
          {mode === "rounds-reps" && (
            <div>
              <Label className="text-[10px] font-semibold">Target Reps</Label>
              <Input
                type="number"
                value={targetRepsInput}
                onChange={(e) => setTargetRepsInput(e.target.value)}
                onBlur={() => commit(targetRepsInput, setTargetReps, setTargetRepsInput)}
                className="h-7 text-xs text-center border border-primary/40 bg-background/50"
              />
            </div>
          )}
        </div>

        {/* Big tap button */}
        <button
          onClick={handleBigTap}
          className={cn(
            "relative w-full rounded-lg select-none touch-manipulation h-24 transition-all duration-150 active:scale-[0.99] border-2 mb-2",
            flash === "done"
              ? "bg-emerald-500 border-emerald-300"
              : flash === "tap"
                ? "bg-primary/90 border-primary"
                : "bg-primary border-primary/70 hover:bg-primary/95"
          )}
        >
          <div className="flex flex-col items-center justify-center h-full text-primary-foreground px-2">
            {mode === "rounds-reps" && (
              <div className="text-[10px] font-semibold opacity-90 mb-0.5">
                Round {Math.min(roundsDone + (isDone ? 0 : 1), targetRounds)} / {targetRounds}
              </div>
            )}
            <div className="leading-none font-black tabular-nums drop-shadow-lg text-3xl">
              {bigDisplay}
            </div>
            <div className="text-[11px] font-semibold opacity-90 mt-1">
              {isDone ? "🎉 Done!" : bigSub}
            </div>
          </div>
        </button>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <Button variant="outline" onClick={handleUndo} className="h-8 text-xs">
            <Minus className="w-3 h-3 mr-1" />Undo
          </Button>
          <Button variant="outline" onClick={handleReset} className="h-8 text-xs">
            <RotateCcw className="w-3 h-3 mr-1" />Reset
          </Button>
          <Button variant="outline" onClick={tapRound} disabled={isDone} className="h-8 text-xs">
            <Plus className="w-3 h-3 mr-1" />Round
          </Button>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="tabular-nums shrink-0">
            <span className="font-semibold text-foreground">{roundsDone}</span>/{targetRounds}
            {mode === "rounds-reps" && <span> · {repsDone}/{targetReps}</span>}
          </span>
          <div className="flex items-center gap-1">
            {mode === "rounds" && (
            <button
              onClick={() => { setDirection(direction === "down" ? "up" : "down"); handleReset(); }}
              className="h-7 px-2 rounded-full text-[11px] font-semibold bg-muted/60 hover:bg-muted text-foreground transition-colors"
              aria-label="Toggle count direction"
            >
              {direction === "down" ? "⬇ Down" : "⬆ Up"}
            </button>
            )}
            <button
              onClick={() => setSoundOn((s) => !s)}
              aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
              aria-pressed={soundOn}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                soundOn ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted text-foreground"
              )}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setHapticOn((s) => !s)}
              aria-label={hapticOn ? "Turn vibration off" : "Turn vibration on"}
              aria-pressed={hapticOn}
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center transition-colors",
                hapticOn ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted text-foreground"
              )}
            >
              <Vibrate className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};