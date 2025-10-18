import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { StravaTrackingDialog } from "@/components/StravaTrackingDialog";
import { WorkoutDisplay } from "@/components/WorkoutDisplay";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { useProfileData } from "@/hooks/useProfileData";

interface WorkoutFormData {
  age: string;
  height: string;
  weight: string;
  goal: string;
  timeAvailable: string;
  equipment: string[];
  limitations: string;
}

const WorkoutFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, loading: profileLoading } = useProfileData();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const [showStravaDialog, setShowStravaDialog] = useState(false);
  const [exercises, setExercises] = useState<Array<{ name: string; video_id: string; video_url: string }>>([]);
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState<WorkoutFormData>({
    age: "",
    height: "",
    weight: "",
    goal: "",
    timeAvailable: "",
    equipment: [],
    limitations: "",
  });

  // Pre-fill form with profile data when it loads
  useEffect(() => {
    if (profileData && !profileLoading) {
      setFormData(prev => ({
        ...prev,
        age: profileData.age || prev.age,
        height: profileData.height || prev.height,
        weight: profileData.weight || prev.weight,
        equipment: profileData.equipment_preferences.length > 0 ? profileData.equipment_preferences : prev.equipment,
      }));
    }
  }, [profileData, profileLoading]);

  const goals = [
    "Strength",
    "Calorie Burning",
    "Metabolic",
    "Cardio",
    "Mobility and Stability",
    "Challenge",
  ];

  const equipmentOptions = [
    "Body Weight",
    "Kettlebells",
    "Dumbbells",
    "Bar & Weight Plates",
    "Parallel Bars",
    "Medicine Balls",
    "Jump Rope",
    "Pull Up Bar",
    "Plyo Box",
    "Other",
  ];

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/");
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthenticated(false);
        setShowSubscriptionGate(true);
        setLoading(false);
        return;
      }

      // Check if user has active subscription
      // TODO: Add subscription check when implemented
      // For now, let authenticated users proceed
      const hasSubscription = true; // Replace with actual subscription check

      if (!hasSubscription) {
        setIsAuthenticated(true);
        setShowSubscriptionGate(true);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-fitness-plan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "workout",
            data: {
              ...formData,
              equipment: formData.equipment.join(", "),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate workout plan");
      }

      const data = await response.json();
      setGeneratedPlan(data.plan);
      setExercises(data.exercises || []);
      
      // Save to database
      const { data: savedWorkout, error: saveError } = await supabase
        .from('saved_workouts')
        .insert({
          user_id: user.id,
          name: `${formData.goal} Workout - ${new Date().toLocaleDateString()}`,
          content: data.plan,
          status: 'not-started'
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving workout:", saveError);
        toast({
          title: "Warning",
          description: "Workout generated but failed to save to dashboard.",
          variant: "destructive",
        });
      } else {
        setSavedWorkoutId(savedWorkout.id);
      }

      setStep(5);
      toast({
        title: "Success!",
        description: "Your workout plan has been generated and saved to your dashboard.",
      });
    } catch (error) {
      console.error("Error generating workout:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate workout plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="py-4 sm:py-6 px-4 border-b border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={handleBack} className="flex-shrink-0">
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
            <img src={smartyGymLogo} alt="Smarty Gym" className="h-10 sm:h-12 flex-shrink-0" />
            <div className="w-16 sm:w-20 flex-shrink-0" />
          </div>
        </div>
      </header>

      <main className="py-6 sm:py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 rounded-full mx-1 transition-colors ${
                      s <= step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Step {step} of 4
              </p>
            </div>
          )}

          <Card className="p-4 sm:p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Personal Information</h2>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Help us understand your starting point
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      placeholder="Enter your age"
                    />
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        setFormData({ ...formData, height: e.target.value })
                      }
                      placeholder="Enter your height"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                      placeholder="Enter your weight"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Your Goal</h2>
                  <p className="text-muted-foreground">
                    What do you want to achieve?
                  </p>
                </div>

                <div>
                  <Label>Select Your Goal</Label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value) =>
                      setFormData({ ...formData, goal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((goal) => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="time">Time Available (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={formData.timeAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, timeAvailable: e.target.value })
                    }
                    placeholder="How many minutes per workout?"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Equipment Available</h2>
                  <p className="text-muted-foreground">
                    Select all equipment you have access to
                  </p>
                </div>

                <div className="space-y-3">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-3">
                      <Checkbox
                        id={equipment}
                        checked={formData.equipment.includes(equipment)}
                        onCheckedChange={() => handleEquipmentToggle(equipment)}
                      />
                      <Label htmlFor={equipment} className="cursor-pointer">
                        {equipment}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2">Limitations & Preferences</h2>
                  <p className="text-muted-foreground">
                    Any injuries, movements to avoid, or preferences?
                  </p>
                </div>

                <div>
                  <Label htmlFor="limitations">Limitations or Preferences (Optional)</Label>
                  <Textarea
                    id="limitations"
                    value={formData.limitations}
                    onChange={(e) =>
                      setFormData({ ...formData, limitations: e.target.value })
                    }
                    placeholder="E.g., knee injury, avoid jumping movements, prefer upper body exercises..."
                    rows={6}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                  <p className="font-semibold mb-2">Important Disclaimer:</p>
                  <p>
                    Any workout or training program provided by Smarty Gym is not
                    medical advice. You should consult with a healthcare professional
                    before starting any exercise program. By proceeding, you
                    acknowledge that you are executing this workout at your own risk
                    and Smarty Gym is not liable for any injuries or adverse effects.
                  </p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <WorkoutDisplay 
                  exercises={exercises}
                  planContent={generatedPlan}
                  title={`${formData.goal} Workout`}
                />

                <div className="flex flex-col gap-4 pt-4">
                  <Button 
                    onClick={() => setShowStravaDialog(true)}
                    size="lg"
                    className="w-full"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Track with Strava
                  </Button>
                  
                  <div className="flex justify-between gap-4">
                    <Button onClick={() => navigate("/")} variant="outline">
                      Back to Home
                    </Button>
                    <Button
                      onClick={() => {
                        setStep(1);
                        setGeneratedPlan("");
                        setSavedWorkoutId(null);
                        setExercises([]);
                        setFormData({
                          age: "",
                          height: "",
                          weight: "",
                          goal: "",
                          timeAvailable: "",
                          equipment: [],
                          limitations: "",
                        });
                      }}
                    >
                      Create Another Plan
                    </Button>
                  </div>
                </div>

                <StravaTrackingDialog
                  open={showStravaDialog}
                  onOpenChange={setShowStravaDialog}
                  planName={`${formData.goal} Workout`}
                  planType="workout"
                />
              </div>
            )}

            {step < 5 && (
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  {step === 1 ? "Cancel" : "Back"}
                </Button>

                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate My Workout"
                    )}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      <SubscriptionGate
        open={showSubscriptionGate}
        onOpenChange={setShowSubscriptionGate}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default WorkoutFlow;
