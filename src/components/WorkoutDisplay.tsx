import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Star, AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import workoutHero from "@/assets/workout-hero.jpg";
import logo from "@/assets/smarty-gym-logo.png";

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
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1.5);
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
      {/* Workout Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm">
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

        {/* Hero Banner Image */}
        <div className="relative w-full h-[300px] lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={workoutHero}
            alt="Workout inspiration"
            className="w-full h-full object-cover brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>

      {/* Utility Cards - Three Equal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Videos */}
        {exercises.length > 0 && (
          <Card className="border-2 border-primary/30 h-fit">
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-center text-primary">Workout Videos</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
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
        <Card className="border-2 border-primary/30 h-fit">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-center text-primary">Workout Timer</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Work</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                    disabled={isRunning}
                    className="h-9 text-center"
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
                    className="h-9 text-center"
                  />
                  <span className="text-xs">s</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Rounds</Label>
              <Input
                type="number"
                value={rounds}
                onChange={(e) => setRounds(parseInt(e.target.value) || 8)}
                disabled={isRunning}
                className="h-9 text-center"
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <Label className="text-xs font-semibold">Volume:</Label>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => setVolume(Math.max(0, volume - 0.1))}
              >
                -
              </Button>
              <span className="text-sm font-medium min-w-[2rem] text-center">{volume.toFixed(1)}</span>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 w-7 p-0"
                onClick={() => setVolume(Math.min(1, volume + 0.1))}
              >
                +
              </Button>
            </div>

            <div className="text-center py-4 bg-muted rounded-lg">
              <div className="text-5xl font-bold text-primary mb-1">
                {timeLeft}s
              </div>
              <div className="text-xl font-bold mb-1">
                {isRunning 
                  ? (isWorking ? 'Work' : 'Rest')
                  : 'Ready'
                }
              </div>
              <div className="text-sm font-semibold text-primary">
                Rounds: {currentRound} / {totalRounds}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartStop}
                className="flex-1"
                size="lg"
              >
                {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 1RM Calculator */}
        <Card className="border-2 border-primary/30 h-fit">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-center text-primary">1RM Calculator</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <Label className="text-xs font-semibold">Weight</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 100)}
                  className="h-9 text-center"
                />
                <span className="text-xs font-medium">kg</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Reps</Label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 8)}
                className="h-9 text-center"
              />
            </div>

            <Button 
              onClick={calculate1RM}
              className="w-full"
              size="lg"
            >
              Calculate 1RM
            </Button>

            {oneRM && (
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Your 1RM</div>
                <div className="text-3xl font-bold text-primary">{oneRM} kg</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Content */}
      <div className="space-y-6 mt-8">
        {/* Program Description */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              📋 Program Description
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{planContent}</p>
          </CardContent>
        </Card>

        {/* Execution Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              💡 Execution Tips & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-3 text-base">
              <p className="font-semibold text-primary">What to Focus On:</p>
              <ul className="space-y-2 ml-4">
                <li>Maintain proper form throughout each exercise - quality over quantity</li>
                <li>Control your breathing: exhale during exertion, inhale during the easier phase</li>
                <li>Warm up for 5-10 minutes before starting this workout</li>
                <li>Stay hydrated - drink water before, during, and after your session</li>
              </ul>
              
              <p className="font-semibold text-primary mt-4">What to Avoid:</p>
              <ul className="space-y-2 ml-4">
                <li>Don't rush through movements - maintain controlled tempo</li>
                <li>Avoid exercising if you're feeling unwell or experiencing pain</li>
                <li>Don't skip rest days - recovery is essential for progress</li>
                <li>Never exercise immediately after eating a large meal</li>
              </ul>

              <p className="font-semibold text-primary mt-4">Important Considerations:</p>
              <ul className="space-y-2 ml-4">
                <li>Listen to your body and adjust intensity as needed</li>
                <li>If you feel sharp pain (not muscle fatigue), stop immediately</li>
                <li>Progress gradually - don't increase intensity too quickly</li>
                <li>Cool down and stretch after completing the workout</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="space-y-4">
            <div className="font-bold text-lg">⚠️ DISCLAIMER & RELEASE OF LIABILITY</div>
            
            <div className="space-y-3 text-sm">
              <p className="font-semibold">
                This workout program is provided for informational purposes only and is NOT medical advice.
              </p>
              
              <p>
                <strong>IMPORTANT:</strong> Before starting this or any exercise program, you MUST complete the 
                PAR-Q+ (Physical Activity Readiness Questionnaire) to ensure it is safe for you to exercise.
              </p>

              <div className="bg-background/50 p-4 rounded-lg border border-destructive/30">
                <div className="flex items-center gap-3 mb-3">
                  <img src={logo} alt="Smarty Gym" className="h-10 w-10 object-contain" />
                  <p className="font-semibold">Complete your PAR-Q+ Assessment:</p>
                </div>
                <a 
                  href="https://eparmedx.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Open PAR-Q+ Questionnaire
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">By using this workout program, you acknowledge that:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>You are participating in physical exercise at your own risk</li>
                  <li>You have consulted with a healthcare provider if you have any medical conditions</li>
                  <li>You have completed the PAR-Q+ or similar pre-exercise screening</li>
                  <li>If the PAR-Q+ indicates you should consult a physician, you have done so before starting</li>
                  <li>You will stop exercising immediately if you experience any pain, dizziness, or discomfort</li>
                  <li>Smarty Gym and its affiliates are not liable for any injuries or health issues that may occur</li>
                </ul>
              </div>

              <p className="font-bold text-base">
                If you have not completed the PAR-Q+ assessment or if you answered "YES" to any questions 
                without medical clearance, DO NOT proceed with this workout. Seek professional medical 
                advice first.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};