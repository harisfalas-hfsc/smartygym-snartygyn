import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Plus, Minus, Volume2, VolumeX, Vibrate } from "lucide-react";
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

  useEffect(() => {
    const request = async () => {
      if ("wakeLock" in navigator) {
        try { wakeLockRef.current = await navigator.wakeLock.request("screen"); } catch { /* ignore */ }
      }
    };
    request();
    return () => { wakeLockRef.current?.release(); wakeLockRef.current = null; };
  }, []);

  const beep = useCallback((freq = 800, dur = 0.15) => {
    if (!soundOn) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
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

      <div className="lg:min-h-screen bg-background flex flex-col">
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
              <div className="grid grid-cols-2 gap-1.5 lg:gap-2 mb-1.5 lg:mb-4">
                <Button
                  variant={mode === "rounds" ? "default" : "outline"}
                  onClick={() => { setMode("rounds"); handleReset(); }}
                  className="h-7 lg:h-10 text-[11px] lg:text-sm"
                >
                  Rounds only
                </Button>
                <Button
                  variant={mode === "rounds-reps" ? "default" : "outline"}
                  onClick={() => { setMode("rounds-reps"); handleReset(); }}
                  className="h-7 lg:h-10 text-[11px] lg:text-sm"
                >
                  Rounds + reps
                </Button>
              </div>

              <div className={cn("grid gap-1.5 lg:gap-3 mb-1.5 lg:mb-4", mode === "rounds-reps" ? "grid-cols-2" : "grid-cols-1")}>
                <div>
                  <Label className="text-[10px] lg:text-xs font-semibold leading-none">Target rounds</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={targetRoundsInput}
                    onChange={(e) => setTargetRoundsInput(e.target.value)}
                    onBlur={() => commitNumber(targetRoundsInput, setTargetRounds, setTargetRoundsInput)}
                    className="mt-0.5 h-7 lg:h-10 text-sm"
                  />
                </div>
                {mode === "rounds-reps" && (
                  <div>
                    <Label className="text-[10px] lg:text-xs font-semibold leading-none">Reps per round</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={targetRepsInput}
                      onChange={(e) => setTargetRepsInput(e.target.value)}
                      onBlur={() => commitNumber(targetRepsInput, setTargetReps, setTargetRepsInput)}
                      className="mt-0.5 h-7 lg:h-10 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1 lg:gap-2 mb-1.5 lg:mb-4">
                {mode === "rounds" && (
                  <>
                    <Button
                      size="sm"
                      variant={direction === "down" ? "default" : "outline"}
                      onClick={() => { setDirection("down"); handleReset(); }}
                      className="h-6 lg:h-9 px-2 lg:px-3 text-[10px] lg:text-sm"
                    >
                      Count down
                    </Button>
                    <Button
                      size="sm"
                      variant={direction === "up" ? "default" : "outline"}
                      onClick={() => { setDirection("up"); handleReset(); }}
                      className="h-6 lg:h-9 px-2 lg:px-3 text-[10px] lg:text-sm"
                    >
                      Count up
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant={soundOn ? "default" : "outline"}
                  onClick={() => setSoundOn((s) => !s)}
                  className="h-6 lg:h-9 px-2 lg:px-3 text-[10px] lg:text-sm"
                  aria-label="Toggle sound"
                >
                  {soundOn ? <Volume2 className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" /> : <VolumeX className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />}
                  <span className="hidden lg:inline">Sound</span>
                </Button>
                <Button
                  size="sm"
                  variant={hapticOn ? "default" : "outline"}
                  onClick={() => setHapticOn((s) => !s)}
                  className="h-6 lg:h-9 px-2 lg:px-3 text-[10px] lg:text-sm"
                  aria-label="Toggle vibration"
                >
                  <Vibrate className="w-3 h-3 lg:w-4 lg:h-4 lg:mr-1" />
                  <span className="hidden lg:inline">Vibrate</span>
                </Button>
              </div>

              <button
                onClick={handleBigTap}
                aria-label="Tap to count"
                className={cn(
                  "relative w-full rounded-2xl select-none touch-manipulation",
                  "h-[34svh] lg:h-[420px]",
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
                    style={{ fontSize: "clamp(56px, 14vh, 160px)" }}
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

              <div className="grid grid-cols-3 gap-1.5 lg:gap-2 mt-1.5 lg:mt-4">
                <Button variant="outline" onClick={handleUndo} className="h-8 lg:h-11 text-[11px] lg:text-sm px-1">
                  <Minus className="w-3.5 h-3.5 mr-1" /> Undo
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-8 lg:h-11 text-[11px] lg:text-sm px-1">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                </Button>
                <Button variant="outline" onClick={tapRound} disabled={isDone} className="h-8 lg:h-11 text-[11px] lg:text-sm px-1">
                  <Plus className="w-3.5 h-3.5 mr-1" /> +Round
                </Button>
              </div>

              <div className="mt-1 lg:mt-4 text-center text-[10px] lg:text-sm text-muted-foreground leading-tight">
                Rounds done: <span className="font-semibold text-foreground">{roundsDone}</span> / {targetRounds}
                {mode === "rounds-reps" && (
                  <> · Reps this round: <span className="font-semibold text-foreground">{repsDone}</span> / {targetReps}</>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RoundsTracker;