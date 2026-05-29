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

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl px-4 pb-8">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Smarty Tools", href: "/tools" },
              { label: "Rounds Tracker" }
            ]}
          />

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Smarty Tools — Free to Use</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Rounds Tracker</h1>
          </div>

          <Card className="md:hidden mb-4 border-2 border-primary/40">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground text-center">
                Tap the <span className="text-primary font-semibold">big button</span> to count rounds — optionally count reps inside each round.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant={mode === "rounds" ? "default" : "outline"}
                  onClick={() => { setMode("rounds"); handleReset(); }}
                  className="h-10"
                >
                  Rounds only
                </Button>
                <Button
                  variant={mode === "rounds-reps" ? "default" : "outline"}
                  onClick={() => { setMode("rounds-reps"); handleReset(); }}
                  className="h-10"
                >
                  Rounds + reps
                </Button>
              </div>

              <div className={cn("grid gap-3 mb-4", mode === "rounds-reps" ? "grid-cols-2" : "grid-cols-1")}>
                <div>
                  <Label className="text-xs font-semibold">Target rounds</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={targetRoundsInput}
                    onChange={(e) => setTargetRoundsInput(e.target.value)}
                    onBlur={() => commitNumber(targetRoundsInput, setTargetRounds, setTargetRoundsInput)}
                    className="mt-1"
                  />
                </div>
                {mode === "rounds-reps" && (
                  <div>
                    <Label className="text-xs font-semibold">Reps per round</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={targetRepsInput}
                      onChange={(e) => setTargetRepsInput(e.target.value)}
                      onBlur={() => commitNumber(targetRepsInput, setTargetReps, setTargetRepsInput)}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {mode === "rounds" && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={direction === "down" ? "default" : "outline"}
                    onClick={() => { setDirection("down"); handleReset(); }}
                  >
                    Count down
                  </Button>
                  <Button
                    size="sm"
                    variant={direction === "up" ? "default" : "outline"}
                    onClick={() => { setDirection("up"); handleReset(); }}
                  >
                    Count up
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mb-4">
                <Button size="sm" variant={soundOn ? "default" : "outline"} onClick={() => setSoundOn((s) => !s)}>
                  {soundOn ? <Volume2 className="w-4 h-4 mr-1" /> : <VolumeX className="w-4 h-4 mr-1" />}
                  Sound
                </Button>
                <Button size="sm" variant={hapticOn ? "default" : "outline"} onClick={() => setHapticOn((s) => !s)}>
                  <Vibrate className="w-4 h-4 mr-1" />
                  Vibrate
                </Button>
              </div>

              <button
                onClick={handleBigTap}
                aria-label="Tap to count"
                className={cn(
                  "relative w-full rounded-2xl select-none touch-manipulation",
                  "h-[55vh] min-h-[320px] sm:h-[420px]",
                  "text-center transition-all duration-150 active:scale-[0.99]",
                  "border-4 shadow-2xl",
                  flash === "done"
                    ? "bg-emerald-500 border-emerald-300"
                    : flash === "tap"
                      ? "bg-primary/90 border-primary"
                      : "bg-primary border-primary/70 hover:bg-primary/95"
                )}
              >
                <div className="flex flex-col items-center justify-center h-full text-primary-foreground px-4">
                  {mode === "rounds-reps" && (
                    <div className="text-base sm:text-lg font-semibold opacity-90 mb-2">
                      Round {Math.min(roundsDone + (isDone ? 0 : 1), targetRounds)} / {targetRounds}
                    </div>
                  )}
                  <div className="text-[20vw] sm:text-[140px] leading-none font-black tabular-nums drop-shadow-lg">
                    {bigDisplay}
                  </div>
                  <div className="text-base sm:text-xl font-semibold opacity-90 mt-2">
                    {isDone ? "🎉 Done!" : bigSub}
                  </div>
                  <div className="text-xs sm:text-sm opacity-70 mt-3">
                    {isDone
                      ? "Reset to start again"
                      : mode === "rounds" ? "Tap anywhere to count a round" : "Tap anywhere to count a rep"}
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button variant="outline" onClick={handleUndo} className="h-11">
                  <Minus className="w-4 h-4 mr-1" /> Undo
                </Button>
                <Button variant="outline" onClick={handleReset} className="h-11">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
                <Button variant="outline" onClick={tapRound} disabled={isDone} className="h-11">
                  <Plus className="w-4 h-4 mr-1" /> +Round
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-muted-foreground">
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