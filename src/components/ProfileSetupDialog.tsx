import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileSetupDialogProps {
  open: boolean;
  onComplete: () => void;
}

const fitnessGoalOptions = [
  "Build Strength",
  "Build Muscle (Hypertrophy)",
  "Lose Weight / Burn Calories",
  "Improve Cardiovascular Health",
  "Improve Mobility & Flexibility",
  "Manage Lower Back Pain",
  "Boost Metabolism",
  "General Fitness Challenge"
];

const equipmentOptions = [
  "Dumbbells",
  "Barbells",
  "Kettlebells",
  "Resistance Bands",
  "Pull-up Bar",
  "Bench",
  "Squat Rack",
  "Treadmill",
  "Rowing Machine",
  "Jump Rope",
  "Yoga Mat",
  "Bodyweight Only"
];

export const ProfileSetupDialog = ({ open, onComplete }: ProfileSetupDialogProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    fitness_level: "",
    fitness_goals: [] as string[],
    equipment_preferences: [] as string[]
  });
  const [loading, setLoading] = useState(false);

  const handleFitnessGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      fitness_goals: prev.fitness_goals.includes(goal)
        ? prev.fitness_goals.filter(g => g !== goal)
        : [...prev.fitness_goals, goal]
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment_preferences: prev.equipment_preferences.includes(equipment)
        ? prev.equipment_preferences.filter(e => e !== equipment)
        : [...prev.equipment_preferences, equipment]
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.weight || !formData.height || !formData.age || !formData.gender) {
        toast.error("Please fill in all basic information");
        return;
      }
    }
    if (step === 2) {
      if (!formData.fitness_level || formData.fitness_goals.length === 0) {
        toast.error("Please select your fitness level and at least one fitness goal");
        return;
      }
    }
    setStep(step + 1);
  };

  const handleComplete = async () => {
    if (formData.equipment_preferences.length === 0) {
      toast.error("Please select at least one equipment option");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          gender: formData.gender,
          fitness_level: formData.fitness_level,
          fitness_goals: formData.fitness_goals,
          equipment_preferences: formData.equipment_preferences,
          has_completed_profile: true
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile setup complete!");
      onComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Let's set up your fitness profile. This will help us personalize your workouts and training programs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Fitness Profile</h3>
              
              <div>
                <Label htmlFor="fitness_level">Fitness Level</Label>
                <Select value={formData.fitness_level} onValueChange={(value) => setFormData({ ...formData, fitness_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Fitness Goals (Select all that apply)</Label>
                <p className="text-sm text-muted-foreground mb-3">Choose one or more goals</p>
                <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto border border-border rounded-lg p-3">
                  {fitnessGoalOptions.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={formData.fitness_goals.includes(goal)}
                        onCheckedChange={() => handleFitnessGoalToggle(goal)}
                      />
                      <Label
                        htmlFor={goal}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {goal}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Available Equipment</h3>
              <p className="text-sm text-muted-foreground">Select all equipment you have access to</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment} className="flex items-center space-x-2">
                    <Checkbox
                      id={equipment}
                      checked={formData.equipment_preferences.includes(equipment)}
                      onCheckedChange={() => handleEquipmentToggle(equipment)}
                    />
                    <Label
                      htmlFor={equipment}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {equipment}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleComplete} disabled={loading}>
                  {loading ? "Saving..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-2 rounded-full ${
                  s === step ? "bg-yellow-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};