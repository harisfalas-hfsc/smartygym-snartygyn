import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { generateSoftwareApplicationSchema, generateBreadcrumbSchema } from "@/utils/seoHelpers";


const MacroTrackingCalculator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [intensity, setIntensity] = useState("moderate");
  const [result, setResult] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
    water: number;
    meals: number;
    bmr: number;
    tdee: number;
    deficitPercent: number;
    safetyFloorApplied: boolean;
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
    
    // Deficit/surplus percentages based on intensity
    const deficitMap: { [key: string]: number } = {
      conservative: 0.10,
      moderate: 0.20,
      aggressive: 0.30,
    };
    const surplusMap: { [key: string]: number } = {
      conservative: 0.10,
      moderate: 0.15,
      aggressive: 0.20,
    };

    let targetCalories: number;
    let deficitPercent = 0;
    let safetyFloorApplied = false;

    if (goal === "lose") {
      deficitPercent = deficitMap[intensity] || 0.20;
      targetCalories = tdee * (1 - deficitPercent);
      // Safety floors
      const floor = gender === "female" ? 1200 : 1500;
      if (targetCalories < floor) {
        targetCalories = floor;
        safetyFloorApplied = true;
      }
    } else if (goal === "gain") {
      deficitPercent = surplusMap[intensity] || 0.15;
      targetCalories = tdee * (1 + deficitPercent);
    } else {
      targetCalories = tdee;
    }
    
    // Calculate macros based on goal
    let protein = 0, carbs = 0, fats = 0;
    
    if (goal === "lose") {
      protein = Math.round((targetCalories * 0.35) / 4);
      carbs = Math.round((targetCalories * 0.35) / 4);
      fats = Math.round((targetCalories * 0.30) / 9);
    } else if (goal === "gain") {
      protein = Math.round((targetCalories * 0.30) / 4);
      carbs = Math.round((targetCalories * 0.45) / 4);
      fats = Math.round((targetCalories * 0.25) / 9);
    } else {
      protein = Math.round((targetCalories * 0.30) / 4);
      carbs = Math.round((targetCalories * 0.40) / 4);
      fats = Math.round((targetCalories * 0.30) / 9);
    }
    
    const fiber = Math.round((targetCalories / 1000) * 14);
    const water = Math.round((w * 35) / 1000 * 10) / 10;
    
    let meals = 3;
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
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      deficitPercent: Math.round(deficitPercent * 100),
      safetyFloorApplied,
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

      // Log to activity log
      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        content_type: 'tool',
        item_id: 'macro-calculator',
        item_name: 'Macro Calculator',
        action_type: 'calculated',
        tool_input: {
          age: parseInt(age),
          weight: parseFloat(weight),
          height: parseFloat(height),
          gender,
          activityLevel,
          goal
        },
        tool_result: {
          calories: result.calories,
          protein: result.protein,
          carbs: result.carbs,
          fats: result.fats
        },
        activity_date: new Date().toISOString().split('T')[0]
      });

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
    <ProtectedRoute>
      <Helmet>
        <title>Smarty Tools | Macro Calculator | Free Macronutrient Nutrition | Haris Falas | SmartyGym</title>
        <meta name="description" content="Free macro calculator at smartygym.com. Calculate protein carbs fats for weight loss muscle gain. Personalized nutrition by Sports Scientist Haris Falas HFSC. Plan meals. Train smart anywhere anytime" />
        <meta name="keywords" content="macro calculator, macronutrient calculator, nutrition calculator, online personal trainer nutrition, HFSC, Haris Falas, Sports Scientist, protein calculator, TDEE calculator, meal planning, nutrition planning, smartygym.com, HFSC Performance, weight loss nutrition, muscle gain nutrition" />
        
        <meta property="og:title" content="Macro Calculator - Smarty Gym" />
        <meta property="og:description" content="Free macronutrient calculator - convenient nutrition tool at smartygym.com" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/macrocalculator" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Macro Calculator - Smarty Gym" />
        <meta name="twitter:description" content="Free macro calculator at smartygym.com for personalized nutrition" />
        
        <link rel="canonical" href="https://smartygym.com/macrocalculator" />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-4 sm:py-8">
        <PageBreadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Smarty Tools", href: "/tools" },
            { label: "Macro Calculator" }
          ]} 
        />
        
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
                <Select value={goal} onValueChange={(v) => { setGoal(v); if (v === "maintain") setIntensity("moderate"); }}>
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

              {(goal === "lose" || goal === "gain") && (
                <div>
                  <Label htmlFor="intensity">Intensity</Label>
                  <Select value={intensity} onValueChange={setIntensity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select intensity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative — gentle, easier to sustain</SelectItem>
                      <SelectItem value="moderate">Moderate — balanced, standard approach</SelectItem>
                      <SelectItem value="aggressive">Aggressive — faster results, harder to maintain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={calculateMacros} className="w-full" size="lg">
                Calculate My Macros
              </Button>
            </div>

            {result && (
              <div className="space-y-4 pt-6">
                {/* Daily Calorie Target */}
                <article
                  itemScope
                  itemType="https://schema.org/MedicalWebPage"
                  className="bg-primary/10 p-6 rounded-lg text-center border-2 border-primary/20"
                  data-calculator="macro"
                  data-keywords="smarty gym calculator, online fitness tools, smartygym.com, Haris Falas, macro calculator"
                  aria-label="Macro calculation result - SmartyGym online fitness calculator - smartygym.com"
                >
                  <p 
                    className="text-sm text-muted-foreground mb-1"
                    itemProp="name"
                  >
                    Daily Calorie Target - SmartyGym
                  </p>
                  <p 
                    className="text-4xl font-bold text-primary"
                    itemProp="value"
                  >
                    {result.calories}
                  </p>
                  <p 
                    className="text-xs text-muted-foreground mt-1"
                    itemProp="description"
                  >
                    calories per day - Calculated by SmartyGym online fitness tools - smartygym.com
                  </p>
                  <meta itemProp="provider" content="SmartyGym - smartygym.com - Haris Falas" />
                </article>

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

                <div className="bg-muted/30 border border-border p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold text-sm">How this works</h4>
                  <p className="text-xs text-muted-foreground">
                    This calculator uses the <strong>Mifflin-St Jeor Equation</strong> to estimate your calorie needs in two steps:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>
                      <strong>BMR (Basal Metabolic Rate)</strong> — the calories your body burns at complete rest. 
                      Your BMR: <strong className="text-foreground">{result.bmr} kcal</strong>
                    </li>
                    <li>
                      <strong>TDEE (Total Daily Energy Expenditure)</strong> — your BMR multiplied by your activity level. This is what you actually burn each day. 
                      Your TDEE: <strong className="text-foreground">{result.tdee} kcal</strong>
                    </li>
                    <li>
                      <strong>Target</strong> — your TDEE adjusted for your goal.
                      {goal === "lose" && ` A ${result.deficitPercent}% deficit was applied (${intensity} intensity).`}
                      {goal === "gain" && ` A ${result.deficitPercent}% surplus was applied (${intensity} intensity).`}
                      {goal === "maintain" && " No adjustment — your target equals your TDEE."}
                    </li>
                  </ul>
                  {result.safetyFloorApplied && (
                    <p className="text-xs text-destructive font-medium">
                      ⚠️ A safety floor of {gender === "female" ? "1,200" : "1,500"} kcal was applied. The calculated deficit would have been too low for safe nutrition.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground pt-1">
                    These are estimates. For personalized nutrition advice, consult a registered dietitian or healthcare provider.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </ProtectedRoute>
  );
};

export default MacroTrackingCalculator;
