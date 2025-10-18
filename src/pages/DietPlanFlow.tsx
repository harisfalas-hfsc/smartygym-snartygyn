import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlanDisplay } from "@/components/PlanDisplay";
import { SubscriptionGate } from "@/components/SubscriptionGate";

const DietPlanFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [showSubscriptionGate, setShowSubscriptionGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
    mealsPerDay: "",
    dietMethod: "",
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    userName: "",
    customMacros: {
      protein: 33,
      carbs: 34,
      fats: 33,
    }
  });
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"not-started" | "in-progress" | "completed">("not-started");
  const [comment, setComment] = useState("");

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDietaryToggle = (item: string) => {
    const current = formData.dietaryRestrictions;
    if (current.includes(item)) {
      handleInputChange("dietaryRestrictions", current.filter(i => i !== item));
    } else {
      handleInputChange("dietaryRestrictions", [...current, item]);
    }
  };

  const handleAllergyToggle = (allergy: string) => {
    const current = formData.allergies;
    if (current.includes(allergy)) {
      handleInputChange("allergies", current.filter(a => a !== allergy));
    } else {
      handleInputChange("allergies", [...current, allergy]);
    }
  };

  const handleMacroChange = (macro: 'protein' | 'carbs' | 'fats', value: number) => {
    const newMacros = { ...formData.customMacros, [macro]: value };
    const total = newMacros.protein + newMacros.carbs + newMacros.fats;
    
    if (total <= 100) {
      handleInputChange("customMacros", newMacros);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
            type: "diet",
            data: formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate diet plan");
      }

      const data = await response.json();
      setGeneratedPlan(data.plan);
      
      // Save to database
      const { data: savedPlan, error: saveError } = await supabase
        .from('saved_diet_plans')
        .insert({
          user_id: user.id,
          name: `${formData.goal} Diet Plan - ${new Date().toLocaleDateString()}`,
          content: data.plan,
          status: 'not-started'
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving diet plan:", saveError);
        toast({
          title: "Warning",
          description: "Diet plan generated but failed to save to dashboard.",
          variant: "destructive",
        });
      }

      setStep(5);
      toast({
        title: "Success!",
        description: "Your diet plan has been generated and saved to your dashboard.",
      });
    } catch (error) {
      console.error("Error generating diet plan:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate diet plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 px-2">Diet Plan Generator</h1>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4">Basic Information</h2>
                <div>
                  <Label htmlFor="userName">Your Name</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => handleInputChange("userName", e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="Enter your height"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="Enter your weight"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Nutrition Goals</h2>
                <div>
                  <Label htmlFor="goal">Primary Goal</Label>
                  <Select value={formData.goal} onValueChange={(value) => handleInputChange("goal", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weight loss">Weight loss</SelectItem>
                      <SelectItem value="Muscle gain">Muscle gain</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Cutting">Cutting</SelectItem>
                      <SelectItem value="Bulking">Bulking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="activityLevel">Activity Level</Label>
                  <Select value={formData.activityLevel} onValueChange={(value) => handleInputChange("activityLevel", value)}>
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
                  <Label htmlFor="mealsPerDay">Meals per Day</Label>
                  <Select value={formData.mealsPerDay} onValueChange={(value) => handleInputChange("mealsPerDay", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 meal</SelectItem>
                      <SelectItem value="2">2 meals</SelectItem>
                      <SelectItem value="3">3 meals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dietMethod">Diet Method</Label>
                  <Select value={formData.dietMethod} onValueChange={(value) => handleInputChange("dietMethod", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diet method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carnivore">Carnivore</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="Keto">Keto</SelectItem>
                      <SelectItem value="Custom">Custom (choose macros)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.dietMethod === "Custom" && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <Label>Custom Macro Breakdown (Total: {formData.customMacros.protein + formData.customMacros.carbs + formData.customMacros.fats}%)</Label>
                    <div>
                      <Label className="text-sm">Protein: {formData.customMacros.protein}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.customMacros.protein}
                        onChange={(e) => handleMacroChange("protein", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Carbs: {formData.customMacros.carbs}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.customMacros.carbs}
                        onChange={(e) => handleMacroChange("carbs", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Fats: {formData.customMacros.fats}%</Label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.customMacros.fats}
                        onChange={(e) => handleMacroChange("fats", parseInt(e.target.value))}
                      />
                    </div>
                    {(formData.customMacros.protein + formData.customMacros.carbs + formData.customMacros.fats) > 100 && (
                      <p className="text-sm text-red-500">Total cannot exceed 100%</p>
                    )}
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Dietary Preferences</h2>
                <div>
                  <Label>Dietary Restrictions (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Vegetarian", "Vegan", "Pescatarian", "Gluten-free", "Dairy-free", "Halal", "Kosher", "Low-carb"].map((diet) => (
                      <Button
                        key={diet}
                        type="button"
                        variant={formData.dietaryRestrictions.includes(diet) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleDietaryToggle(diet)}
                      >
                        {diet}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Food Allergies (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["Peanuts", "Tree nuts", "Dairy", "Eggs", "Soy", "Wheat", "Fish", "Shellfish"].map((allergy) => (
                      <Button
                        key={allergy}
                        type="button"
                        variant={formData.allergies.includes(allergy) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAllergyToggle(allergy)}
                      >
                        {allergy}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Review & Disclaimer</h2>
                
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p><strong>Age:</strong> {formData.age}</p>
                  <p><strong>Height:</strong> {formData.height} cm</p>
                  <p><strong>Weight:</strong> {formData.weight} kg</p>
                  <p><strong>Goal:</strong> {formData.goal}</p>
                  <p><strong>Activity Level:</strong> {formData.activityLevel}</p>
                  <p><strong>Meals per Day:</strong> {formData.mealsPerDay}</p>
                  <p><strong>Diet Method:</strong> {formData.dietMethod}</p>
                  {formData.dietMethod === "Custom" && (
                    <p><strong>Macros:</strong> P: {formData.customMacros.protein}% / C: {formData.customMacros.carbs}% / F: {formData.customMacros.fats}%</p>
                  )}
                  {formData.dietaryRestrictions.length > 0 && <p><strong>Dietary Restrictions:</strong> {formData.dietaryRestrictions.join(", ")}</p>}
                  {formData.allergies.length > 0 && <p><strong>Allergies:</strong> {formData.allergies.join(", ")}</p>}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    This diet plan is designed based on expert nutritional principles and should not replace professional medical advice. 
                    Consult with a registered dietitian or healthcare provider before making significant dietary changes, 
                    especially if you have any health concerns or medical conditions.
                  </p>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={handleBack} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Diet Plan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">
                  {formData.userName}, here is your taylor-made diet plan!
                </h2>
                
                <PlanDisplay 
                  planContent={generatedPlan}
                  title="Your Diet Plan"
                />

                <div className="space-y-4 pt-4">
                  <div>
                    <Label>Rate this plan</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Button
                          key={star}
                          variant={rating >= star ? "default" : "outline"}
                          size="sm"
                          onClick={() => setRating(star)}
                        >
                          ⭐
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Plan Status</Label>
                    <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="comment">Leave a comment</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this plan..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <div className="flex gap-2">
                    <Button onClick={() => window.print()} variant="outline">
                      Print
                    </Button>
                    <Button onClick={() => {
                      const blob = new Blob([generatedPlan], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'diet-plan.txt';
                      a.click();
                    }} variant="outline">
                      Download
                    </Button>
                    <Button onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Diet Plan',
                          text: generatedPlan
                        });
                      }
                    }} variant="outline">
                      Share
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate("/")} variant="outline">
                      Back to Home
                    </Button>
                    <Button onClick={() => {
                      setStep(1);
                      setGeneratedPlan("");
                      setRating(0);
                      setStatus("not-started");
                      setComment("");
                      setFormData({
                        age: "",
                        height: "",
                        weight: "",
                        goal: "",
                        activityLevel: "",
                        mealsPerDay: "",
                        dietMethod: "",
                        dietaryRestrictions: [],
                        allergies: [],
                        userName: "",
                        customMacros: {
                          protein: 33,
                          carbs: 34,
                          fats: 33,
                        }
                      });
                    }}>
                      Create Another Plan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SubscriptionGate
        open={showSubscriptionGate}
        onOpenChange={setShowSubscriptionGate}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
};

export default DietPlanFlow;
