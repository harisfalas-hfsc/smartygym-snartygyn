import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Target, Calendar } from "lucide-react";

interface MeasurementGoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentGoal?: {
    id: string;
    target_weight: number | null;
    target_body_fat: number | null;
    target_muscle_mass: number | null;
    target_workouts_completed: number | null;
    target_programs_completed: number | null;
    target_date: string | null;
    weight_goal_achieved_at: string | null;
    body_fat_goal_achieved_at: string | null;
    muscle_mass_goal_achieved_at: string | null;
    workouts_goal_achieved_at: string | null;
    programs_goal_achieved_at: string | null;
  } | null;
  onSaved: () => void;
}

export const MeasurementGoalDialog = ({
  isOpen,
  onClose,
  userId,
  currentGoal,
  onSaved
}: MeasurementGoalDialogProps) => {
  const [targetWeight, setTargetWeight] = useState("");
  const [targetBodyFat, setTargetBodyFat] = useState("");
  const [targetMuscleMass, setTargetMuscleMass] = useState("");
  const [targetWorkoutsCompleted, setTargetWorkoutsCompleted] = useState("");
  const [targetProgramsCompleted, setTargetProgramsCompleted] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentGoal) {
      setTargetWeight(currentGoal.target_weight?.toString() || "");
      setTargetBodyFat(currentGoal.target_body_fat?.toString() || "");
      setTargetMuscleMass(currentGoal.target_muscle_mass?.toString() || "");
      setTargetWorkoutsCompleted(currentGoal.target_workouts_completed?.toString() || "");
      setTargetProgramsCompleted(currentGoal.target_programs_completed?.toString() || "");
      setTargetDate(currentGoal.target_date || "");
    } else {
      setTargetWeight("");
      setTargetBodyFat("");
      setTargetMuscleMass("");
      setTargetWorkoutsCompleted("");
      setTargetProgramsCompleted("");
      setTargetDate("");
    }
  }, [currentGoal, isOpen]);

  const handleSubmit = async () => {
    if (!targetWeight && !targetBodyFat && !targetMuscleMass && !targetWorkoutsCompleted && !targetProgramsCompleted) {
      toast.error("Please set at least one goal");
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData: any = {
        user_id: userId,
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        target_body_fat: targetBodyFat ? parseFloat(targetBodyFat) : null,
        target_muscle_mass: targetMuscleMass ? parseFloat(targetMuscleMass) : null,
        target_workouts_completed: targetWorkoutsCompleted ? parseInt(targetWorkoutsCompleted) : null,
        target_programs_completed: targetProgramsCompleted ? parseInt(targetProgramsCompleted) : null,
        target_date: targetDate || null
      };

      // Clear achieved_at timestamps when targets change (allow re-celebration)
      if (currentGoal) {
        const newWeight = targetWeight ? parseFloat(targetWeight) : null;
        const newBodyFat = targetBodyFat ? parseFloat(targetBodyFat) : null;
        const newMuscleMass = targetMuscleMass ? parseFloat(targetMuscleMass) : null;
        const newWorkouts = targetWorkoutsCompleted ? parseInt(targetWorkoutsCompleted) : null;
        const newPrograms = targetProgramsCompleted ? parseInt(targetProgramsCompleted) : null;

        if (newWeight !== currentGoal.target_weight) goalData.weight_goal_achieved_at = null;
        if (newBodyFat !== currentGoal.target_body_fat) goalData.body_fat_goal_achieved_at = null;
        if (newMuscleMass !== currentGoal.target_muscle_mass) goalData.muscle_mass_goal_achieved_at = null;
        if (newWorkouts !== currentGoal.target_workouts_completed) goalData.workouts_goal_achieved_at = null;
        if (newPrograms !== currentGoal.target_programs_completed) goalData.programs_goal_achieved_at = null;
      }

      if (currentGoal?.id) {
        const { error } = await supabase
          .from("user_measurement_goals")
          .update(goalData)
          .eq("id", currentGoal.id);

        if (error) throw error;
        toast.success("Goals updated successfully");
      } else {
        const { error } = await supabase
          .from("user_measurement_goals")
          .insert(goalData);

        if (error) throw error;
        toast.success("Goals set successfully");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving goals:", error);
      toast.error("Failed to save goals");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {currentGoal ? "Edit Measurement Goals" : "Set Measurement Goals"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="targetWeight">Target Weight (kg)</Label>
            <Input
              id="targetWeight"
              type="number"
              step="0.1"
              placeholder="e.g., 70"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetBodyFat">Target Body Fat (%)</Label>
            <Input
              id="targetBodyFat"
              type="number"
              step="0.1"
              min="1"
              max="50"
              placeholder="e.g., 15"
              value={targetBodyFat}
              onChange={(e) => setTargetBodyFat(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetMuscleMass">Target Muscle Mass (kg)</Label>
            <Input
              id="targetMuscleMass"
              type="number"
              step="0.1"
              placeholder="e.g., 40"
              value={targetMuscleMass}
              onChange={(e) => setTargetMuscleMass(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetWorkouts">Target Workouts Completed</Label>
            <Input
              id="targetWorkouts"
              type="number"
              min="1"
              placeholder="e.g., 20"
              value={targetWorkoutsCompleted}
              onChange={(e) => setTargetWorkoutsCompleted(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPrograms">Target Programs Completed</Label>
            <Input
              id="targetPrograms"
              type="number"
              min="1"
              placeholder="e.g., 3"
              value={targetProgramsCompleted}
              onChange={(e) => setTargetProgramsCompleted(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Target Date (Optional)
            </Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : currentGoal ? "Update Goals" : "Set Goals"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
