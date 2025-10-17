import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const CalorieCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<{
    maintain: number;
    lose: number;
    gain: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const calculateCalories = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    if (isNaN(w) || isNaN(h) || isNaN(a) || !gender || !activityLevel) {
      return;
    }
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr: number;
    if (gender === "male") {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }
    
    // Apply activity multiplier
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      very: 1.725,
      extra: 1.9,
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    
    setResult({
      maintain: Math.round(tdee),
      lose: Math.round(tdee - 500), // 500 cal deficit for ~0.5kg/week loss
      gain: Math.round(tdee + 500), // 500 cal surplus for ~0.5kg/week gain
    });
  };

  const saveToHistory = async () => {
    if (!user || !result || !goal) return;

    const targetCalories = goal === "lose" ? result.lose : goal === "gain" ? result.gain : result.maintain;

    setSaving(true);
    try {
      const { error } = await supabase.from("calorie_history").insert({
        user_id: user.id,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        gender,
        activity_level: activityLevel,
        goal,
        maintenance_calories: result.maintain,
        target_calories: targetCalories,
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

  const getMacros = (calories: number) => {
    if (!goal) return null;
    
    let protein = 0, carbs = 0, fats = 0;
    
    if (goal === "lose") {
      // High protein, moderate carbs, low fat
      protein = Math.round((calories * 0.35) / 4);
      carbs = Math.round((calories * 0.35) / 4);
      fats = Math.round((calories * 0.30) / 9);
    } else if (goal === "gain") {
      // High protein, high carbs, moderate fat
      protein = Math.round((calories * 0.30) / 4);
      carbs = Math.round((calories * 0.45) / 4);
      fats = Math.round((calories * 0.25) / 9);
    } else {
      // Balanced
      protein = Math.round((calories * 0.30) / 4);
      carbs = Math.round((calories * 0.40) / 4);
      fats = Math.round((calories * 0.30) / 9);
    }
    
    return { protein, carbs, fats };
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-4xl font-bold text-center mb-8">Calorie Calculator</h1>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>
              
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                  step="0.1"
                />
              </div>

              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter your height"
                />
              </div>

              <div>
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select value={activityLevel} onValueChange={setActivityLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                    <SelectItem value="light">Lightly active (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately active (3-5 days/week)</SelectItem>
                    <SelectItem value="very">Very active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra">Extra active (2x per day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="goal">Goal</Label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose weight</SelectItem>
                    <SelectItem value="maintain">Maintain weight</SelectItem>
                    <SelectItem value="gain">Gain weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={calculateCalories} className="w-full">
                Calculate Calories
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-4 border-t">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Weight Loss</p>
                    <p className="text-2xl font-bold text-red-600">{result.lose}</p>
                    <p className="text-xs text-muted-foreground">cal/day</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Maintenance</p>
                    <p className="text-2xl font-bold text-blue-600">{result.maintain}</p>
                    <p className="text-xs text-muted-foreground">cal/day</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-1">Weight Gain</p>
                    <p className="text-2xl font-bold text-green-600">{result.gain}</p>
                    <p className="text-xs text-muted-foreground">cal/day</p>
                  </div>
                </div>

                {user && (
                  <Button onClick={saveToHistory} disabled={saving || !goal} className="w-full" variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save to History"}
                  </Button>
                )}

                {goal && (() => {
                  const targetCalories = goal === "lose" ? result.lose : goal === "gain" ? result.gain : result.maintain;
                  const macros = getMacros(targetCalories);
                  
                  return macros && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-3">Recommended Macros for Your Goal</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-primary">{macros.protein}g</p>
                          <p className="text-sm text-muted-foreground">Protein</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{macros.carbs}g</p>
                          <p className="text-sm text-muted-foreground">Carbs</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{macros.fats}g</p>
                          <p className="text-sm text-muted-foreground">Fats</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> These are estimates based on standard formulas. Individual needs may vary. 
                    For personalized nutrition advice, consult with a registered dietitian or healthcare provider.
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

export default CalorieCalculator;
