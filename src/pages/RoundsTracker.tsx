import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Plus, Minus, Volume2, VolumeX, Vibrate, Lock, Unlock, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOEnhancer } from "@/components/SEOEnhancer";

type Mode = "rounds" | "rounds-reps";
type Direction = "down" | "up";

const RoundsTracker = () => {
  const [mode, setMode] = useState<Mode>("rounds");
  const [direction, setDirection] = useState<Direction>("down");
  const [targetRounds, setTargetRounds] = useState(10);
  const [targetReps, setTargetReps] = useState(10);
  const [targetRoundsInput, setTargetRoundsInput] = useState("10");
  const [targetRepsInput, setTargetRepsInput] = useState("10");

  const [roundsDone, setRoundsDone] = useState(0);
  const [repsDone, setRepsDone] = useState(0);

  const [soundOn, setSoundOn] = useState(true);
  const [hapticOn, setHapticOn] = useState(true);
  const [flash, setFlash] = useState<"none" | "tap" | "done">("none");
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [locked, setLocked] = useState(false);
  const [unlockHold, setUnlockHold] = useState(0);
  const unlockTimerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const request = async () => {
      if ("wakeLock" in navigator) {
        try { wakeLockRef.current = await (navigator as any).wakeLock.request("screen"); } catch { /* ignore */ }
      }
    };
    request();
    const onVis = () => { if (document.visibilityState === "visible") request(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      wakeLockRef.current?.release(); wakeLockRef.current = null;
    };
  }, []);

  // Exit lock if user leaves fullscreen via system gesture
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && locked) setLocked(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [locked]);

  const enterLock = async () => {
    setLocked(true);
    try {
      const el: any = rootRef.current || document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch { /* ignore */ }
    try { (screen.orientation as any)?.lock?.("portrait").catch(() => {}); } catch { /* ignore */ }
  };

  const exitLock = async () => {
    setLocked(false);
    setUnlockHold(0);
    if (unlockTimerRef.current) { window.clearInterval(unlockTimerRef.current); unlockTimerRef.current = null; }
    try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* ignore */ }
  };

  const startUnlock = () => {
    if (unlockTimerRef.current) return;
    const start = Date.now();
    unlockTimerRef.current = window.setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 1200) * 100);
      setUnlockHold(pct);
      if (pct >= 100) {
        window.clearInterval(unlockTimerRef.current!);
        unlockTimerRef.current = null;
        exitLock();
      }
    }, 50);
  };

  const cancelUnlock = () => {
    if (unlockTimerRef.current) { window.clearInterval(unlockTimerRef.current); unlockTimerRef.current = null; }
    setUnlockHold(0);
  };

  const beep = useCallback((freq = 800, dur = 0.15) => {
    if (!soundOn) return;
    try {
      let ctx = audioCtxRef.current;
      if (!ctx) {
        const Ctor = (window.AudioContext || (window as any).webkitAudioContext);
        if (!Ctor) return;
        ctx = new Ctor();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch { /* ignore */ }
  }, [soundOn]);

  const vibrate = useCallback((ms: number | number[]) => {
    if (!hapticOn) return;
    try { navigator.vibrate?.(ms); } catch { /* ignore */ }
  }, [hapticOn]);

  const isDone = roundsDone >= targetRounds;

  const handleReset = () => {
    setRoundsDone(0);
    setRepsDone(0);
    setFlash("none");
  };

  const tapRound = () => {
    const next = roundsDone + 1;
    setRoundsDone(next);
    setRepsDone(0);
    if (next >= targetRounds) {
      beep(1200, 0.6); vibrate([80, 60, 80, 60, 200]);
      setFlash("done"); setTimeout(() => setFlash("none"), 1200);
    } else {
      beep(800, 0.15); vibrate(50);
      setFlash("tap"); setTimeout(() => setFlash("none"), 180);
    }
  };

  const tapRep = () => {
    const nextReps = repsDone + 1;
    if (nextReps >= targetReps) {
      const nextRounds = roundsDone + 1;
      setRoundsDone(nextRounds);
      setRepsDone(0);
      if (nextRounds >= targetRounds) {
        beep(1200, 0.6); vibrate([80, 60, 80, 60, 200]);
        setFlash("done"); setTimeout(() => setFlash("none"), 1200);
      } else {
        beep(1000, 0.25); vibrate([60, 40, 60]);
        setFlash("tap"); setTimeout(() => setFlash("none"), 220);
      }
    } else {
      setRepsDone(nextReps);
      beep(700, 0.08); vibrate(30);
      setFlash("tap"); setTimeout(() => setFlash("none"), 120);
    }
  };

  const handleBigTap = () => {
    if (isDone) return;
    if (mode === "rounds") tapRound(); else tapRep();
  };

  const handleUndo = () => {
    if (mode === "rounds") {
      setRoundsDone((r) => Math.max(0, r - 1));
    } else {
      if (repsDone > 0) {
        setRepsDone((r) => r - 1);
      } else if (roundsDone > 0) {
        setRoundsDone((r) => r - 1);
        setRepsDone(Math.max(0, targetReps - 1));
      }
    }
    vibrate(20);
  };

  const commitNumber = (val: string, setVal: (n: number) => void, setInput: (s: string) => void, min = 1) => {
    const n = Math.max(min, parseInt(val) || min);
    setVal(n);
    setInput(String(n));
  };

  const roundsRemaining = Math.max(0, targetRounds - roundsDone);
  const bigDisplay = mode === "rounds"
    ? (direction === "down" ? roundsRemaining : roundsDone)
    : repsDone;
  const bigSub = mode === "rounds"
    ? (direction === "down" ? `of ${targetRounds} left` : `of ${targetRounds} done`)
    : `rep of ${targetReps}`;

  return (
    <>
      <Helmet>
        <title>Rounds Tracker | Tap to Count Rounds & Reps | SmartyGym</title>
        <meta name="description" content="Free big-button rounds and reps counter. Tap anywhere to count rounds (and optional reps) during your workout. Perfect for AMRAP, EMOM, and circuit training." />
        <link rel="canonical" href="https://smartygym.com/tools/rounds-tracker" />
        <meta property="og:url" content="https://smartygym.com/tools/rounds-tracker" />
        <meta property="og:title" content="Rounds Tracker | Tap to Count Rounds & Reps | SmartyGym" />
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym", "Rounds Tracker", "Rep Counter"]}
        topics={["rounds counter", "rep counter", "AMRAP tracker", "circuit training"]}
        expertise={["sports science", "exercise programming"]}
        contentType="tool"
        aiSummary="Free SmartyGym rounds and reps tracker with a giant tap button — count workout rounds and reps hands-free."
        aiKeywords={["rounds tracker", "rep counter", "AMRAP counter", "tally counter workout"]}
        relatedContent={["workouts", "workout timer"]}
      />

      <div ref={rootRef} className="lg:min-h-screen bg-background flex flex-col">
        <div className="container mx-auto max-w-2xl px-3 lg:px-4 pt-1 lg:pt-4 pb-2 lg:pb-8 flex flex-col">
          <div className="hidden lg:block">
            <PageBreadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: "Smarty Tools", href: "/tools" },
                { label: "Rounds Tracker" }
              ]}
            />
          </div>

          <div className="text-center mb-1 lg:mb-6">
            <p className="hidden lg:block text-sm text-muted-foreground mb-2">Smarty Tools — Free to Use</p>
            <h1 className="text-base lg:text-3xl xl:text-4xl font-bold lg:mb-2">Rounds Tracker</h1>
          </div>

          <Card className="hidden lg:block mb-4 border-2 border-primary/40">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground text-center">
                Tap the <span className="text-primary font-semibold">big button</span> to count rounds — optionally count reps inside each round.
              </p>
            </CardContent>
          </Card>

          <Card className="flex flex-col bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-3 sm:p-4 lg:p-6 flex flex-col gap-3 lg:gap-4">
              {/* Segmented mode toggle */}
              <div className="inline-flex rounded-full bg-muted p-1 self-center w-full max-w-sm">
                <button
                  onClick={() => { setMode("rounds"); handleReset(); }}
                  className={cn(
                    "flex-1 h-9 rounded-full text-sm font-semibold transition-colors",
                    mode === "rounds" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Rounds
                </button>
                <button
                  onClick={() => { setMode("rounds-reps"); handleReset(); }}
                  className={cn(
                    "flex-1 h-9 rounded-full text-sm font-semibold transition-colors",
                    mode === "rounds-reps" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Rounds + Reps
                </button>
              </div>

              {/* Compact stepper inputs */}
              <div className={cn("grid gap-2", mode === "rounds-reps" ? "grid-cols-2" : "grid-cols-1")}>
                <Stepper
                  label="Rounds"
                  value={targetRounds}
                  inputValue={targetRoundsInput}
                  onInputChange={setTargetRoundsInput}
                  onCommit={() => commitNumber(targetRoundsInput, setTargetRounds, setTargetRoundsInput)}
                  onDec={() => { const n = Math.max(1, targetRounds - 1); setTargetRounds(n); setTargetRoundsInput(String(n)); }}
                  onInc={() => { const n = targetRounds + 1; setTargetRounds(n); setTargetRoundsInput(String(n)); }}
                />
                {mode === "rounds-reps" && (
                  <Stepper
                    label="Reps"
                    value={targetReps}
                    inputValue={targetRepsInput}
                    onInputChange={setTargetRepsInput}
                    onCommit={() => commitNumber(targetRepsInput, setTargetReps, setTargetRepsInput)}
                    onDec={() => { const n = Math.max(1, targetReps - 1); setTargetReps(n); setTargetRepsInput(String(n)); }}
                    onInc={() => { const n = targetReps + 1; setTargetReps(n); setTargetRepsInput(String(n)); }}
                  />
                )}
              </div>

              <button
                onClick={handleBigTap}
                aria-label="Tap to count"
                className={cn(
                  "relative w-full rounded-2xl select-none touch-manipulation",
                  "h-[26svh] lg:h-[420px]",
                  "text-center transition-all duration-150 active:scale-[0.99]",
                  "border-4 shadow-xl",
                  flash === "done"
                    ? "bg-emerald-500 border-emerald-300"
                    : flash === "tap"
                      ? "bg-primary/90 border-primary"
                      : "bg-primary border-primary/70 hover:bg-primary/95"
                )}
              >
                <div className="flex flex-col items-center justify-center h-full text-primary-foreground px-3 lg:px-4">
                  {mode === "rounds-reps" && (
                    <div className="text-xs lg:text-lg font-semibold opacity-90 mb-0.5 lg:mb-2">
                      Round {Math.min(roundsDone + (isDone ? 0 : 1), targetRounds)} / {targetRounds}
                    </div>
                  )}
                  <div
                    className="leading-none font-black tabular-nums drop-shadow-lg"
                    style={{ fontSize: "clamp(56px, 12vh, 160px)" }}
                  >
                    {bigDisplay}
                  </div>
                  <div className="text-xs lg:text-xl font-semibold opacity-90 mt-1 lg:mt-2">
                    {isDone ? "🎉 Done!" : bigSub}
                  </div>
                  <div className="text-[10px] lg:text-sm opacity-70 mt-0.5 lg:mt-3">
                    {isDone
                      ? "Reset to start again"
                      : mode === "rounds" ? "Tap anywhere to count a round" : "Tap anywhere to count a rep"}
                  </div>
                </div>
              </button>

              {/* Primary actions row */}
              <div className="grid grid-cols-3 gap-2">
                <Button variant="ghost" onClick={handleUndo} className="h-11 text-sm font-semibold rounded-xl bg-muted/60 hover:bg-muted">
                  <Minus className="w-4 h-4 mr-1.5" />Undo
                </Button>
                <Button variant="ghost" onClick={handleReset} className="h-11 text-sm font-semibold rounded-xl bg-muted/60 hover:bg-muted">
                  <RotateCcw className="w-4 h-4 mr-1.5" />Reset
                </Button>
                <Button variant="ghost" onClick={tapRound} disabled={isDone} className="h-11 text-sm font-semibold rounded-xl bg-muted/60 hover:bg-muted">
                  <Plus className="w-4 h-4 mr-1.5" />Round
                </Button>
              </div>

              {/* Subtle settings row — icon-only toggles */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="text-xs text-muted-foreground tabular-nums">
                  <span className="font-semibold text-foreground">{roundsDone}</span>/{targetRounds}
                  {mode === "rounds-reps" && (
                    <> · <span className="font-semibold text-foreground">{repsDone}</span>/{targetReps}</>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {mode === "rounds" && (
                    <button
                      onClick={() => { setDirection(direction === "down" ? "up" : "down"); handleReset(); }}
                      className="h-9 px-2.5 rounded-full text-xs font-semibold bg-muted/60 hover:bg-muted text-foreground transition-colors"
                      aria-label="Toggle count direction"
                    >
                      {direction === "down" ? "⬇ Down" : "⬆ Up"}
                    </button>
                  )}
                  <IconToggle active={soundOn} onClick={() => setSoundOn((s) => !s)} label="Sound">
                    {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </IconToggle>
                  <IconToggle active={hapticOn} onClick={() => setHapticOn((s) => !s)} label="Vibrate">
                    <Vibrate className="w-4 h-4" />
                  </IconToggle>
                  <IconToggle active={false} onClick={enterLock} label="Lock screen">
                    <Maximize2 className="w-4 h-4" />
                  </IconToggle>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {locked && (
        <div
          className="fixed inset-0 z-[9999] bg-background flex flex-col"
          style={{ touchAction: "manipulation" }}
        >
          <button
            onClick={handleBigTap}
            aria-label="Tap to count"
            className={cn(
              "flex-1 w-full select-none touch-manipulation",
              "text-center transition-colors duration-150",
              flash === "done"
                ? "bg-emerald-500"
                : flash === "tap"
                  ? "bg-primary/90"
                  : "bg-primary"
            )}
          >
            <div className="flex flex-col items-center justify-center h-full text-primary-foreground px-4">
              {mode === "rounds-reps" && (
                <div className="text-lg font-semibold opacity-90 mb-2">
                  Round {Math.min(roundsDone + (isDone ? 0 : 1), targetRounds)} / {targetRounds}
                </div>
              )}
              <div
                className="leading-none font-black tabular-nums drop-shadow-lg"
                style={{ fontSize: "clamp(120px, 32vh, 360px)" }}
              >
                {bigDisplay}
              </div>
              <div className="text-xl font-semibold opacity-90 mt-4">
                {isDone ? "🎉 Done!" : bigSub}
              </div>
              <div className="text-sm opacity-70 mt-2">
                {isDone
                  ? "Hold the lock button to exit"
                  : mode === "rounds" ? "Tap anywhere to count a round" : "Tap anywhere to count a rep"}
              </div>
            </div>
          </button>

          {/* Hold-to-unlock button — corner, away from tap zone */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); startUnlock(); }}
            onPointerUp={(e) => { e.stopPropagation(); cancelUnlock(); }}
            onPointerLeave={(e) => { e.stopPropagation(); cancelUnlock(); }}
            onPointerCancel={(e) => { e.stopPropagation(); cancelUnlock(); }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); }}
            aria-label="Hold to unlock"
            className="fixed right-4 z-[10000] h-20 w-20 rounded-full bg-background border-4 border-primary shadow-2xl flex items-center justify-center text-foreground select-none"
            style={{
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)",
              backgroundImage: `conic-gradient(hsl(var(--primary)) ${unlockHold}%, transparent ${unlockHold}%)`,
              touchAction: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTouchCallout: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              className="h-14 w-14 rounded-full bg-background flex flex-col items-center justify-center gap-0.5 pointer-events-none select-none"
              style={{ WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none" }}
            >
              {unlockHold > 0 ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              <span className="text-[9px] font-bold leading-none">HOLD</span>
            </div>
          </button>

          <div
            className="fixed left-1/2 -translate-x-1/2 z-[10000] text-xs font-semibold text-foreground bg-background/90 backdrop-blur px-3 py-1.5 rounded-full border-2 border-primary/40 shadow"
            style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
          >
            🔒 Locked — hold the lock button to exit
          </div>
        </div>
      )}
    </>
  );
};

export default RoundsTracker;