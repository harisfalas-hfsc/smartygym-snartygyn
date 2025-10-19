import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const OneRMCalculator = () => {
  const navigate = useNavigate();
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
    
    // Using Brzycki formula: 1RM = weight × (36 / (37 - reps))
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
      { percent: 95, weight: Math.round(result * 0.95 * 10) / 10 },
      { percent: 90, weight: Math.round(result * 0.90 * 10) / 10 },
      { percent: 85, weight: Math.round(result * 0.85 * 10) / 10 },
      { percent: 80, weight: Math.round(result * 0.80 * 10) / 10 },
      { percent: 75, weight: Math.round(result * 0.75 * 10) / 10 },
      { percent: 70, weight: Math.round(result * 0.70 * 10) / 10 },
      { percent: 65, weight: Math.round(result * 0.65 * 10) / 10 },
      { percent: 60, weight: Math.round(result * 0.60 * 10) / 10 },
    ];
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Button>
        
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Smart Tools — Free to Use</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">1RM Calculator</h1>
        </div>
        
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exerciseName">Exercise Name (Optional)</Label>
                <Input
                  id="exerciseName"
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="e.g., Bench Press, Squat"
                />
              </div>

              <div>
                <Label htmlFor="weight">Weight Lifted (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  step="0.5"
                />
              </div>
              
              <div>
                <Label htmlFor="reps">Number of Repetitions</Label>
                <Input
                  id="reps"
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="Enter reps (1-12)"
                  max="12"
                  min="1"
                />
              </div>

              <Button onClick={calculateOneRM} className="w-full">
                Calculate 1RM
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-4 border-t">
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h2 className="text-lg font-semibold mb-2">Your Estimated 1RM</h2>
                  <p className="text-4xl font-bold text-primary">{result} kg</p>
                </div>

                {user && (
                  <Button onClick={saveToHistory} disabled={saving} className="w-full" variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save to History"}
                  </Button>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">Training Percentages</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {getPercentages().map((item) => (
                      <div key={item.percent} className="bg-muted p-3 rounded-lg">
                        <p className="text-sm text-muted-foreground">{item.percent}%</p>
                        <p className="text-lg font-semibold">{item.weight} kg</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This is an estimate using the Brzycki formula. 
                    Actual 1RM may vary. Always use proper form and have a spotter when testing maximum lifts.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OneRMCalculator;
