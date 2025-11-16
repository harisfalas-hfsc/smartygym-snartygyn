import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Save, Crown, CheckCircle, User, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfileData } from "@/hooks/useProfileData";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ShareButtons } from "@/components/ShareButtons";
import { NotificationPreferences } from "@/components/NotificationPreferences";

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
  "Bodyweight Only",
  "Other"
];

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const { profileData, loading: profileLoading } = useProfileData();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    weight: "",
    height: "",
    age: "",
    gender: "",
    fitness_level: "",
    fitness_goals: [] as string[],
    equipment_preferences: [] as string[],
    other_equipment: ""
  });

  useEffect(() => {
    if (profileData && !profileLoading) {
      // Extract "Other: description" from equipment preferences if it exists
      const otherEquipment = profileData.equipment_preferences?.find(eq => eq.startsWith("Other: "));
      const otherDescription = otherEquipment ? otherEquipment.substring(7) : "";
      const filteredEquipment = profileData.equipment_preferences?.filter(eq => !eq.startsWith("Other: ")) || [];
      
      setFormData({
        nickname: profileData.nickname || "",
        weight: profileData.weight || "",
        height: profileData.height || "",
        age: profileData.age || "",
        gender: profileData.gender || "",
        fitness_level: profileData.fitness_level || "",
        fitness_goals: profileData.fitness_goals || [],
        equipment_preferences: otherDescription ? [...filteredEquipment, "Other"] : filteredEquipment,
        other_equipment: otherDescription
      });
    }
  }, [profileData, profileLoading]);

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

  const handleSave = async () => {
    if (!formData.weight || !formData.height || !formData.age || !formData.gender) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate "Other" equipment
    if (formData.equipment_preferences.includes("Other") && !formData.other_equipment.trim()) {
      toast.error("Please describe the other equipment");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Process equipment preferences
      let equipmentToSave = formData.equipment_preferences.filter(eq => eq !== "Other");
      if (formData.equipment_preferences.includes("Other") && formData.other_equipment.trim()) {
        equipmentToSave.push(`Other: ${formData.other_equipment.trim()}`);
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          nickname: formData.nickname || null,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          age: parseInt(formData.age),
          gender: formData.gender,
          fitness_level: formData.fitness_level,
          fitness_goals: formData.fitness_goals,
          equipment_preferences: equipmentToSave,
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
    <>
      <Helmet>
        <title>Fitness Profile Settings | Smarty Gym</title>
        <meta name="description" content="Customize your fitness profile, set goals, track progress, and manage equipment preferences for personalized workout recommendations." />
        <meta name="keywords" content="fitness profile settings, workout preferences, fitness goals, equipment settings, personalized training, Cyprus fitness" />
        <link rel="canonical" href="https://smartygym.com/profilesettings" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Fitness Profile Settings | Smarty Gym" />
        <meta property="og:description" content="Customize your fitness profile, set goals, track progress, and manage equipment preferences for personalized workout recommendations." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/profilesettings" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Fitness Profile Settings | Smarty Gym" />
        <meta name="twitter:description" content="Customize your fitness profile, set goals, track progress, and manage equipment preferences for personalized workout recommendations." />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        {/* SEO Content Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Fitness Profile Settings</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to your personalized fitness profile settings at Smarty Gym. This comprehensive profile management system allows you to customize your training experience, track your fitness journey, and achieve your health goals more effectively.
          </p>
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold mt-6 mb-3">Why Your Fitness Profile Matters</h2>
            <p>
              Your fitness profile is the foundation of your personalized workout experience. By providing accurate information about your body metrics, fitness level, and goals, you enable our advanced algorithm to recommend the most suitable workouts and training programs tailored specifically for you. Whether you're looking to build muscle, lose weight, improve cardiovascular health, or enhance mobility, your profile settings ensure you receive science-based recommendations that match your current fitness level and available equipment.
            </p>
            
            <h2 className="text-2xl font-semibold mt-6 mb-3">Customize Your Training Experience</h2>
            <p>
              Configure your equipment preferences to receive workout suggestions that match what you have available. From bodyweight-only exercises to fully-equipped gym routines, Smarty Gym adapts to your situation. Premium members enjoy additional benefits including progress tracking, personalized coaching access, and exclusive training programs designed by certified fitness professionals in Cyprus.
            </p>

            <h2 className="text-2xl font-semibold mt-6 mb-3">Track Your Progress</h2>
            <p>
              Regular updates to your profile measurements help you monitor your fitness transformation. As you progress through your training journey, updating your weight, fitness level, and goals ensures that workout recommendations evolve with you, maintaining optimal challenge and effectiveness throughout your fitness journey.
            </p>
          </div>
          
          {/* Social Sharing */}
          <div className="mt-6">
            <ShareButtons 
              url="https://smartygym.com/profilesettings"
              title="Check out Smarty Gym - Personalized Fitness Training"
            />
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Settings
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Your Profile Settings</CardTitle>
                <CardDescription>
                  Update your fitness profile information. This data will be used to pre-fill your workout and diet plan questionnaires and provide personalized recommendations.
                </CardDescription>
              </CardHeader>
          <CardContent className="space-y-6">
            {/* Premium Status Banner */}
            {userTier === "premium" && (
              <div className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 rounded-lg p-6 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <Crown className="h-7 w-7 text-yellow-500" />
                  <div>
                    <h3 className="font-bold text-xl">Premium Member</h3>
                    <p className="text-sm text-muted-foreground">You have full access to all features</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="text-center p-2 bg-background/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">All Workouts</p>
                  </div>
                  <div className="text-center p-2 bg-background/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">All Programs</p>
                  </div>
                  <div className="text-center p-2 bg-background/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Progress Tracking</p>
                  </div>
                  <div className="text-center p-2 bg-background/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Coach Access</p>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Member Nickname */}
            {userTier === "premium" && (
              <div className="space-y-4 border-2 border-primary/30 bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Premium Member Settings</h3>
                </div>
                
                <div>
                  <Label htmlFor="nickname">Nickname (optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    This is how you'll appear on the platform (3-20 characters, unique)
                  </p>
                  <Input
                    id="nickname"
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g., FitnessWarrior"
                    maxLength={20}
                  />
                </div>
              </div>
            )}
            
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
                <Label>Fitness Goals (Select all that apply)</Label>
                <p className="text-sm text-muted-foreground mb-3">Choose one or more goals</p>
                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto border border-border rounded-lg p-3">
                  {fitnessGoalOptions.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={`goal-${goal}`}
                        checked={formData.fitness_goals.includes(goal)}
                        onCheckedChange={() => handleFitnessGoalToggle(goal)}
                      />
                      <Label
                        htmlFor={`goal-${goal}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {goal}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Available Equipment</h3>
              <p className="text-sm text-muted-foreground">Select all equipment you have access to</p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto border border-border rounded-lg p-3">
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

              {/* Other Equipment Text Input */}
              {formData.equipment_preferences.includes("Other") && (
                <div>
                  <Label htmlFor="other_equipment">Describe Other Equipment *</Label>
                  <Input
                    id="other_equipment"
                    type="text"
                    value={formData.other_equipment}
                    onChange={(e) => setFormData({ ...formData, other_equipment: e.target.value })}
                    placeholder="e.g., Suspension trainer, foam roller, etc."
                    className="mt-2"
                  />
                </div>
              )}
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
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferences />
        </TabsContent>
      </Tabs>
      </div>
      </div>
    </>
  );
};

export default ProfileSettings;