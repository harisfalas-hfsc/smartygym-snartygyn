import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const MacroTrackingCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    water: number;
    meals: number;
  } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const calculateMacros = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    
    if (isNaN(w) || isNaN(h) || isNaN(a) || !gender || !activityLevel || !goal) {
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
    
    // Adjust calories based on goal
    let targetCalories: number;
    if (goal === "lose") {
      targetCalories = tdee - 500; // 500 cal deficit
    } else if (goal === "gain") {
      targetCalories = tdee + 500; // 500 cal surplus
    } else {
      targetCalories = tdee;
    }
    
    // Calculate macros based on goal
    let protein = 0, carbs = 0, fats = 0;
    
    if (goal === "lose") {
      // High protein, moderate carbs, low fat
      protein = Math.round((targetCalories * 0.35) / 4);
      carbs = Math.round((targetCalories * 0.35) / 4);
      fats = Math.round((targetCalories * 0.30) / 9);
    } else if (goal === "gain") {
      // High protein, high carbs, moderate fat
      protein = Math.round((targetCalories * 0.30) / 4);
      carbs = Math.round((targetCalories * 0.45) / 4);
      fats = Math.round((targetCalories * 0.25) / 9);
    } else {
      // Balanced maintenance
      protein = Math.round((targetCalories * 0.30) / 4);
      carbs = Math.round((targetCalories * 0.40) / 4);
      fats = Math.round((targetCalories * 0.30) / 9);
    }
    
    // Calculate fiber recommendation (14g per 1000 calories)
    const fiber = Math.round((targetCalories / 1000) * 14);
    
    // Calculate water intake (35ml per kg of body weight)
    const water = Math.round((w * 35) / 1000 * 10) / 10; // in liters, rounded to 1 decimal
    
    // Recommend number of meals based on calories
    let meals = 3; // default
    if (targetCalories > 3000) {
      meals = 6;
    } else if (targetCalories > 2500) {
      meals = 5;
    } else if (targetCalories > 2000) {
      meals = 4;
    }
    
    setResult({
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats,
      fiber,
      water,
      meals,
    });
  };

  const saveToHistory = async () => {
    if (!user || !result) return;

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
        maintenance_calories: result.calories,
        target_calories: result.calories,
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

  return (
    <>
      <Helmet>
        <title>Macro Calculator - Smarty Gym | Free Macro Tracking Calculator | smartygym.com</title>
        <meta name="description" content="Free Macro Tracking Calculator. Get personalized protein, carbs, and fat recommendations based on your goals. Science-based nutrition tool by Haris Falas, Cyprus Sports Scientist." />
        <meta name="keywords" content="macro calculator, macronutrient calculator, protein calculator, nutrition calculator Cyprus, calorie tracker, smartygym macro" />
        
        <meta property="og:title" content="Macro Calculator - Smarty Gym" />
        <meta property="og:description" content="Free macronutrient calculator for personalized nutrition recommendations" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/macro-calculator" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Macro Calculator - Smarty Gym" />
        <meta name="twitter:description" content="Free macronutrient calculator for personalized nutrition recommendations" />
        
        <link rel="canonical" href="https://smartygym.com/macro-calculator" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Smart Tools — Free to Use</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Macro Tracking Calculator</h1>
          <p className="text-sm text-muted-foreground">Get personalized nutrition recommendations</p>
        </div>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <Button onClick={calculateMacros} className="w-full" size="lg">
                Calculate My Macros
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-4 border-t">
                {/* Daily Calorie Target */}
                <div className="bg-primary/10 p-6 rounded-lg text-center border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Daily Calorie Target</p>
                  <p className="text-4xl font-bold text-primary">{result.calories}</p>
                  <p className="text-xs text-muted-foreground mt-1">calories per day</p>
                </div>

                {/* Macros Grid */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 text-center">Your Daily Macros</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-card p-3 rounded text-center">
                      <p className="text-2xl font-bold text-primary">{result.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-card p-3 rounded text-center">
                      <p className="text-2xl font-bold text-primary">{result.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-card p-3 rounded text-center">
                      <p className="text-2xl font-bold text-primary">{result.fats}g</p>
                      <p className="text-xs text-muted-foreground">Fats</p>
                    </div>
                  </div>
                </div>

                {/* Additional Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-card p-4 rounded-lg text-center border">
                    <p className="text-xl font-bold text-primary">{result.fiber}g</p>
                    <p className="text-xs text-muted-foreground">Fiber</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg text-center border">
                    <p className="text-xl font-bold text-primary">{result.water}L</p>
                    <p className="text-xs text-muted-foreground">Water</p>
                  </div>
                  <div className="bg-card p-4 rounded-lg text-center border">
                    <p className="text-xl font-bold text-primary">{result.meals}</p>
                    <p className="text-xs text-muted-foreground">Meals/Day</p>
                  </div>
                </div>

                {/* Meal Distribution */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-sm">Recommended Meal Distribution</h4>
                  <p className="text-xs text-muted-foreground">
                    Based on your {result.calories} calorie target, we recommend {result.meals} meals per day. 
                    This helps distribute your intake evenly and maintain energy levels throughout the day.
                  </p>
                </div>

                {user && (
                  <Button onClick={saveToHistory} disabled={saving} className="w-full" variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save to History"}
                  </Button>
                )}

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg">
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
    </>
  );
};

export default MacroTrackingCalculator;
