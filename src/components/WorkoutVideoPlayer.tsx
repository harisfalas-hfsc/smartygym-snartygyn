import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface WorkoutVideoPlayerProps {
  exercises: Array<{ name: string; video_id: string; video_url: string }>;
  planContent: string;
  onClose?: () => void;
}

export const WorkoutVideoPlayer = ({ exercises, planContent }: WorkoutVideoPlayerProps) => {
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [workTime, setWorkTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Play beep sound
  const playBeep = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Extract exercise names from plan and make them clickable
  const renderPlanWithLinks = () => {
    let content = planContent;
    
    exercises.forEach(exercise => {
      const regex = new RegExp(`\\b${exercise.name}\\b`, 'gi');
      content = content.replace(
        regex,
        `<span class="exercise-link" data-video-id="${exercise.video_id}">${exercise.name}</span>`
      );
    });
    
    return content;
  };

  // Handle exercise click
  useEffect(() => {
    const handleExerciseClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('exercise-link')) {
        const videoId = target.getAttribute('data-video-id');
        if (videoId) {
          setCurrentVideoId(videoId);
        }
      }
    };

    document.addEventListener('click', handleExerciseClick);
    return () => document.removeEventListener('click', handleExerciseClick);
  }, []);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          
          if (isWorking) {
            // Switch to rest
            setIsWorking(false);
            return restTime;
          } else {
            // Switch to work or next round
            if (currentRound < rounds) {
              setCurrentRound((r) => r + 1);
              setIsWorking(true);
              return workTime;
            } else {
              // Workout complete
              setIsComplete(true);
              setIsRunning(false);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isWorking, currentRound, rounds, workTime, restTime, isComplete]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(1);
    setIsWorking(true);
    setTimeLeft(workTime);
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Video Player */}
      <Card className="p-6 space-y-4">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {currentVideoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${currentVideoId}`}
              title="Exercise demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Click on an exercise name to view demonstration
            </div>
          )}
        </div>

        {/* Workout Timer */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              Round {currentRound} of {rounds}
            </div>
            <div className="text-6xl font-light tracking-tight" style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}>
              {formatTime(timeLeft)}
            </div>
            <div className={`text-lg font-medium ${isWorking ? 'text-primary' : 'text-muted-foreground'}`}>
              {isComplete ? 'Complete!' : isWorking ? 'WORK' : 'REST'}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="work-time" className="text-xs">Work (sec)</Label>
              <Input
                id="work-time"
                type="number"
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value) || 45)}
                disabled={isRunning}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="rest-time" className="text-xs">Rest (sec)</Label>
              <Input
                id="rest-time"
                type="number"
                value={restTime}
                onChange={(e) => setRestTime(parseInt(e.target.value) || 15)}
                disabled={isRunning}
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="rounds" className="text-xs">Rounds</Label>
              <Input
                id="rounds"
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 3)}
                disabled={isRunning}
                className="h-9"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleStartPause}
              className="flex-1"
              variant={isRunning ? "outline" : "default"}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span>Sound enabled</span>
          </div>
        </div>
      </Card>

      {/* Workout Plan */}
      <Card className="p-6 overflow-y-auto max-h-[600px]">
        <style>{`
          .exercise-link {
            color: hsl(var(--primary));
            text-decoration: underline;
            cursor: pointer;
            transition: all 0.2s;
          }
          .exercise-link:hover {
            color: hsl(var(--primary-hover));
            text-decoration: none;
          }
        `}</style>
        <div 
          className="whitespace-pre-wrap space-y-2"
          style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif' }}
          dangerouslySetInnerHTML={{ __html: renderPlanWithLinks() }}
        />
      </Card>
    </div>
  );
};