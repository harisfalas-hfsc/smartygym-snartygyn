import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import workoutHero from "@/assets/workout-hero.jpg";
import { ParQQuestionnaire } from "@/components/ParQQuestionnaire";
import { WorkoutInfoBar } from "@/components/WorkoutInfoBar";
import { ShareButtons } from "@/components/ShareButtons";
import { WorkoutInteractions } from "@/components/WorkoutInteractions";
import { ProgramInteractions } from "@/components/ProgramInteractions";
import { useAccessControl } from "@/hooks/useAccessControl";
import { HTMLContent } from "@/components/ui/html-content";
import { ExerciseHTMLContent } from "@/components/ExerciseHTMLContent";
import { A4Container } from "@/components/ui/a4-container";
import { ExerciseLibraryBanner } from "@/components/ExerciseLibraryBanner";

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
  activation?: string;
  warm_up?: string;
  main_workout?: string;
  finisher?: string;
  cool_down?: string;
  programContent?: string;
  overview?: string;
  target_audience?: string;
  program_structure?: string;
  weekly_schedule?: string;
  progression_plan?: string;
  nutrition_tips?: string;
  expected_results?: string;
  workoutId?: string;
  workoutCategory?: string;
  programId?: string;
  programType?: string;
  isFreeContent?: boolean;
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
  tips,
  activation,
  warm_up,
  main_workout,
  finisher,
  cool_down,
  programContent,
  overview,
  target_audience,
  program_structure,
  weekly_schedule,
  progression_plan,
  nutrition_tips,
  expected_results,
  workoutId,
  workoutCategory,
  programId,
  programType,
  isFreeContent = false
}: WorkoutDisplayProps) => {
  const navigate = useNavigate();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
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
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        {/* Description - Below Title */}
        {description && (
          <Card className="border-2 border-primary/30 mb-4">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                🔍 Description
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <HTMLContent 
                content={description} 
                className="prose-base text-foreground/90 leading-relaxed" 
              />
            </CardContent>
          </Card>
        )}
        
        {/* Credit Line */}
        <p className="text-sm text-muted-foreground mb-4">
          Created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — Sports Scientist & Strength and Conditioning Coach
        </p>

        {/* Info Bar */}
        {focus && duration && equipment && difficulty && (
          <WorkoutInfoBar 
            duration={duration}
            equipment={equipment}
            difficulty={getDifficultyText(difficulty)}
            focus={focus}
            category={workoutCategory}
          />
        )}

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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${difficulty > 0 && i <= difficulty ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="font-medium">{difficulty === 0 ? 'All Levels' : getDifficultyText(difficulty)}</span>
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
        
        {/* Share Buttons */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Share this workout:</h3>
          <ShareButtons 
            title={title}
            url={typeof window !== 'undefined' ? window.location.href : 'https://smartygym.com'}
          />
        </div>
      </div>

      {/* Workout Timer - Centered */}
      <div className="flex justify-center">
        <Card className="border-2 border-primary/30 w-full max-w-2xl">
          <CardHeader className="pb-3 bg-primary/5">
            <CardTitle className="text-center text-primary">Workout Timer</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-xs font-semibold">Work</Label>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={workTime}
                    onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                    disabled={isRunning}
                    className="h-8 text-center border-2 border-primary/40"
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
                    className="h-8 text-center border-2 border-primary/40"
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
                  className="h-8 text-center border-2 border-primary/40"
                />
              </div>
            </div>

            <div className="text-center py-2 bg-muted rounded-lg mb-3">
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
                className="flex-1 h-9"
              >
                {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
              </Button>
              <Button onClick={handleReset} variant="outline" className="h-9 px-4">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* CONTENT SECTIONS - Display exactly as written, no automatic headers */}
      <div className="space-y-6 mt-8">
        
        {/* WORKOUT CONTENT - All workout fields displayed without automatic headers */}
        {(activation || warm_up || main_workout || finisher || cool_down) && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                💪 Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="content-container pt-6">
              <A4Container>
                <div className="space-y-6">
                  {activation && (
                    <ExerciseHTMLContent content={activation} className="text-base" enableExerciseLinking />
                  )}
                  {warm_up && (
                    <ExerciseHTMLContent content={warm_up} className="text-base" enableExerciseLinking />
                  )}
                  {main_workout && (
                    <ExerciseHTMLContent content={main_workout} className="text-base" enableExerciseLinking />
                  )}
                  {finisher && (
                    <ExerciseHTMLContent content={finisher} className="text-base" enableExerciseLinking />
                  )}
                  {cool_down && (
                    <ExerciseHTMLContent content={cool_down} className="text-base" enableExerciseLinking />
                  )}
                </div>
              </A4Container>
            </CardContent>
          </Card>
        )}

        {/* TRAINING PROGRAM CONTENT - Display exactly as written */}
        {weekly_schedule && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                📆 Training Program
              </CardTitle>
            </CardHeader>
            <CardContent className="content-container pt-6">
              <A4Container>
                <ExerciseHTMLContent content={weekly_schedule} className="text-base" enableExerciseLinking />
              </A4Container>
            </CardContent>
          </Card>
        )}

        {/* PERSONAL TRAINING PROGRAM CONTENT - Display exactly as written */}
        {programContent && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                📆 Training Program
              </CardTitle>
            </CardHeader>
            <CardContent className="content-container pt-6">
              <A4Container>
                <ExerciseHTMLContent content={programContent} className="text-base" enableExerciseLinking />
              </A4Container>
            </CardContent>
          </Card>
        )}

        {/* INSTRUCTIONS - Display exactly as written */}
        {(instructions || program_structure) && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                📋 Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="content-container pt-6">
              <ExerciseLibraryBanner />
              <A4Container>
                <HTMLContent content={instructions || program_structure || ''} className="text-base" />
              </A4Container>
            </CardContent>
          </Card>
        )}

        {/* TIPS - Display exactly as written */}
        {(tips || nutrition_tips) && (
          <Card className="border-2 border-primary/30">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                💡 Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="content-container pt-6">
              <A4Container>
                <HTMLContent content={tips || nutrition_tips || ''} className="text-base" />
              </A4Container>
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
                      <span className="text-sm font-semibold bg-primary text-primary-foreground px-3 py-1 rounded-full">
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


        {/* Workout/Program Interactions */}
        {workoutId && workoutCategory && (
          <WorkoutInteractions
            workoutId={workoutId}
            workoutType={workoutCategory}
            workoutName={title}
            isFreeContent={isFreeContent}
          />
        )}
        {programId && programType && (
          <ProgramInteractions
            programId={programId}
            programType={programType}
            programName={title}
            isFreeContent={isFreeContent}
          />
        )}

        {/* PAR-Q Questionnaire */}
        <ParQQuestionnaire />
      </div>
      
      {/* Bottom CTA Banner */}
      {!isPremium && (
        <div className="bg-card border border-border rounded-xl p-6 text-center shadow-soft mt-8">
          <h3 className="text-xl font-semibold mb-2">Want more like this?</h3>
          <p className="text-muted-foreground mb-4">
            Unlock 100+ workouts and all programs with SmartyGym Premium.
          </p>
          <Button size="lg" onClick={() => navigate("/premiumbenefits")}>
            Join Premium
          </Button>
        </div>
      )}
    </div>
  );
};