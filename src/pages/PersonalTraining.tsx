// ============================================
// TEMPORARILY DISABLED - DO NOT DELETE
// This page is hidden but preserved for future use
// To re-enable:
//   1. Uncomment route in App.tsx (line ~132)
//   2. Uncomment navigation link in Navigation.tsx (line ~248-254)
// ============================================

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParQQuestionnaire } from "@/components/ParQQuestionnaire";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Loader2, ArrowLeft, Target } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const PersonalTraining = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<string>("Guest");
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    age: "",
    weight: "",
    height: "",
    fitnessLevel: "",
    lifestyle: [] as string[],
    performanceType: "",
    specificGoal: "",
    duration: "",
    trainingDays: "",
    workoutDuration: "",
    equipment: [] as string[],
    otherEquipment: "",
    limitations: "",
  });

  const [showParQ, setShowParQ] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      // Check subscription status
      try {
        const { data: subscriptionData } = await supabase.functions.invoke('check-subscription');
        if (subscriptionData?.subscribed) {
          setUserStatus("Premium Member");
        } else {
          setUserStatus("Free User");
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setUserStatus("Free User");
      }
      
      // Load profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          name: profile.full_name || "",
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
        }));
      }
    }
  };

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipment]
        : prev.equipment.filter(e => e !== equipment)
    }));
  };

  const handleLifestyleChange = (lifestyle: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: checked 
        ? [...prev.lifestyle, lifestyle]
        : prev.lifestyle.filter(l => l !== lifestyle)
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.email || !formData.name || !formData.age || !formData.weight || !formData.height || !formData.fitnessLevel) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!formData.performanceType || !formData.specificGoal || !formData.duration || !formData.trainingDays || !formData.workoutDuration) {
      toast({
        title: "Missing Information",
        description: "Please complete all questionnaire fields",
        variant: "destructive"
      });
      return;
    }

    if (!showParQ) {
      toast({
        title: "PAR-Q Required",
        description: "Please complete the PAR-Q questionnaire",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to request personal training",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      // Save request to database
      const { error: dbError } = await supabase
        .from('personal_training_requests')
        .insert([{
          user_id: user.id,
          user_email: formData.email,
          user_name: formData.name,
          age: parseInt(formData.age),
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          fitness_level: formData.fitnessLevel,
          lifestyle: formData.lifestyle,
          performance_type: formData.performanceType,
          specific_goal: formData.specificGoal,
          duration: formData.duration,
          training_days: formData.trainingDays,
          workout_duration: formData.workoutDuration,
          equipment: formData.equipment,
          other_equipment: formData.otherEquipment,
          limitations: formData.limitations,
          status: 'pending',
        }]);

      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke('send-personal-training-request', {
        body: { ...formData, userStatus }
      });

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-personal-training-checkout', {
        body: { email: formData.email, name: formData.name, userId: user.id }
      });

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        window.open(checkoutData.url, '_blank');
        toast({
          title: "Request Sent!",
          description: "Your personal training request has been sent to Haris Falas. Complete the payment to finalize your booking.",
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const equipmentOptions = [
    "Kettlebells",
    "Dumbbells",
    "Bars and weight plates",
    "Bands",
    "Pull-up bars",
    "Treadmill",
    "Exercise bike",
    "Elliptical",
    "Jumping rope",
    "Full access to a gym",
    "Only body weight",
    "Other"
  ];

  return (
    <>
      <Helmet>
        <title>Online Personal Training | Haris Falas Sports Scientist | smartygym.com</title>
        <meta name="description" content="Premium online personal training by Haris Falas - BSc Sports Science, CSCS. Customized gym programs tailored to YOUR goals. Expert personal trainer with 20+ years experience. Online fitness coaching at smartygym.com" />
        <meta name="keywords" content="online personal training, personal training, Haris Falas personal training, Haris Falas, online fitness, personal trainer, fitness trainer, online gym personal training, customized workout plans, tailored training programs online, personalized gym programs, sports scientist, strength and conditioning coach, online coaching, virtual personal training, online fitness coaching, personal training services, gym trainer, coaching" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content="Online Personal Training | Haris Falas" />
        <meta property="og:description" content="Customized online personal training by Sports Scientist Haris Falas. Professional personal trainer with proven expertise." />
        <meta property="og:site_name" content="SmartyGym" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Online Personal Training | Haris Falas" />
        <meta name="twitter:description" content="Customized online personal training by Sports Scientist Haris Falas" />
        
        <link rel="canonical" href={window.location.href} />
        
        {/* Structured Data - Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Online Personal Training",
            "name": "Online Personal Training",
            "description": "Customized online personal training programs designed by Sports Scientist Haris Falas for clients worldwide",
            "provider": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Personal Trainer",
              "description": "Online personal trainer with 20+ years experience in strength and conditioning"
            },
            "areaServed": "Worldwide",
            "availableLanguage": "English",
            "offers": {
              "@type": "Offer",
              "name": "Customized Training Program",
              "description": "Fully personalized online training program tailored to your goals and fitness level"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {canGoBack && (
            <div className="mb-4 sm:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </div>
          )}
          
          <PageBreadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Personal Training" }
            ]} 
          />

          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-yellow-50/30 to-primary/5 shadow-lg shadow-primary/20">
            {/* Personal Training Introduction */}
            <div className="px-4 sm:px-6 pt-6 mb-4">
              <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="font-bold text-base text-foreground">
                      Truly Personalized Training by Expert Sports Scientist{" "}
                      <a 
                        href="/coach-profile" 
                        className="text-primary hover:underline cursor-pointer transition-colors"
                      >
                        Haris Falas
                      </a>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Want a <strong className="text-foreground">100% customized training program</strong> crafted specifically for your unique needs, goals, and lifestyle? 
                      Expert sports scientist and strength coach personally designs each program based on your exact specifications, 
                      physical characteristics, available equipment, and any limitations—ensuring maximum effectiveness and safety tailored exclusively to you.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Personal Training Questionnaire</CardTitle>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Please complete all fields to receive your personalized program. Your detailed responses allow me to design 
                a truly tailor-made training plan based on your fitness level, lifestyle, available equipment, and any 
                physical limitations—ensuring a program that is effective, safe, and sustainable specifically for you.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 [&_input]:border-primary [&_textarea]:border-primary [&_button[role=combobox]]:border-primary">
              {/* Basic Information */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Body Weight (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      placeholder="75"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Body Height (cm) *</Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      placeholder="175"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fitnessLevel">Fitness Level *</Label>
                  <Select value={formData.fitnessLevel} onValueChange={(value) => setFormData({...formData, fitnessLevel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your fitness level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">
                        <div className="flex flex-col">
                          <span className="font-medium">Beginner</span>
                          <span className="text-xs text-muted-foreground">New to structured training, or returning after a long break</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex flex-col">
                          <span className="font-medium">Intermediate</span>
                          <span className="text-xs text-muted-foreground">Training consistently for 6+ months with good exercise form</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex flex-col">
                          <span className="font-medium">Advanced</span>
                          <span className="text-xs text-muted-foreground">Training consistently for 2+ years with advanced techniques</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.fitnessLevel === "beginner" && "You're just starting your fitness journey or coming back after time away"}
                    {formData.fitnessLevel === "intermediate" && "You have a solid foundation and train regularly with proper form"}
                    {formData.fitnessLevel === "advanced" && "You have extensive training experience and understand advanced programming"}
                  </p>
                </div>

                <div>
                  <Label>Lifestyle & Activity Level *</Label>
                  <p className="text-xs text-muted-foreground mb-3">Select all that apply to help customize your program</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="very-busy"
                        checked={formData.lifestyle.includes("very-busy")}
                        onCheckedChange={(checked) => handleLifestyleChange("very-busy", checked as boolean)}
                      />
                      <Label htmlFor="very-busy" className="cursor-pointer leading-tight">
                        <div className="font-medium">Very Busy Schedule</div>
                        <div className="text-xs text-muted-foreground">Limited time for training</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="flexible-time"
                        checked={formData.lifestyle.includes("flexible-time")}
                        onCheckedChange={(checked) => handleLifestyleChange("flexible-time", checked as boolean)}
                      />
                      <Label htmlFor="flexible-time" className="cursor-pointer leading-tight">
                        <div className="font-medium">Flexible Schedule</div>
                        <div className="text-xs text-muted-foreground">Good availability for training</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="sedentary"
                        checked={formData.lifestyle.includes("sedentary")}
                        onCheckedChange={(checked) => handleLifestyleChange("sedentary", checked as boolean)}
                      />
                      <Label htmlFor="sedentary" className="cursor-pointer leading-tight">
                        <div className="font-medium">Mostly Sedentary</div>
                        <div className="text-xs text-muted-foreground">Desk job, sitting most of the day</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="moderately-active"
                        checked={formData.lifestyle.includes("moderately-active")}
                        onCheckedChange={(checked) => handleLifestyleChange("moderately-active", checked as boolean)}
                      />
                      <Label htmlFor="moderately-active" className="cursor-pointer leading-tight">
                        <div className="font-medium">Moderately Active</div>
                        <div className="text-xs text-muted-foreground">Mix of sitting and movement</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="very-active"
                        checked={formData.lifestyle.includes("very-active")}
                        onCheckedChange={(checked) => handleLifestyleChange("very-active", checked as boolean)}
                      />
                      <Label htmlFor="very-active" className="cursor-pointer leading-tight">
                        <div className="font-medium">Very Active</div>
                        <div className="text-xs text-muted-foreground">Physical job, on your feet most of the day</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="outdoor-work"
                        checked={formData.lifestyle.includes("outdoor-work")}
                        onCheckedChange={(checked) => handleLifestyleChange("outdoor-work", checked as boolean)}
                      />
                      <Label htmlFor="outdoor-work" className="cursor-pointer leading-tight">
                        <div className="font-medium">Outdoor Work</div>
                        <div className="text-xs text-muted-foreground">Working outdoors regularly</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="high-stress"
                        checked={formData.lifestyle.includes("high-stress")}
                        onCheckedChange={(checked) => handleLifestyleChange("high-stress", checked as boolean)}
                      />
                      <Label htmlFor="high-stress" className="cursor-pointer leading-tight">
                        <div className="font-medium">High Stress Level</div>
                        <div className="text-xs text-muted-foreground">Demanding work/life situation</div>
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Type */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Your Goals</h3>
                
                <div>
                  <Label htmlFor="performanceType">Performance Type *</Label>
                  <Select value={formData.performanceType} onValueChange={(value) => {
                    setFormData({...formData, performanceType: value, specificGoal: ""});
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="human">Human Performance</SelectItem>
                      <SelectItem value="athlete">Athlete Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.performanceType && (
                  <div>
                    <Label htmlFor="specificGoal">Specific Goal *</Label>
                    <Select value={formData.specificGoal} onValueChange={(value) => setFormData({...formData, specificGoal: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specific goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.performanceType === "human" ? (
                          <>
                            <SelectItem value="weight-loss">Weight Loss</SelectItem>
                            <SelectItem value="functional-strength">Functional Strength</SelectItem>
                            <SelectItem value="muscle-hypertrophy">Muscle Hypertrophy</SelectItem>
                            <SelectItem value="cardiovascular-endurance">Cardiovascular Endurance</SelectItem>
                            <SelectItem value="running-performance">Running Performance</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="strength">Strength</SelectItem>
                            <SelectItem value="power">Power</SelectItem>
                            <SelectItem value="speed">Speed</SelectItem>
                            <SelectItem value="energy-system">Energy System Development</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Program Details */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Program Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Program Duration *</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData({...formData, duration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-weeks">4 Weeks</SelectItem>
                        <SelectItem value="6-weeks">6 Weeks</SelectItem>
                        <SelectItem value="8-weeks">8 Weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="trainingDays">Training Days/Week *</Label>
                    <Select value={formData.trainingDays} onValueChange={(value) => setFormData({...formData, trainingDays: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Days</SelectItem>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="4">4 Days</SelectItem>
                        <SelectItem value="5">5 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workoutDuration">Workout Duration *</Label>
                    <Select value={formData.workoutDuration} onValueChange={(value) => setFormData({...formData, workoutDuration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Minutes</SelectItem>
                        <SelectItem value="45">45 Minutes</SelectItem>
                        <SelectItem value="60">60 Minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Available Equipment</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Select all that apply</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {equipmentOptions.map((equipment) => (
                    <div key={equipment} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment}
                        checked={formData.equipment.includes(equipment)}
                        onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                      />
                      <Label htmlFor={equipment} className="cursor-pointer">{equipment}</Label>
                    </div>
                  ))}
                </div>

                {formData.equipment.includes("Other") && (
                  <div>
                    <Label htmlFor="otherEquipment">Please specify other equipment</Label>
                    <Input
                      id="otherEquipment"
                      value={formData.otherEquipment}
                      onChange={(e) => setFormData({...formData, otherEquipment: e.target.value})}
                      placeholder="Describe your equipment"
                    />
                  </div>
                )}
              </div>

              {/* Limitations */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Limitations and Safety</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Please describe any previous injuries, limitations, pain areas, or movements to avoid. 
                  This information helps us create a safe and effective program tailored to your needs.
                </p>
                <Textarea
                  id="limitations"
                  value={formData.limitations}
                  onChange={(e) => setFormData({...formData, limitations: e.target.value})}
                  placeholder="E.g., Previous knee injury, lower back pain when deadlifting, avoid overhead pressing..."
                  rows={4}
                />
              </div>

              {/* PAR-Q Questionnaire */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Part 2: <span className="whitespace-nowrap">PAR-Q</span> Health Assessment</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setShowParQ(!showParQ)}
                  className="w-full"
                >
                  {showParQ ? "Hide" : "Show"} <span className="whitespace-nowrap">PAR-Q</span> Questionnaire
                </Button>
                
                {showParQ && (
                  <div className="border rounded-lg p-4">
                    <ParQQuestionnaire />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Submit & Proceed to Payment (€119)"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  You will be redirected to secure payment after submission
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PersonalTraining;
