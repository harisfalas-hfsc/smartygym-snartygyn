import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Maximize2, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { useKeepScreenAwake } from "@/hooks/useKeepScreenAwake";

const WorkoutTimer = () => {
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [workTimeInput, setWorkTimeInput] = useState("20");
  const [restTimeInput, setRestTimeInput] = useState("10");
  const [roundsInput, setRoundsInput] = useState("8");
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  const [locked, setLocked] = useState(false);
  const [unlockHold, setUnlockHold] = useState(0);
  const unlockTimerRef = useRef<number | null>(null);

  // Keep the screen awake the entire time the user is on this tool.
  // Covers iOS Safari, Android Chrome, PWA, and in-app WebViews.
  useKeepScreenAwake(true);

  // Exit lock if user exits fullscreen via system gesture
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && locked) setLocked(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, [locked]);

  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [locked]);

  const enterLock = async () => {
    setLocked(true);
    try {
      const el: any = document.documentElement;
      if (el.requestFullscreen) { el.requestFullscreen().catch(() => {}); }
      else if (el.webkitRequestFullscreen) { try { el.webkitRequestFullscreen(); } catch { /* ignore */ } }
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

  // Auto-sync timer display when workTime changes and timer is idle
  useEffect(() => {
    if (!isRunning && currentRound === 0) {
      setTimeLeft(workTime);
    }
  }, [workTime, isRunning, currentRound]);

  const handleBlur = (field: 'work' | 'rest' | 'rounds') => {
    if (field === 'work') {
      const val = parseInt(workTimeInput) || 1;
      const clamped = Math.max(1, val);
      setWorkTime(clamped);
      setWorkTimeInput(String(clamped));
    } else if (field === 'rest') {
      const val = parseInt(restTimeInput) || 1;
      const clamped = Math.max(1, val);
      setRestTime(clamped);
      setRestTimeInput(String(clamped));
    } else {
      const val = parseInt(roundsInput) || 1;
      const clamped = Math.max(1, val);
      setRounds(clamped);
      setRoundsInput(String(clamped));
    }
  };

  const playBeep = useCallback(() => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1.5);
    } catch (e) {
      console.log('Audio playback failed:', e);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          if (isWorking) {
            setIsWorking(false);
            return restTime;
          } else {
            if (currentRound < rounds) {
              setCurrentRound((r) => r + 1);
              setIsWorking(true);
              return workTime;
            } else {
              setIsRunning(false);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isWorking, currentRound, rounds, workTime, restTime, playBeep]);

  const handleStartStop = () => {
    if (!isRunning && currentRound === 0) {
      setCurrentRound(1);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(0);
    setIsWorking(true);
    setTimeLeft(workTime);
  };

  return (
    <>
      <Helmet>
        <title>Workout Timer | Interval Training Timer | SmartyGym</title>
        <meta name="description" content="Free workout interval timer for your training sessions. Customizable work/rest periods and rounds. Perfect for HIIT, Tabata, and circuit training." />
        <link rel="canonical" href="https://smartygym.com/tools/workout-timer" />
        <meta property="og:url" content="https://smartygym.com/tools/workout-timer" />
        <meta property="og:title" content="Workout Timer | Interval Training Timer | SmartyGym" />
      </Helmet>

      <SEOEnhancer
        entities={["SmartyGym", "Workout Timer", "Interval Timer"]}
        topics={["workout timer", "interval training", "HIIT timer", "Tabata timer"]}
        expertise={["sports science", "exercise programming"]}
        contentType="tool"
        aiSummary="Free online workout interval timer at SmartyGym. Customizable work/rest intervals and rounds for HIIT, Tabata, and circuit training."
        aiKeywords={["workout timer", "interval timer", "HIIT timer", "rest timer"]}
        relatedContent={["workouts", "training programs"]}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-2xl px-4 pb-8">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Smarty Tools", href: "/tools" },
              { label: "Workout Timer" }
            ]}
          />

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Smarty Tools — Free to Use</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Workout Timer</h1>
          </div>

          {/* Mobile description card */}
          <Card className="md:hidden mb-4 border-2 border-primary/40">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground text-center">
                Customizable <span className="text-primary font-semibold">interval timer</span> for HIIT, Tabata, and circuit training sessions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">

              {/* Settings */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Work (sec)</Label>
                  <Input
                    type="number"
                    value={workTimeInput}
                    onChange={(e) => setWorkTimeInput(e.target.value)}
                    onBlur={() => handleBlur('work')}
                    disabled={isRunning}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Rest (sec)</Label>
                  <Input
                    type="number"
                    value={restTimeInput}
                    onChange={(e) => setRestTimeInput(e.target.value)}
                    onBlur={() => handleBlur('rest')}
                    disabled={isRunning}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Rounds</Label>
                  <Input
                    type="number"
                    value={roundsInput}
                    onChange={(e) => setRoundsInput(e.target.value)}
                    onBlur={() => handleBlur('rounds')}
                    disabled={isRunning}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Timer Display */}
              <div className="text-center py-8 bg-muted/50 rounded-lg mb-6">
                <div className={cn(
                  "text-7xl font-bold tabular-nums",
                  isWorking ? 'text-primary' : 'text-orange-500'
                )}>
                  {timeLeft}s
                </div>
                <div className="text-lg font-medium mt-2">
                  {isRunning ? (isWorking ? '💪 Work' : '😮‍💨 Rest') : 'Ready'} • Round {currentRound}/{rounds}
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={handleStartStop}
                  className="flex-1 h-12 text-lg"
                  variant={isRunning ? "destructive" : "default"}
                >
                  {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Pause</> : <><Play className="w-5 h-5 mr-2" /> Start</>}
                </Button>
                <Button onClick={handleReset} variant="outline" className="h-12 px-6">
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button onClick={enterLock} variant="outline" className="h-12 px-6" aria-label="Maximize fullscreen">
                  <Maximize2 className="w-5 h-5" />
                </Button>
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
          <div className={cn(
            "flex-1 w-full flex flex-col items-center justify-center px-6 py-10 transition-colors duration-150",
            isRunning ? (isWorking ? "bg-primary" : "bg-orange-500") : "bg-muted"
          )}>
            <div className={cn(
              "text-sm sm:text-base font-semibold uppercase tracking-[0.2em] opacity-80 mb-8",
              isRunning ? "text-primary-foreground" : "text-foreground"
            )}>
              {isRunning ? (isWorking ? 'Work' : 'Rest') : 'Ready'} · Round {currentRound}/{rounds}
            </div>
            <div
              className={cn(
                "leading-none font-black tabular-nums drop-shadow-md text-center",
                isRunning ? "text-primary-foreground" : "text-foreground"
              )}
              style={{ fontSize: "clamp(80px, min(22vh, 38vw), 220px)" }}
            >
              {timeLeft}
              <span
                className="font-semibold opacity-60 ml-2"
                style={{ fontSize: "clamp(28px, 6vh, 64px)" }}
              >
                s
              </span>
            </div>
            <div className="flex gap-3 mt-12">
              <Button
                onClick={handleStartStop}
                className="h-14 px-8 text-base"
                variant={isRunning ? "destructive" : "secondary"}
              >
                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Pause</> : <><Play className="w-5 h-5 mr-2" /> Start</>}
              </Button>
              <Button onClick={handleReset} variant="outline" className="h-14 px-6">
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Hold-to-unlock button */}
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
            className="fixed left-1/2 -translate-x-1/2 z-[10000] text-[10px] font-medium text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50"
            style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 180px)" }}
          >
            <Lock className="w-3 h-3 inline-block mr-1 -mt-0.5" />
            Locked — hold button to exit
          </div>
        </div>
      )}
    </>
  );
};

export default WorkoutTimer;
