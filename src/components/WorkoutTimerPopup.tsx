import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw } from "lucide-react";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">Workout Timer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs font-semibold">Work</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={workTime}
                  onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                  disabled={isRunning}
                  className="h-9 text-center border-2 border-primary/40"
                />
                <span className="text-xs">s</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Rest</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={restTime}
                  onChange={(e) => setRestTime(parseInt(e.target.value) || 10)}
                  disabled={isRunning}
                  className="h-9 text-center border-2 border-primary/40"
                />
                <span className="text-xs">s</span>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Rounds</Label>
              <Input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                disabled={isRunning}
                className="h-9 text-center border-2 border-primary/40"
              />
            </div>
          </div>

          <div className="text-center py-4 bg-muted rounded-lg">
            <div className={`text-5xl font-bold mb-2 ${isWorking ? 'text-primary' : 'text-orange-500'}`}>
              {timeLeft}s
            </div>
            <div className="text-sm font-semibold">
              {isRunning ? (isWorking ? '💪 Work' : '😮‍💨 Rest') : 'Ready'} • Round {currentRound}/{rounds}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleStartStop}
              className="flex-1 h-11"
              variant={isRunning ? "destructive" : "default"}
            >
              {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
            </Button>
            <Button onClick={handleReset} variant="outline" className="h-11 px-4">
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
