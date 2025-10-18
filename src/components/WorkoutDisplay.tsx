import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Volume2, Star } from "lucide-react";

interface WorkoutDisplayProps {
  exercises: Array<{ name: string; video_id: string; video_url: string }>;
  planContent: string;
  title?: string;
}

export const WorkoutDisplay = ({ exercises, planContent, title = "Workout" }: WorkoutDisplayProps) => {
  const [currentVideoId, setCurrentVideoId] = useState<string>(exercises[0]?.video_id || "");
  const [workTime, setWorkTime] = useState(20);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(8);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isWorking, setIsWorking] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [weight, setWeight] = useState(100);
  const [reps, setReps] = useState(8);
  const [oneRM, setOneRM] = useState<number | null>(null);

  // Play beep sound
  const playBeep = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Timer logic
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
              setTotalRounds((t) => t + 1);
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
  }, [isRunning, isWorking, currentRound, rounds, workTime, restTime, volume]);

  const handleStartStop = () => {
    if (!isRunning && currentRound === 0) {
      setCurrentRound(1);
      setTotalRounds(1);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(0);
    setTotalRounds(0);
    setIsWorking(true);
    setTimeLeft(workTime);
  };

  const calculate1RM = () => {
    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    const calculated = weight * (36 / (37 - reps));
    setOneRM(Math.round(calculated * 10) / 10);
  };

  return (
    <div className="space-y-6">
      {/* Top Row: Three Utility Cards */}
      <div className={`grid grid-cols-1 gap-4 ${exercises.length > 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {/* Workout Videos - Only show if exercises available */}
        {exercises.length > 0 && (
          <Card className="border-2 border-yellow-500/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-center text-yellow-600 dark:text-yellow-500">Workout Videos</CardTitle>
            </CardHeader>
            <CardContent>
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
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Play className="w-12 h-12 opacity-50" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Timer */}
        <Card className="border-2 border-yellow-500/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-yellow-600 dark:text-yellow-500">Workout Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Work</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                    disabled={isRunning}
                    className="h-8 text-center"
                  />
                  <span className="text-xs">s</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Rest</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={restTime}
                    onChange={(e) => setRestTime(parseInt(e.target.value) || 10)}
                    disabled={isRunning}
                    className="h-8 text-center"
                  />
                  <span className="text-xs">s</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs">Rounds</Label>
              <Input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                disabled={isRunning}
                className="h-8 text-center"
              />
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs">Volume:</Label>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => setVolume(Math.max(0, volume - 0.1))}
              >
                -
              </Button>
              <span className="text-sm">{volume.toFixed(1)}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 w-6 p-0"
                onClick={() => setVolume(Math.min(1, volume + 0.1))}
              >
                +
              </Button>
            </div>

            <div className="text-center py-2">
              <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">
                {timeLeft}s
              </div>
              <div className="text-lg font-bold">
                {isRunning 
                  ? (isWorking ? 'Work' : 'Rest')
                  : 'Ready'
                }
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-500">
                Rounds: {currentRound} / {totalRounds}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartStop}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                {isRunning ? <><Pause className="w-4 h-4 mr-1" /> Stop</> : <><Play className="w-4 h-4 mr-1" /> Start</>}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 1RM Calculator */}
        <Card className="border-2 border-yellow-500/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-yellow-600 dark:text-yellow-500">1RM Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Weight</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 100)}
                  className="h-8 text-center"
                />
                <span className="text-xs">kg</span>
              </div>
            </div>

            <div>
              <Label className="text-xs">Reps</Label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 8)}
                className="h-8 text-center"
              />
            </div>

            <Button 
              onClick={calculate1RM}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              Calculate 1RM
            </Button>

            {oneRM && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Your 1RM</div>
                <div className="text-2xl font-bold">{oneRM} kg</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Serial:</span>
                <span>001</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Difficulty:</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`w-4 h-4 ${i <= 3 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Description
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none whitespace-pre-wrap">
              {planContent}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📋 Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p>Follow the workout plan as described. Adjust intensity based on your fitness level.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚠️ Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul>
                <li>Stay hydrated throughout your workout</li>
                <li>Focus on proper form over speed</li>
                <li>Listen to your body and rest when needed</li>
                <li>Warm up before starting and cool down after</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438"
              alt="Workout"
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
