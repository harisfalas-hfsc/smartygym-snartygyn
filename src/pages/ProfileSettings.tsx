import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileData } from "@/hooks/useProfileData";

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

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { profileData, loading: profileLoading } = useProfileData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    age: "",
    gender: "",
    fitness_level: "",
    fitness_goal: "",
    equipment_preferences: [] as string[]
  });

  useEffect(() => {
    if (profileData && !profileLoading) {
      setFormData({
        weight: profileData.weight || "",
        height: profileData.height || "",
        age: profileData.age || "",
        gender: profileData.gender || "",
        fitness_level: profileData.fitness_level || "",
        fitness_goal: profileData.fitness_goal || "",
        equipment_preferences: profileData.equipment_preferences || []
      });
    }
  }, [profileData, profileLoading]);

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment_preferences: prev.equipment_preferences.includes(equipment)
        ? prev.equipment_preferences.filter(e => e !== equipment)
        : [...prev.equipment_preferences, equipment]
    }));
  };

  const handleSave = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender) {
      toast.error("Please fill in all required fields");
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
          fitness_goal: formData.fitness_goal,
          equipment_preferences: formData.equipment_preferences,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile Settings</CardTitle>
            <CardDescription>
              Update your fitness profile information. This data will be used to pre-fill your workout and diet plan questionnaires.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="75"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm) *</Label>
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
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
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

            {/* Fitness Profile */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Fitness Profile</h3>
              
              <div>
                <Label htmlFor="fitness_level">Fitness Level</Label>
                <Select value={formData.fitness_level} onValueChange={(value) => setFormData({ ...formData, fitness_level: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fitness_goal">Fitness Goal</Label>
                <Input
                  id="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={(e) => setFormData({ ...formData, fitness_goal: e.target.value })}
                  placeholder="e.g., Lose weight, Build muscle, Improve endurance"
                />
              </div>
            </div>

            {/* Equipment Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Available Equipment</h3>
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

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;