import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { generateSoftwareApplicationSchema, generateBreadcrumbSchema } from "@/utils/seoHelpers";

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

      // Log to activity log
      await supabase.from("user_activity_log").insert({
        user_id: user.id,
        content_type: 'tool',
        item_id: '1rm-calculator',
        item_name: '1RM Calculator',
        action_type: 'calculated',
        tool_input: {
          weight: parseFloat(weight),
          reps: parseInt(reps),
          exercise: exerciseName || 'Unknown'
        },
        tool_result: {
          oneRM: result
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
    <ProtectedRoute>
      <>
        <Helmet>
          <title>Free 1RM Calculator | One Rep Max Calculator Online | SmartyGym Cyprus | smartygym.com</title>
          <meta name="description" content="Free online 1RM calculator at smartygym.com - Calculate your one rep max using Brzycki formula. Professional strength training tool by Sports Scientist Haris Falas Cyprus. Plan your gym training with precision. Train anywhere, anytime." />
          <meta name="keywords" content="1rm calculator, one rep max calculator, 1 rep max calculator, strength calculator, powerlifting calculator, max calculator, training percentages, Brzycki formula, online gym tools, fitness calculators, smartygym, smartygym.com, gym Cyprus, Haris Falas, Haris Falas Cyprus, CSCS coach, strength training tools, online gym calculator, gym planning tools, bench press calculator, squat calculator, deadlift calculator, convenient fitness tools, flexible training tools" />
          
          <meta property="og:title" content="Free 1RM Calculator | One Rep Max Calculator | SmartyGym" />
          <meta property="og:description" content="Calculate your one rep max with our free online 1RM calculator at smartygym.com - Professional strength training tool by Haris Falas" />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://smartygym.com/1rmcalculator" />
          <meta property="og:image" content="https://smartygym.com/smarty-gym-logo.png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="SmartyGym" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Free 1RM Calculator - SmartyGym" />
          <meta name="twitter:description" content="Calculate your one rep max for strength training at smartygym.com" />
          <meta name="twitter:image" content="https://smartygym.com/smarty-gym-logo.png" />
          
          <link rel="canonical" href="https://smartygym.com/1rmcalculator" />
          
          <script type="application/ld+json">
            {JSON.stringify(generateSoftwareApplicationSchema({
              name: "1RM Calculator - One Rep Max Calculator",
              description: "Free online one rep max calculator using Brzycki formula. Calculate your 1RM and training percentages for powerlifting, strength training, and gym workouts.",
              category: "HealthApplication",
              url: "/1rmcalculator"
            }))}
          </script>
          <script type="application/ld+json">
            {JSON.stringify(generateBreadcrumbSchema([
              { name: "Home", url: "/" },
              { name: "Tools", url: "/tools" },
              { name: "1RM Calculator", url: "/1rmcalculator" }
            ]))}
          </script>
        </Helmet>
        
        <SEOEnhancer
          entities={["SmartyGym", "Haris Falas", "1RM Calculator", "Strength Training"]}
          topics={["strength training", "powerlifting", "one rep max", "gym training"]}
          expertise={["sports science", "strength conditioning", "exercise science"]}
          contentType="fitness-calculator"
          fitnessGoal="strength"
          aiSummary="Free online 1RM calculator for calculating one rep max using Brzycki formula. Professional strength training tool by Sports Scientist Haris Falas at SmartyGym Cyprus."
          aiKeywords={["1RM", "one rep max", "strength calculator", "powerlifting", "Brzycki formula", "training percentages", "gym tools", "fitness calculator"]}
          relatedContent={["strength training workouts", "powerlifting programs", "gym tools"]}
        />
      </>
      
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

        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: "1RM Calculator" }
          ]} 
        />
        
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
                <article
                  itemScope
                  itemType="https://schema.org/MedicalWebPage"
                  className="bg-primary/10 p-6 rounded-lg text-center"
                  data-calculator="1rm"
                  data-keywords="smarty gym calculator, online fitness tools, smartygym.com, Haris Falas Cyprus, 1RM calculator"
                  aria-label="1RM calculation result - Smarty Gym Cyprus online fitness calculator - smartygym.com"
                >
                  <h2 
                    className="text-lg font-semibold mb-2"
                    itemProp="name"
                  >
                    Your Estimated 1RM - Smarty Gym Cyprus
                  </h2>
                  <p 
                    className="text-4xl font-bold text-primary"
                    itemProp="value"
                  >
                    {result} kg
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Calculated by Smarty Gym Cyprus online fitness tools - smartygym.com - Haris Falas
                  </p>
                  <meta itemProp="provider" content="Smarty Gym Cyprus - smartygym.com - Haris Falas" />
                  <meta itemProp="description" content="One rep max calculation using Brzycki formula - Online gym calculator at smartygym.com" />
                </article>

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
    </ProtectedRoute>
  );
};

export default OneRMCalculator;
