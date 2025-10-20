import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, Scale, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCaptureBox } from "@/components/EmailCaptureBox";
import { PremiumPopup } from "@/components/PremiumPopup";
import { BackToTop } from "@/components/BackToTop";

const FreeContent = () => {
  const navigate = useNavigate();

  const workoutTypes = [
    {
      id: "strength",
      icon: Dumbbell,
      title: "Strength",
      description: "Build muscle and increase power with resistance training",
      duration: "30-45 min",
      difficulty: "Advanced",
      equipment: "Equipment"
    },
    {
      id: "calorie-burning",
      icon: Flame,
      title: "Calorie Burning",
      description: "High-intensity workouts to maximize calorie expenditure",
      duration: "30-45 min",
      difficulty: "Intermediate",
      equipment: "Equipment"
    },
    {
      id: "metabolic",
      icon: Zap,
      title: "Metabolic",
      description: "Boost your metabolism with interval-based training",
      duration: "30-45 min",
      difficulty: "Intermediate",
      equipment: "Equipment"
    },
    {
      id: "cardio",
      icon: Heart,
      title: "Cardio",
      description: "Improve cardiovascular health and endurance",
      duration: "30-45 min",
      difficulty: "Intermediate",
      equipment: "Bodyweight"
    },
    {
      id: "mobility",
      icon: Move,
      title: "Mobility & Stability",
      description: "Enhance flexibility, balance, and joint health",
      duration: "30-45 min",
      difficulty: "Beginner",
      equipment: "Bodyweight"
    },
    {
      id: "challenge",
      icon: Activity,
      title: "Challenge",
      description: "Push your limits with advanced workout challenges",
      duration: "30-45 min",
      difficulty: "Advanced",
      equipment: "Equipment"
    }
  ];

  const programTypes = [
    {
      id: "cardio",
      icon: Heart,
      title: "Cardio Program",
      description: "Improve cardiovascular endurance and heart health",
      duration: "6-8 weeks"
    },
    {
      id: "functional-strength",
      icon: Dumbbell,
      title: "Functional Strength",
      description: "Build strength for everyday movements and activities",
      duration: "6-8 weeks"
    },
    {
      id: "muscle-hypertrophy",
      icon: Activity,
      title: "Muscle Hypertrophy",
      description: "Maximize muscle growth with progressive overload",
      duration: "6-8 weeks"
    },
    {
      id: "weight-loss",
      icon: Scale,
      title: "Weight Loss",
      description: "Burn fat and achieve your ideal body composition",
      duration: "6-8 weeks"
    },
    {
      id: "low-back-pain",
      icon: User,
      title: "Low Back Pain",
      description: "Strengthen and rehabilitate your lower back",
      duration: "6-8 weeks"
    },
    {
      id: "mobility-stability",
      icon: Move,
      title: "Mobility & Stability",
      description: "Enhance flexibility, balance, and joint health",
      duration: "6-8 weeks"
    }
  ];

  const handleWorkoutSelect = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  const handleProgramSelect = (programId: string) => {
    navigate(`/training-program/${programId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PremiumPopup />
      <BackToTop />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Free Workouts & Programs</h1>
        <p className="text-center text-muted-foreground mb-8">
          Filter by your goal and start training today. No login required.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Try these workouts and programs for free — no login required. Want full access?
          </p>
          <Button variant="default" size="sm" onClick={() => navigate("/premium-benefits")}>
            Join Premium
          </Button>
        </div>

        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="workouts">Free Workouts</TabsTrigger>
            <TabsTrigger value="programs">Free Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="workouts">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {workoutTypes.map((workout) => {
                const Icon = workout.icon;
                return (
                  <Card
                    key={workout.id}
                    onClick={() => handleWorkoutSelect(workout.id)}
                    className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{workout.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{workout.description}</p>
                        
                        {/* Metadata Labels */}
                        <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            ⏱️ {workout.duration}
                          </span>
                          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            📊 {workout.difficulty}
                          </span>
                          <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                            🏋️ {workout.equipment}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="programs">
            <div className="mb-4 text-center text-sm text-muted-foreground">
              Designed by Haris Falas — 6–8 week results-based training plans
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {programTypes.map((program) => {
                const Icon = program.icon;
                return (
                  <Card
                    key={program.id}
                    onClick={() => handleProgramSelect(program.id)}
                    className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded">
                          📅 {program.duration}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Email Capture */}
        <div className="mt-12">
          <EmailCaptureBox />
        </div>

        {/* Bottom Premium Banner */}
        <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
          <h3 className="text-xl font-semibold mb-2">Want full access?</h3>
          <p className="text-muted-foreground mb-4">
            Get all programs, workouts, and tools with Smarty Gym Premium.
          </p>
          <Button size="lg" onClick={() => navigate("/premium-benefits")}>
            Join Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FreeContent;
