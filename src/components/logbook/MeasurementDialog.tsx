import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { GoalAchievementCelebration } from "@/components/dashboard/GoalAchievementCelebration";

interface MeasurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaved?: () => void;
}

interface MeasurementGoal {
  target_weight: number | null;
  target_body_fat: number | null;
  target_muscle_mass: number | null;
}

interface AchievedGoal {
  type: "weight" | "body_fat" | "muscle_mass";
  target: number;
  current: number;
}

export const MeasurementDialog = ({ isOpen, onClose, userId, onSaved }: MeasurementDialogProps) => {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [achievedGoals, setAchievedGoals] = useState<AchievedGoal[]>([]);
  const [currentGoal, setCurrentGoal] = useState<MeasurementGoal | null>(null);
  const queryClient = useQueryClient();

  // Fetch current goals when dialog opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchCurrentGoal();
    }
  }, [isOpen, userId]);

  const fetchCurrentGoal = async () => {
    const { data } = await supabase
      .from("user_measurement_goals")
      .select("target_weight, target_body_fat, target_muscle_mass")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (data) setCurrentGoal(data);
  };

  const checkGoalAchievement = (
    newWeight: number | null,
    newBodyFat: number | null,
    newMuscleMass: number | null
  ): AchievedGoal[] => {
    if (!currentGoal) return [];
    
    const achieved: AchievedGoal[] = [];

    // Check weight goal (can be increase or decrease)
    if (newWeight && currentGoal.target_weight) {
      // Consider goal achieved if within 0.5kg of target
      if (Math.abs(newWeight - currentGoal.target_weight) <= 0.5) {
        achieved.push({ type: "weight", target: currentGoal.target_weight, current: newWeight });
      }
    }

    // Check body fat goal (typically decrease)
    if (newBodyFat && currentGoal.target_body_fat) {
      // Consider goal achieved if at or below target (with 0.5% tolerance)
      if (newBodyFat <= currentGoal.target_body_fat + 0.5) {
        achieved.push({ type: "body_fat", target: currentGoal.target_body_fat, current: newBodyFat });
      }
    }

    // Check muscle mass goal (typically increase)
    if (newMuscleMass && currentGoal.target_muscle_mass) {
      // Consider goal achieved if at or above target (with 0.5kg tolerance)
      if (newMuscleMass >= currentGoal.target_muscle_mass - 0.5) {
        achieved.push({ type: "muscle_mass", target: currentGoal.target_muscle_mass, current: newMuscleMass });
      }
    }

    return achieved;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one field is filled
    if (!weight && !bodyFat && !muscleMass) {
      toast.error("Please enter at least one measurement");
      return;
    }

    // Validate body fat percentage range
    if (bodyFat && (parseFloat(bodyFat) < 0 || parseFloat(bodyFat) > 100)) {
      toast.error("Body fat percentage must be between 0 and 100");
      return;
    }

    setIsSubmitting(true);

    try {
      const toolResult: any = {};
      const parsedWeight = weight ? parseFloat(weight) : null;
      const parsedBodyFat = bodyFat ? parseFloat(bodyFat) : null;
      const parsedMuscleMass = muscleMass ? parseFloat(muscleMass) : null;

      if (parsedWeight) toolResult.weight = parsedWeight;
      if (parsedBodyFat) toolResult.body_fat = parsedBodyFat;
      if (parsedMuscleMass) toolResult.muscle_mass = parsedMuscleMass;

      const today = new Date();
      const activityDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          content_type: 'measurement',
          item_id: 'body_measurement',
          item_name: 'Body Measurements',
          action_type: 'recorded',
          tool_result: toolResult,
          activity_date: activityDate,
        });

      if (error) throw error;

      // Check for goal achievements
      const achieved = checkGoalAchievement(parsedWeight, parsedBodyFat, parsedMuscleMass);
      
      if (achieved.length > 0) {
        setAchievedGoals(achieved);
        setShowCelebration(true);
        
        // Send notification for goal achievement
        try {
          await supabase.functions.invoke('send-system-message', {
            body: {
              userId,
              messageType: 'announcement_update',
              customData: {
                subject: '🎉 Goal Achieved!',
                content: `Congratulations! You've achieved ${achieved.length > 1 ? 'your fitness goals' : 'your fitness goal'}! ${achieved.map(g => `${g.type === 'weight' ? 'Target Weight' : g.type === 'body_fat' ? 'Body Fat Goal' : 'Muscle Mass Goal'}: ${g.current.toFixed(1)}${g.type === 'body_fat' ? '%' : 'kg'}`).join(', ')}. Keep up the amazing work!`
              }
            }
          });
        } catch (notifyError) {
          console.error('Failed to send goal achievement notification:', notifyError);
        }
      } else {
        toast.success("Measurements recorded successfully");
      }

      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
      
      // Reset form
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      onSaved?.();
      
      // Only close if no celebration
      if (achieved.length === 0) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error("Failed to save measurements");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    setAchievedGoals([]);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Record Body Measurements
            </DialogTitle>
          </DialogHeader>

          <Card className="border-2 border-primary">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Body Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 75.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                  {currentGoal?.target_weight && (
                    <p className="text-xs text-muted-foreground">
                      Target: {currentGoal.target_weight} kg
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    placeholder="e.g., 18.5"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />
                  {currentGoal?.target_body_fat && (
                    <p className="text-xs text-muted-foreground">
                      Target: {currentGoal.target_body_fat}%
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 35.0"
                    value={muscleMass}
                    onChange={(e) => setMuscleMass(e.target.value)}
                  />
                  {currentGoal?.target_muscle_mass && (
                    <p className="text-xs text-muted-foreground">
                      Target: {currentGoal.target_muscle_mass} kg
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  * Enter at least one measurement
                </p>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Measurement"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <GoalAchievementCelebration
        isOpen={showCelebration}
        onClose={handleCelebrationClose}
        achievedGoals={achievedGoals}
      />
    </>
  );
};
