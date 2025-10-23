import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Star } from "lucide-react";
import workoutHero from "@/assets/workout-hero.jpg";
import { ParQQuestionnaire } from "@/components/ParQQuestionnaire";

interface Exercise {
  name: string;
  video_id: string;
  video_url: string;
  sets?: number;
  reps?: string;
  rest?: string;
  notes?: string;
}

interface WeekPlan {
  week: number;
  focus: string;
  days: Array<{
    day: string;
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      intensity: string;
      rest: string;
      notes?: string;
    }>;
  }>;
}

interface WorkoutDisplayProps {
  exercises: Exercise[];
  planContent: string;
  title?: string;
  serial?: string;
  focus?: string;
  difficulty?: number;
  workoutType?: string;
  workoutDetails?: {
    exercises: Array<{
      name: string;
      sets: string;
      reps: string;
      rest: string;
      notes?: string;
    }>;
  };
  programWeeks?: WeekPlan[];
  imageUrl?: string;
  duration?: string;
  equipment?: string;
  description?: string;
  format?: string;
  instructions?: string;
  tips?: string;
}

export const WorkoutDisplay = ({ 
  exercises, 
  planContent, 
  title = "Workout", 
  serial = "001",
  focus,
  difficulty = 3,
  workoutType,
  workoutDetails, 
  programWeeks, 
  imageUrl, 
  duration, 
  equipment,
  description,
  format,
  instructions,
  tips
}: WorkoutDisplayProps) => {
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
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentRound(0);
    setIsWorking(true);
    setTimeLeft(workTime);
  };

  const calculate1RM = () => {
    // Brzycki formula: 1RM = weight × (36 / (37 - reps))
    const calculated = weight * (36 / (37 - reps));
    setOneRM(Math.round(calculated * 10) / 10);
  };

  const getDifficultyText = (diff: number) => {
    if (diff <= 2) return 'Beginner';
    if (diff <= 4) return 'Intermediate';
    return 'Advanced';
  };

  return (
    <div className="space-y-6">
      {/* Workout Header */}
      <div className="space-y-6">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-6">{title}</h1>

        {/* Info Bar: Serial, Focus, Difficulty with Stars, Type, Duration, Equipment - ABOVE IMAGE */}
        <div className="flex flex-wrap items-center gap-6 text-sm mb-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Serial:</span>
            <span className="font-mono">{serial}</span>
          </div>
          {focus && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Focus:</span>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium">{focus}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Difficulty:</span>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= difficulty ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-medium">{getDifficultyText(difficulty)}</span>
            </div>
          </div>
          {workoutType && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Type:</span>
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-medium uppercase text-xs tracking-wide">{workoutType}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Duration:</span>
              <span>{duration}</span>
            </div>
          )}
          {equipment && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Equipment:</span>
              <span>{equipment}</span>
            </div>
          )}
        </div>

        {/* Hero Banner Image */}
        <div className="relative w-full h-[300px] lg:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
          <img
            src={imageUrl || workoutHero}
            alt={title}
            className="w-full h-full object-cover brightness-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      </div>

      {/* Utility Cards - Two Equal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Timer */}
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-center text-primary">Workout Timer</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
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

            <div className="text-center py-3 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary mb-1">
                {timeLeft}s
              </div>
              <div className="text-sm font-semibold">
                {isRunning ? (isWorking ? 'Work' : 'Rest') : 'Ready'} • Round {currentRound}/{rounds}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleStartStop}
                className="flex-1 h-10"
              >
                {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
              </Button>
              <Button onClick={handleReset} variant="outline" className="h-10 px-4">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 1RM Calculator */}
        <Card className="border-2 border-primary/30">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-center text-primary">1RM Calculator</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label className="text-xs font-semibold">Weight</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value) || 100)}
                  className="h-9 text-center border-2 border-primary/40"
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
                className="h-9 text-center border-2 border-primary/40"
              />
            </div>

            <Button 
              onClick={calculate1RM}
              className="w-full h-10"
            >
              Calculate 1RM
            </Button>

            {oneRM ? (
              <div className="text-center py-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Your 1RM</div>
                <div className="text-3xl font-bold text-primary">{oneRM} kg</div>
              </div>
            ) : (
              <div className="text-center py-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Enter values to calculate</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Workout Content */}
      <div className="space-y-6 mt-8">
        {/* Description Card */}
        {description && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                🔍 Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{description}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Format Card */}
        {format && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                🏋️‍♂️ Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{format}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        {instructions && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                📋 Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{instructions}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Card */}
        {tips && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                ⚠️ Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-l-4 border-primary pl-4 py-2">
                <p className="text-base leading-relaxed whitespace-pre-wrap">{tips}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workout Plan Card */}
        {workoutDetails && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                💪 Workout Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workoutDetails.exercises.map((exercise, index) => (
                <div key={index} className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-bold text-lg mb-2">{exercise.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-semibold text-primary">Sets:</span> {exercise.sets}
                    </div>
                    <div>
                      <span className="font-semibold text-primary">Reps:</span> {exercise.reps}
                    </div>
                    <div>
                      <span className="font-semibold text-primary">Rest:</span> {exercise.rest}
                    </div>
                  </div>
                  {exercise.notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      💡 {exercise.notes}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Week-by-Week Training Program Plan */}
        {programWeeks && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl">
                📅 Week-by-Week Training Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="border-2 border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-xl">Week {week.week}</h3>
                      <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {week.focus}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {week.days.map((day, dayIndex) => (
                        <div key={dayIndex} className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-bold text-lg mb-3 text-primary">{day.day}</h4>
                          <div className="space-y-3">
                            {day.exercises.map((exercise, exIndex) => (
                              <div key={exIndex} className="border-l-2 border-primary/50 pl-3">
                                <p className="font-semibold mb-1">{exercise.name}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                                  <span><strong>Sets:</strong> {exercise.sets}</span>
                                  <span><strong>Reps:</strong> {exercise.reps}</span>
                                  <span><strong>Intensity:</strong> {exercise.intensity}</span>
                                  <span><strong>Rest:</strong> {exercise.rest}</span>
                                </div>
                                {exercise.notes && (
                                  <p className="text-xs text-muted-foreground mt-1 italic">
                                    💡 {exercise.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* PAR-Q+ Questionnaire */}
        <ParQQuestionnaire />
      </div>
    </div>
  );
};