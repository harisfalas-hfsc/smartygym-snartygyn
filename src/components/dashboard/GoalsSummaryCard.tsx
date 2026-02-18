import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, Scale, TrendingUp, Calendar, ChevronRight, Trophy, Dumbbell, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, format } from "date-fns";

interface MeasurementGoal {
  id: string;
  target_weight: number | null;
  target_body_fat: number | null;
  target_muscle_mass: number | null;
  target_workouts_completed: number | null;
  target_programs_completed: number | null;
  target_date: string | null;
}

interface LatestMeasurement {
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
}

interface GoalsSummaryCardProps {
  userId: string;
}

export const GoalsSummaryCard = ({ userId }: GoalsSummaryCardProps) => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState<MeasurementGoal | null>(null);
  const [latestMeasurement, setLatestMeasurement] = useState<LatestMeasurement | null>(null);
  const [workoutsCompleted, setWorkoutsCompleted] = useState(0);
  const [programsCompleted, setProgramsCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchGoalAndMeasurements();
    }
  }, [userId]);

  const fetchGoalAndMeasurements = async () => {
    try {
      // Fetch goal
      const { data: goalData } = await supabase
        .from("user_measurement_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (goalData) setGoal(goalData);

      // Fetch latest measurement
      const { data: measurementData } = await supabase
        .from("user_activity_log")
        .select("tool_result")
        .eq("user_id", userId)
        .eq("content_type", "measurement")
        .not("tool_result", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (measurementData?.tool_result) {
        const result = measurementData.tool_result as any;
        setLatestMeasurement({
          weight: result.weight,
          body_fat: result.body_fat || result.bodyFat,
          muscle_mass: result.muscle_mass || result.muscleMass,
        });
      }

      // Fetch completed workouts count
      const { count: wCount } = await supabase
        .from("workout_interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_completed", true);
      setWorkoutsCompleted(wCount || 0);

      // Fetch completed programs count
      const { count: pCount } = await supabase
        .from("program_interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_completed", true);
      setProgramsCompleted(pCount || 0);
    } catch (error) {
      // No goal or measurement found
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number | undefined, target: number | null, isDecrease: boolean = false) => {
    if (!current || !target) return null;
    if (isDecrease) {
      const diff = current - target;
      if (diff <= 0) return 100;
      const startingPoint = target + 10;
      const progress = ((startingPoint - current) / (startingPoint - target)) * 100;
      return Math.max(0, Math.min(100, progress));
    } else {
      if (current >= target) return 100;
      const startingPoint = target - 10;
      const progress = ((current - startingPoint) / (target - startingPoint)) * 100;
      return Math.max(0, Math.min(100, progress));
    }
  };

  const getDaysRemaining = () => {
    if (!goal?.target_date) return null;
    const targetDate = new Date(goal.target_date);
    const today = new Date();
    const days = differenceInDays(targetDate, today);
    return days;
  };

  if (loading) return null;

  // Don't show card if no goals set
  if (!goal || (!goal.target_weight && !goal.target_body_fat && !goal.target_muscle_mass && !goal.target_workouts_completed && !goal.target_programs_completed)) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Set Your Fitness Goals</h3>
                <p className="text-sm text-muted-foreground">Track your progress towards your targets</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/calculator-history?tab=measurements")}
              className="border-primary/30"
            >
              Set Goals
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = getDaysRemaining();
  const weightProgress = calculateProgress(latestMeasurement?.weight, goal.target_weight, 
    latestMeasurement?.weight && goal.target_weight ? latestMeasurement.weight > goal.target_weight : false);
  const bodyFatProgress = calculateProgress(latestMeasurement?.body_fat, goal.target_body_fat, true);
  const muscleMassProgress = calculateProgress(latestMeasurement?.muscle_mass, goal.target_muscle_mass, false);

  const workoutsProgress = goal.target_workouts_completed ? Math.min(100, (workoutsCompleted / goal.target_workouts_completed) * 100) : null;
  const programsProgress = goal.target_programs_completed ? Math.min(100, (programsCompleted / goal.target_programs_completed) * 100) : null;

  const activeGoals = [
    goal.target_weight && { label: "Weight", current: latestMeasurement?.weight, target: goal.target_weight, unit: "kg", progress: weightProgress, icon: Scale },
    goal.target_body_fat && { label: "Body Fat", current: latestMeasurement?.body_fat, target: goal.target_body_fat, unit: "%", progress: bodyFatProgress, icon: TrendingUp },
    goal.target_muscle_mass && { label: "Muscle", current: latestMeasurement?.muscle_mass, target: goal.target_muscle_mass, unit: "kg", progress: muscleMassProgress, icon: TrendingUp },
    goal.target_workouts_completed && { label: "Workouts", current: workoutsCompleted, target: goal.target_workouts_completed, unit: "", progress: workoutsProgress, icon: Dumbbell },
    goal.target_programs_completed && { label: "Programs", current: programsCompleted, target: goal.target_programs_completed, unit: "", progress: programsProgress, icon: BookOpen },
  ].filter(Boolean) as { label: string; current: number | undefined; target: number; unit: string; progress: number | null; icon: any }[];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Active Goals
          </CardTitle>
          {daysRemaining !== null && (
            <Badge variant="outline" className={`text-xs ${daysRemaining <= 7 ? 'border-orange-500/50 text-orange-600' : 'border-primary/30'}`}>
              <Calendar className="h-3 w-3 mr-1" />
              {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? "Due today!" : "Overdue"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map((goalItem, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <goalItem.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{goalItem.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {goalItem.current !== undefined ? (
                  <span className="text-muted-foreground">
                    {goalItem.unit ? goalItem.current.toFixed(1) : goalItem.current} → <span className="text-primary font-semibold">{goalItem.target}{goalItem.unit}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Target: {goalItem.target}{goalItem.unit}</span>
                )}
                {goalItem.progress === 100 && (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
            <Progress 
              value={goalItem.progress || 0} 
              className="h-2"
            />
          </div>
        ))}

        <div className="pt-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/calculator-history?tab=measurements")}
            className="text-primary hover:text-primary/80"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
