import { useState, useEffect, useCallback, useRef } from "react";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOEnhancer } from "@/components/SEOEnhancer";

const WorkoutTimer = () => {
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Screen Wake Lock: keep screen on while timer is running (mobile)
  useEffect(() => {
    const requestWakeLock = async () => {
      if (isRunning && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (e) {
          console.log('Wake Lock request failed:', e);
        }
      } else if (!isRunning && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
    requestWakeLock();
    return () => {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, [isRunning]);

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

      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto py-4 sm:py-8">
          <PageBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Smarty Tools", href: "/tools" },
              { label: "Workout Timer" }
            ]}
          />

          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Smart Tools — Free to Use</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Workout Timer</h1>
          </div>

          <Card>
            <CardContent className="p-6">

              {/* Settings */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Work (sec)</Label>
                  <Input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                    disabled={isRunning}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Rest (sec)</Label>
                  <Input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(parseInt(e.target.value) || 10)}
                    disabled={isRunning}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm font-semibold">Rounds</Label>
                  <Input
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default WorkoutTimer;
