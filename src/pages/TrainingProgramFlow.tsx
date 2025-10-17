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

const TrainingProgramFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedProgram, setGeneratedProgram] = useState("");
  const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    goal: "",
    programLength: "",
    daysPerWeek: "",
    experienceLevel: "",
    equipment: "",
    limitations: "",
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
            type: "training-program",
            data: formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate training program");
      }

      const data = await response.json();
      setGeneratedProgram(data.plan);
      setStep(5);
      toast({
        title: "Success!",
        description: "Your training program has been generated.",
      });
    } catch (error) {
      console.error("Error generating program:", error);
      toast({
        title: "Error",
        description: "Failed to generate training program. Please try again.",
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
        
        <h1 className="text-4xl font-bold text-center mb-8">Training Program Generator</h1>
        
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
                <h2 className="text-2xl font-semibold mb-4">Program Details</h2>
                <div>
                  <Label htmlFor="goal">Training Goal</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    placeholder="e.g., Build muscle, Lose weight, Increase strength"
                  />
                </div>
                <div>
                  <Label htmlFor="programLength">Program Length (weeks)</Label>
                  <Select value={formData.programLength} onValueChange={(value) => handleInputChange("programLength", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                      <SelectItem value="12">12 weeks</SelectItem>
                      <SelectItem value="16">16 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="daysPerWeek">Training Days per Week</Label>
                  <Select value={formData.daysPerWeek} onValueChange={(value) => handleInputChange("daysPerWeek", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange("experienceLevel", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
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
                <h2 className="text-2xl font-semibold mb-4">Equipment & Limitations</h2>
                <div>
                  <Label htmlFor="equipment">Available Equipment</Label>
                  <Input
                    id="equipment"
                    value={formData.equipment}
                    onChange={(e) => handleInputChange("equipment", e.target.value)}
                    placeholder="e.g., Full gym, Dumbbells only, Bodyweight"
                  />
                </div>
                <div>
                  <Label htmlFor="limitations">Physical Limitations (Optional)</Label>
                  <Textarea
                    id="limitations"
                    value={formData.limitations}
                    onChange={(e) => handleInputChange("limitations", e.target.value)}
                    placeholder="Any injuries, conditions, or restrictions..."
                    rows={4}
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
                  <p><strong>Program Length:</strong> {formData.programLength} weeks</p>
                  <p><strong>Training Days:</strong> {formData.daysPerWeek} per week</p>
                  <p><strong>Experience:</strong> {formData.experienceLevel}</p>
                  <p><strong>Equipment:</strong> {formData.equipment}</p>
                  {formData.limitations && <p><strong>Limitations:</strong> {formData.limitations}</p>}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Important Disclaimer</h3>
                  <p className="text-sm text-muted-foreground">
                    This training program is AI-generated and should not replace professional medical or fitness advice. 
                    Consult with a healthcare provider before starting any new exercise program, especially if you have 
                    any health concerns or medical conditions.
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
                        Generate Program
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold mb-4">Your Training Program</h2>
                
                <div className="bg-muted p-6 rounded-lg whitespace-pre-wrap">
                  {generatedProgram}
                </div>

                <div className="flex justify-between gap-4 pt-4">
                  <Button onClick={() => navigate("/")} variant="outline">
                    Back to Home
                  </Button>
                  <Button onClick={() => {
                    setStep(1);
                    setGeneratedProgram("");
                    setFormData({
                      age: "",
                      height: "",
                      weight: "",
                      goal: "",
                      programLength: "",
                      daysPerWeek: "",
                      experienceLevel: "",
                      equipment: "",
                      limitations: "",
                    });
                  }}>
                    Create Another Program
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

export default TrainingProgramFlow;
