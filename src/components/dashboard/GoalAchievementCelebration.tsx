import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, PartyPopper, Star, Target } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

interface AchievedGoal {
  type: "weight" | "body_fat" | "muscle_mass" | "workouts_completed" | "programs_completed";
  target: number;
  current: number;
}

interface GoalAchievementCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  achievedGoals: AchievedGoal[];
}

const GOAL_LABELS: Record<string, string> = {
  weight: "Target Weight",
  body_fat: "Body Fat Goal",
  muscle_mass: "Muscle Mass Goal",
  workouts_completed: "Workouts Completed Goal",
  programs_completed: "Programs Completed Goal",
};

const GOAL_UNITS: Record<string, string> = {
  weight: "kg",
  body_fat: "%",
  muscle_mass: "kg",
  workouts_completed: " workouts",
  programs_completed: " programs",
};

const INTEGER_GOALS = ["workouts_completed", "programs_completed"];

export const GoalAchievementCelebration = ({ 
  isOpen, 
  onClose, 
  achievedGoals 
}: GoalAchievementCelebrationProps) => {
  const navigate = useNavigate();

  if (achievedGoals.length === 0) return null;

  const handleSetNewGoals = () => {
    onClose();
    navigate("/calculator-history?tab=measurements");
  };

  return (
    <>
      <Confetti active={isOpen} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center border-primary/50 bg-gradient-to-br from-background to-primary/5">
          <div className="py-6 space-y-6">
            {/* Trophy Icon with Animation */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg">
                <Trophy className="h-12 w-12 text-white" />
              </div>
              <PartyPopper className="absolute -top-2 -right-2 h-8 w-8 text-primary animate-bounce" />
              <Star className="absolute -bottom-1 -left-2 h-6 w-6 text-yellow-500 animate-pulse" />
            </div>

            {/* Celebration Text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">
                🎉 Goal Achieved!
              </h2>
              <p className="text-muted-foreground">
                Congratulations! You've reached {achievedGoals.length > 1 ? 'your goals' : 'your goal'}!
              </p>
            </div>

            {/* Achieved Goals List */}
            <div className="space-y-3">
              {achievedGoals.map((goal, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20"
                >
                  <span className="font-medium">{GOAL_LABELS[goal.type]}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">
                      {INTEGER_GOALS.includes(goal.type) ? goal.current.toFixed(0) : goal.current.toFixed(1)}{GOAL_UNITS[goal.type]}
                    </span>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>

            {/* Motivational Message */}
            <p className="text-sm text-muted-foreground italic">
              Ready for your next challenge? Set new goals to keep pushing forward!
            </p>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleSetNewGoals} className="w-full gap-2">
                <Target className="h-4 w-4" />
                Set New Goals
              </Button>
              <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
