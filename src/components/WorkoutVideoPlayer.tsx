import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Volume2, Dumbbell, Target, AlertCircle, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface WorkoutVideoPlayerProps {
  exercises: Array<{ name: string; video_id: string; video_url: string }>;
  planContent: string;
  onClose?: () => void;
}

interface ParsedPlan {
  overview: string;
  warmup: string;
  mainWorkout: string;
  cooldown: string;
  tips: string;
  disclaimer: string;
}

export const WorkoutVideoPlayer = ({ exercises, planContent }: WorkoutVideoPlayerProps) => {
  const [currentVideoId, setCurrentVideoId] = useState<string>("");
  const [workTime, setWorkTime] = useState(45);
  const [restTime, setRestTime] = useState(15);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
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

  // Update timeLeft when workTime changes and timer is not running
  useEffect(() => {
    if (!isRunning && isWorking) {
      setTimeLeft(workTime);
    }
  }, [workTime, isRunning, isWorking]);

  // Parse the plan content into sections
  const parsePlanContent = (): ParsedPlan => {
    const sections: ParsedPlan = {
      overview: "",
      warmup: "",
      mainWorkout: "",
      cooldown: "",
      tips: "",
      disclaimer: ""
    };

    const lines = planContent.split('\n');
    let currentSection = 'overview';

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      if (lowerLine.includes('warm') && lowerLine.includes('up')) {
        currentSection = 'warmup';
      } else if (lowerLine.includes('main') || lowerLine.includes('workout') || lowerLine.includes('exercise')) {
        currentSection = 'mainWorkout';
      } else if (lowerLine.includes('cool') && lowerLine.includes('down')) {
        currentSection = 'cooldown';
      } else if (lowerLine.includes('tip') || lowerLine.includes('note') || lowerLine.includes('remember')) {
        currentSection = 'tips';
      } else if (lowerLine.includes('disclaimer') || lowerLine.includes('liability') || lowerLine.includes('caution')) {
        currentSection = 'disclaimer';
      } else {
        sections[currentSection as keyof ParsedPlan] += line + '\n';
      }
    });

    return sections;
  };

  // Extract exercise names from text and make them clickable
  const renderWithExerciseLinks = (text: string) => {
    let content = text;
    
    exercises.forEach(exercise => {
      const regex = new RegExp(`\\b${exercise.name}\\b`, 'gi');
      content = content.replace(
        regex,
        `<span class="exercise-link" data-video-id="${exercise.video_id}">${exercise.name}</span>`
      );
    });
    
    return content;
  };

  const parsedPlan = parsePlanContent();

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

  const handleWorkTimeChange = (value: number) => {
    setWorkTime(value);
    if (!isRunning && isWorking) {
      setTimeLeft(value);
    }
  };

  const handleRestTimeChange = (value: number) => {
    setRestTime(value);
    if (!isRunning && !isWorking) {
      setTimeLeft(value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <style>{`
        .exercise-link {
          color: hsl(var(--primary));
          font-weight: 600;
          text-decoration: underline;
          cursor: pointer;
          transition: all 0.2s;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .exercise-link:hover {
          background: hsl(var(--primary) / 0.1);
          text-decoration: none;
        }
      `}</style>

      {/* Video Player & Timer Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Video Player */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Exercise Demonstration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
              {currentVideoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentVideoId}`}
                  title="Exercise demonstration"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                  <Play className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-medium">Click on any exercise name below</p>
                  <p className="text-sm mt-2">to view video demonstration</p>
                </div>
              )}
            </div>

            {/* Workout Timer */}
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="text-sm">
                  Round {currentRound} of {rounds}
                </Badge>
                <div className="text-7xl font-bold tracking-tight tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <Badge 
                  variant={isComplete ? "default" : isWorking ? "default" : "secondary"}
                  className="text-lg px-4 py-1"
                >
                  {isComplete ? '✓ Complete!' : isWorking ? 'WORK' : 'REST'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="work-time" className="text-xs font-semibold">Work (sec)</Label>
                  <Input
                    id="work-time"
                    type="number"
                    value={workTime}
                    onChange={(e) => handleWorkTimeChange(parseInt(e.target.value) || 45)}
                    disabled={isRunning}
                    className="h-10 text-center font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="rest-time" className="text-xs font-semibold">Rest (sec)</Label>
                  <Input
                    id="rest-time"
                    type="number"
                    value={restTime}
                    onChange={(e) => handleRestTimeChange(parseInt(e.target.value) || 15)}
                    disabled={isRunning}
                    className="h-10 text-center font-semibold"
                  />
                </div>
                <div>
                  <Label htmlFor="rounds" className="text-xs font-semibold">Rounds</Label>
                  <Input
                    id="rounds"
                    type="number"
                    value={rounds}
                    onChange={(e) => setRounds(parseInt(e.target.value) || 3)}
                    disabled={isRunning}
                    className="h-10 text-center font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStartPause}
                  className="flex-1"
                  size="lg"
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
                      Start Timer
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Volume2 className="w-4 h-4" />
                <span>Sound alerts enabled</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Workout Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div 
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.overview) }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Warm-up Section */}
      {parsedPlan.warmup && (
        <Card>
          <CardHeader className="bg-orange-50 dark:bg-orange-950/20">
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Dumbbell className="w-5 h-5" />
              Warm-Up
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.warmup) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Workout Section */}
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Main Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.mainWorkout || planContent) }}
          />
        </CardContent>
      </Card>

      {/* Cool-down Section */}
      {parsedPlan.cooldown && (
        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Dumbbell className="w-5 h-5" />
              Cool-Down
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.cooldown) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      {parsedPlan.tips && (
        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Lightbulb className="w-5 h-5" />
              Tips & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.tips) }}
            />
          </CardContent>
        </Card>
      )}

      {/* Disclaimer Section */}
      {parsedPlan.disclaimer && (
        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-5 h-5" />
              Important Notice
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: renderWithExerciseLinks(parsedPlan.disclaimer) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};