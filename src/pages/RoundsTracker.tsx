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

          <Card className="flex flex-col bg-card border-2 border-primary/30 shadow-lg lg:shadow-none lg:border lg:border-border">
            <CardContent className="p-2 sm:p-3 lg:p-6 flex flex-col">
              <div className="grid grid-cols-2 gap-2 mb-2 lg:mb-4">
                <Button
                  variant={mode === "rounds" ? "default" : "outline"}
                  onClick={() => { setMode("rounds"); handleReset(); }}
                  className="h-11 lg:h-10 text-sm font-semibold"
                >
                  Rounds only
                </Button>
                <Button
                  variant={mode === "rounds-reps" ? "default" : "outline"}
                  onClick={() => { setMode("rounds-reps"); handleReset(); }}
                  className="h-11 lg:h-10 text-sm font-semibold"
                >
                  Rounds + reps
                </Button>
              </div>

              <div className={cn("grid gap-2 lg:gap-3 mb-2 lg:mb-4", mode === "rounds-reps" ? "grid-cols-2" : "grid-cols-1")}>
                <div>
                  <Label className="text-xs lg:text-xs font-semibold leading-none">Target rounds</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={targetRoundsInput}
                    onChange={(e) => setTargetRoundsInput(e.target.value)}
                    onBlur={() => commitNumber(targetRoundsInput, setTargetRounds, setTargetRoundsInput)}
                    className="mt-1 h-11 lg:h-10 text-base font-semibold text-center"
                  />
                </div>
                {mode === "rounds-reps" && (
                  <div>
                    <Label className="text-xs lg:text-xs font-semibold leading-none">Reps per round</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={targetRepsInput}
                      onChange={(e) => setTargetRepsInput(e.target.value)}
                      onBlur={() => commitNumber(targetRepsInput, setTargetReps, setTargetRepsInput)}
                      className="mt-1 h-11 lg:h-10 text-base font-semibold text-center"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-2 lg:mb-4">
                {mode === "rounds" && (
                  <>
                    <Button
                      variant={direction === "down" ? "default" : "outline"}
                      onClick={() => { setDirection("down"); handleReset(); }}
                      className="h-10 lg:h-9 px-3 lg:px-3 text-sm font-semibold"
                    >
                      ⬇ Count down
                    </Button>
                    <Button
                      variant={direction === "up" ? "default" : "outline"}
                      onClick={() => { setDirection("up"); handleReset(); }}
                      className="h-10 lg:h-9 px-3 lg:px-3 text-sm font-semibold"
                    >
                      ⬆ Count up
                    </Button>
                  </>
                )}
                <Button
                  variant={soundOn ? "default" : "outline"}
                  onClick={() => setSoundOn((s) => !s)}
                  className="h-10 lg:h-9 px-3 lg:px-3 text-sm font-semibold"
                  aria-label="Toggle sound"
                >
                  {soundOn ? <Volume2 className="w-4 h-4 mr-1.5" /> : <VolumeX className="w-4 h-4 mr-1.5" />}
                  <span>Sound {soundOn ? "on" : "off"}</span>
                </Button>
                <Button
                  variant={hapticOn ? "default" : "outline"}
                  onClick={() => setHapticOn((s) => !s)}
                  className="h-10 lg:h-9 px-3 lg:px-3 text-sm font-semibold"
                  aria-label="Toggle vibration"
                >
                  <Vibrate className="w-4 h-4 mr-1.5" />
                  <span>Vibrate {hapticOn ? "on" : "off"}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={enterLock}
                  className="h-10 lg:h-9 px-3 lg:px-3 text-sm font-semibold"
                  aria-label="Lock screen for workout"
                >
                  <Maximize2 className="w-4 h-4 mr-1.5" />
                  <span>Lock screen</span>
                </Button>
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

              <div className="grid grid-cols-3 gap-2 mt-2 lg:mt-4">
                <Button variant="outline" onClick={handleUndo} className="h-12 lg:h-11 text-sm font-semibold px-1 flex-col gap-0.5 lg:flex-row lg:gap-2">
                  <Minus className="w-5 h-5 lg:w-4 lg:h-4" />
                  <span>Undo</span>
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-12 lg:h-11 text-sm font-semibold px-1 flex-col gap-0.5 lg:flex-row lg:gap-2">
                  <RotateCcw className="w-5 h-5 lg:w-4 lg:h-4" />
                  <span>Reset</span>
                </Button>
                <Button variant="outline" onClick={tapRound} disabled={isDone} className="h-12 lg:h-11 text-sm font-semibold px-1 flex-col gap-0.5 lg:flex-row lg:gap-2">
                  <Plus className="w-5 h-5 lg:w-4 lg:h-4" />
                  <span>+Round</span>
                </Button>
              </div>

              <div className="mt-2 lg:mt-4 text-center text-xs lg:text-sm text-muted-foreground leading-tight">
                Rounds done: <span className="font-semibold text-foreground">{roundsDone}</span> / {targetRounds}
                {mode === "rounds-reps" && (
                  <> · Reps this round: <span className="font-semibold text-foreground">{repsDone}</span> / {targetReps}</>
                )}
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
            aria-label="Hold to unlock"
            className="fixed bottom-4 right-4 z-[10000] h-16 w-16 rounded-full bg-background/80 backdrop-blur border-2 border-primary/60 shadow-xl flex items-center justify-center text-foreground touch-manipulation"
            style={{
              backgroundImage: `conic-gradient(hsl(var(--primary)) ${unlockHold}%, transparent ${unlockHold}%)`,
            }}
          >
            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center">
              {unlockHold > 0 ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
          </button>

          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[10000] text-xs text-muted-foreground bg-background/70 backdrop-blur px-3 py-1 rounded-full border">
            Hold the lock icon to exit
          </div>
        </div>
      )}
    </>
  );
};

export default RoundsTracker;