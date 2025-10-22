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
import { Loader2 } from "lucide-react";

const PersonalTraining = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
        .select("full_name, age, weight, height")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          email: user.email || "",
          name: profile.full_name || "",
          age: profile.age?.toString() || "",
          weight: profile.weight?.toString() || "",
          height: profile.height?.toString() || "",
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

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.email || !formData.name || !formData.age || !formData.weight || !formData.height) {
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
        title: "PAR-Q+ Required",
        description: "Please complete the PAR-Q+ questionnaire",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Send email with questionnaire details
      const { error: emailError } = await supabase.functions.invoke('send-personal-training-request', {
        body: { ...formData, userStatus }
      });

      if (emailError) throw emailError;

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke('create-personal-training-checkout', {
        body: { email: formData.email, name: formData.name }
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
        <title>Personal Training - Smarty Gym</title>
        <meta name="description" content="Get your customized and tailor-made program by fitness expert and sports scientist Haris Falas" />
      </Helmet>

      <div className="min-h-screen bg-background py-6 sm:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">Personal Training</h1>
          
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">
            Get your customized and tailor-made program by the fitness expert and sports scientist, <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>
          </p>

          <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-center text-xl sm:text-2xl mb-2">Elevate Your Performance</CardTitle>
              <CardDescription className="text-center text-sm sm:text-base leading-relaxed">
                Improve your human and athlete's performance with a customized and tailor-made program crafted by expert <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>. 
                Each program is specifically designed to meet your unique goals, abilities, and lifestyle, ensuring optimal results 
                through science-based training principles and personalized attention.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-primary">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl">Personal Training Questionnaire</CardTitle>
              <CardDescription className="text-sm sm:text-base">Please complete all fields to receive your personalized program</CardDescription>
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
                <h3 className="font-semibold text-base sm:text-lg">Part 2: PAR-Q+ Health Assessment</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setShowParQ(!showParQ)}
                  className="w-full"
                >
                  {showParQ ? "Hide" : "Show"} PAR-Q+ Questionnaire
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
