import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkoutTimerPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WorkoutTimerPopup = ({ open, onOpenChange }: WorkoutTimerPopupProps) => {
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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

  const handleClose = () => {
    setIsRunning(false);
    handleReset();
    onOpenChange(false);
  };

  if (!open) return null;

  // Minimized floating timer - just shows time and controls
  if (isMinimized) {
    return (
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border-2 border-primary/50 shadow-lg">
        <div className={cn(
          "text-xl font-bold tabular-nums",
          isWorking ? 'text-primary' : 'text-orange-500'
        )}>
          {timeLeft}s
        </div>
        <span className="text-xs text-muted-foreground">
          {isRunning ? (isWorking ? '💪' : '😮‍💨') : '⏸️'} R{currentRound}/{rounds}
        </span>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={handleStartStop}
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={() => setIsMinimized(false)}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-7 w-7"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Expanded floating timer - transparent overlay
  return (
    <div className="fixed inset-x-0 bottom-16 z-50 mx-auto max-w-sm px-4">
      <div className="bg-background/85 backdrop-blur-md border-2 border-primary/50 rounded-xl shadow-2xl p-4">
        {/* Header with minimize/close */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Workout Timer</h3>
          <div className="flex gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6"
              onClick={() => setIsMinimized(true)}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6"
              onClick={handleClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Settings row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <Label className="text-[10px] font-semibold">Work</Label>
            <div className="flex items-center gap-0.5">
              <Input
                type="number"
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                disabled={isRunning}
                className="h-7 text-xs text-center border border-primary/40 bg-background/50"
              />
              <span className="text-[10px]">s</span>
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-semibold">Rest</Label>
            <div className="flex items-center gap-0.5">
              <Input
                type="number"
                value={restTime}
                onChange={(e) => setRestTime(parseInt(e.target.value) || 10)}
                disabled={isRunning}
                className="h-7 text-xs text-center border border-primary/40 bg-background/50"
              />
              <span className="text-[10px]">s</span>
            </div>
          </div>
          <div>
            <Label className="text-[10px] font-semibold">Rounds</Label>
            <Input
              type="number"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
              disabled={isRunning}
              className="h-7 text-xs text-center border border-primary/40 bg-background/50"
            />
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center py-2 bg-muted/50 rounded-lg mb-3">
          <div className={cn(
            "text-4xl font-bold tabular-nums",
            isWorking ? 'text-primary' : 'text-orange-500'
          )}>
            {timeLeft}s
          </div>
          <div className="text-xs font-medium">
            {isRunning ? (isWorking ? '💪 Work' : '😮‍💨 Rest') : 'Ready'} • Round {currentRound}/{rounds}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={handleStartStop}
            className="flex-1 h-9"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Start</>}
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-9 px-3">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
