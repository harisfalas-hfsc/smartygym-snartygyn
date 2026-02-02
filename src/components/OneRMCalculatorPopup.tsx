import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
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

interface OneRMCalculatorPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OneRMCalculatorPopup = ({ open, onOpenChange }: OneRMCalculatorPopupProps) => {
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
      { percent: 90, weight: Math.round(result * 0.90 * 10) / 10 },
      { percent: 85, weight: Math.round(result * 0.85 * 10) / 10 },
      { percent: 80, weight: Math.round(result * 0.80 * 10) / 10 },
      { percent: 75, weight: Math.round(result * 0.75 * 10) / 10 },
      { percent: 70, weight: Math.round(result * 0.70 * 10) / 10 },
      { percent: 65, weight: Math.round(result * 0.65 * 10) / 10 },
    ];
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setResult(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-primary">1RM Calculator</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="exerciseName" className="text-sm">Exercise</Label>
            <Select value={exerciseName} onValueChange={setExerciseName}>
              <SelectTrigger className="h-10">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder=""
                step="0.5"
                className="h-10"
              />
            </div>
            <div>
              <Label htmlFor="reps" className="text-sm">Reps (1-12)</Label>
              <Input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder=""
                max="12"
                min="1"
                className="h-10"
              />
            </div>
          </div>

          <Button onClick={calculateOneRM} className="w-full h-11">
            Calculate 1RM
          </Button>

          {result && (
            <div className="space-y-4 pt-2">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">Your Estimated 1RM</p>
                <p className="text-3xl font-bold text-primary">{result} kg</p>
              </div>

              {user && (
                <Button onClick={saveToHistory} disabled={saving} className="w-full" variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save to History"}
                </Button>
              )}

              <div>
                <p className="text-sm font-semibold mb-2">Training Percentages</p>
                <div className="grid grid-cols-3 gap-2">
                  {getPercentages().map((item) => (
                    <div key={item.percent} className="bg-muted p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground">{item.percent}%</p>
                      <p className="text-sm font-semibold">{item.weight} kg</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
