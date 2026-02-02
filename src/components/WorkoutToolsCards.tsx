import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Save, Search, Dumbbell, Target, Activity, Timer, Calculator, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useExerciseLibrary, useExerciseDetails, Exercise } from "@/hooks/useExerciseLibrary";
import ExerciseDetailModal from "@/components/ExerciseDetailModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXERCISES = [
  "Bench Press",
  "Back Squats",
  "Deadlifts",
  "Bulgarian Split Squats, Right Leg",
  "Bulgarian Split Squats, Left Leg",
  "Shoulder Press, Right Arm",
  "Shoulder Press, Left Arm",
  "Military Presses",
  "Single Leg RDL, Right Leg",
  "Single Leg RDL, Left Leg",
  "Barbell Bicep Curls",
  "Concentrated Bicep Curls, Right Arm",
  "Concentrated Bicep Curls, Left Arm",
] as const;

// Capitalize first letter of each word
const formatLabel = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const WorkoutToolsCards = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <TimerCard />
      <OneRMCard />
      <ExerciseLibraryCard />
    </div>
  );
};

// ============ TIMER CARD ============
const TimerCard = () => {
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
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-2 bg-primary/5">
        <CardTitle className="text-center text-primary flex items-center justify-center gap-2 text-base">
          <Timer className="h-4 w-4" />
          Workout Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            <Label className="text-xs font-semibold">Work</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value) || 20)}
                disabled={isRunning}
                className="h-7 text-center text-sm border-2 border-primary/40"
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
                className="h-7 text-center text-sm border-2 border-primary/40"
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
              className="h-7 text-center text-sm border-2 border-primary/40"
            />
          </div>
        </div>

        <div className="text-center py-2 bg-muted rounded-lg mb-2">
          <div className={`text-3xl font-bold mb-1 ${isWorking ? 'text-primary' : 'text-orange-500'}`}>
            {timeLeft}s
          </div>
          <div className="text-xs font-semibold">
            {isRunning ? (isWorking ? '💪 Work' : '😮‍💨 Rest') : 'Ready'} • Round {currentRound}/{rounds}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleStartStop}
            className="flex-1 h-8 text-sm"
            variant={isRunning ? "destructive" : "default"}
          >
            {isRunning ? <><Pause className="w-3 h-3 mr-1" /> Pause</> : <><Play className="w-3 h-3 mr-1" /> Start</>}
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-8 px-3">
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============ 1RM CALCULATOR CARD ============
const OneRMCard = () => {
  const { toast } = useToast();
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const calculateOneRM = () => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    
    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      return;
    }
    
    const oneRM = w * (36 / (37 - r));
    setResult(Math.round(oneRM * 10) / 10);
  };

  const saveToHistory = async () => {
    if (!user || !result) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("onerm_history").insert({
        user_id: user.id,
        weight_lifted: parseFloat(weight),
        reps: parseInt(reps),
        one_rm_result: result,
        exercise_name: exerciseName || null,
      });

      if (error) throw error;

      toast({
        title: "Saved!",
        description: "Calculation saved to your history",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPercentages = () => {
    if (!result) return [];
    return [
      { percent: 85, weight: Math.round(result * 0.85 * 10) / 10 },
      { percent: 75, weight: Math.round(result * 0.75 * 10) / 10 },
      { percent: 65, weight: Math.round(result * 0.65 * 10) / 10 },
    ];
  };

  return (
    <Card className="border-2 border-primary/30">
      <CardHeader className="pb-2 bg-primary/5">
        <CardTitle className="text-center text-primary flex items-center justify-center gap-2 text-base">
          <Calculator className="h-4 w-4" />
          1RM Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2">
          <Select value={exerciseName} onValueChange={setExerciseName}>
            <SelectTrigger className="h-7 text-sm">
              <SelectValue placeholder="Select exercise..." />
            </SelectTrigger>
            <SelectContent>
              {EXERCISES.map((exercise) => (
                <SelectItem key={exercise} value={exercise}>
                  {exercise}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold">Weight (kg)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                step="0.5"
                className="h-7 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Reps</Label>
              <Input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="8"
                max="12"
                min="1"
                className="h-7 text-sm"
              />
            </div>
          </div>

          <Button onClick={calculateOneRM} className="w-full h-8 text-sm">
            Calculate
          </Button>

          {result && (
            <div className="space-y-2 pt-1">
              <div className="bg-primary/10 p-2 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Your 1RM</p>
                <p className="text-2xl font-bold text-primary">{result} kg</p>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {getPercentages().map((item) => (
                  <div key={item.percent} className="bg-muted p-1.5 rounded text-center">
                    <p className="text-xs text-muted-foreground">{item.percent}%</p>
                    <p className="text-sm font-semibold">{item.weight}</p>
                  </div>
                ))}
              </div>

              {user && (
                <Button onClick={saveToHistory} disabled={saving} className="w-full h-7 text-xs" variant="outline">
                  <Save className="mr-1 h-3 w-3" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// ============ EXERCISE LIBRARY CARD ============
const ExerciseLibraryCard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  const { exercises, isLoading, searchExercises } = useExerciseLibrary();
  const { data: selectedExercise } = useExerciseDetails(selectedExerciseId);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return exercises.slice(0, 8);
    }
    return searchExercises(debouncedQuery, 8);
  }, [debouncedQuery, exercises, searchExercises]);

  const handleExerciseClick = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setDetailModalOpen(true);
  };

  return (
    <>
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle className="text-center text-primary flex items-center justify-center gap-2 text-base">
            <Dumbbell className="h-4 w-4" />
            Exercise Library
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-7 text-sm"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  {searchResults.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => handleExerciseClick(exercise.id)}
                      className="p-2 rounded border border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <p className="font-medium text-xs truncate">{exercise.name}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1">
                          {formatLabel(exercise.target)}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                          {formatLabel(exercise.equipment)}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {searchResults.length === 0 && debouncedQuery.length >= 2 && (
                    <div className="text-center py-4 text-muted-foreground text-xs">
                      No exercises found
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <ExerciseDetailModal
        exercise={selectedExercise as Exercise | null}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </>
  );
};
