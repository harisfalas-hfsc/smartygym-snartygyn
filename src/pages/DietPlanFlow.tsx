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

const DietPlanFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "",
    activityLevel: "",
    mealsPerDay: "",
    dietaryRestrictions: "",
    allergies: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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
      setStep(5);
      toast({
        title: "Success!",
        description: "Your diet plan has been generated.",
      });
    } catch (error) {
      console.error("Error generating diet plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate diet plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        
        <h1 className="text-4xl font-bold text-center mb-8">Diet Plan Generator</h1>
        
        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
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
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    placeholder="e.g., Weight loss, Muscle gain, Maintenance"
                  />
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
                      <SelectItem value="3">3 meals</SelectItem>
                      <SelectItem value="4">4 meals</SelectItem>
                      <SelectItem value="5">5 meals</SelectItem>
                      <SelectItem value="6">6 meals</SelectItem>
                    </SelectContent>
                  </Select>
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

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Dietary Preferences</h2>
                <div>
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</Label>
                  <Textarea
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions}
                    onChange={(e) => handleInputChange("dietaryRestrictions", e.target.value)}
                    placeholder="e.g., Vegetarian, Vegan, Keto, Gluten-free..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Food Allergies (Optional)</Label>
                  <Textarea
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="List any food allergies..."
                    rows={3}
                  />
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
                  {formData.dietaryRestrictions && <p><strong>Dietary Restrictions:</strong> {formData.dietaryRestrictions}</p>}
                  {formData.allergies && <p><strong>Allergies:</strong> {formData.allergies}</p>}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    This diet plan is AI-generated and should not replace professional nutritional or medical advice. 
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
                <h2 className="text-2xl font-semibold mb-4">Your Diet Plan</h2>
                
                <div className="bg-muted p-6 rounded-lg whitespace-pre-wrap">
                  {generatedPlan}
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={() => navigate("/")} variant="outline">
                    Back to Home
                  </Button>
                  <Button onClick={() => {
                    setStep(1);
                    setGeneratedPlan("");
                    setFormData({
                      age: "",
                      height: "",
                      weight: "",
                      goal: "",
                      activityLevel: "",
                      mealsPerDay: "",
                      dietaryRestrictions: "",
                      allergies: "",
                    });
                  }}>
                    Create Another Plan
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DietPlanFlow;
