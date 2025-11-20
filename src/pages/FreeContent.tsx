import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, Scale, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailCaptureBox } from "@/components/EmailCaptureBox";

import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";

const FreeContent = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  // Free workouts accessible to visitors and logged-in users
  const workoutTypes = [
    {
      id: "strength",
      title: "Strength Training",
      description: "Build muscle and power with bodyweight and resistance exercises",
      icon: Dumbbell,
      duration: "30-60 min",
      difficulty: "Beginner-Advanced",
      equipment: "Bodyweight & Equipment"
    },
    {
      id: "calorie-burning",
      title: "Calorie Burning",
      description: "High-intensity circuits to maximize calorie expenditure",
      icon: Flame,
      duration: "30-60 min",
      difficulty: "Beginner-Advanced",
      equipment: "Bodyweight & Equipment"
    },
    {
      id: "metabolic",
      title: "Metabolic Conditioning",
      description: "Boost metabolism with dynamic conditioning workouts",
      icon: Zap,
      duration: "30-60 min",
      difficulty: "Beginner-Advanced",
      equipment: "Bodyweight & Equipment"
    },
    {
      id: "cardio",
      title: "Cardio",
      description: "Improve cardiovascular endurance and stamina",
      icon: Heart,
      duration: "30-60 min",
      difficulty: "Beginner-Advanced",
      equipment: "Bodyweight & Equipment"
    },
    {
      id: "mobility",
      title: "Mobility & Stability",
      description: "Enhance flexibility, balance, and movement quality",
      icon: Move,
      duration: "30-45 min",
      difficulty: "Beginner-Intermediate",
      equipment: "Bodyweight & Bands"
    },
    {
      id: "power",
      title: "Power & Explosiveness",
      description: "Develop explosive strength and athletic performance",
      icon: Activity,
      duration: "30-60 min",
      difficulty: "Intermediate-Advanced",
      equipment: "Bodyweight & Equipment"
    },
    {
      id: "challenge",
      title: "Challenge Workouts",
      description: "Test your limits with advanced challenge sessions",
      icon: Dumbbell,
      duration: "30-60 min",
      difficulty: "Beginner-Advanced",
      equipment: "Bodyweight & Equipment"
    }
  ];

  // Free training programs
  const programTypes = [
    {
      id: "weight-loss",
      title: "Weight Loss Ignite",
      description: "6-week metabolic fat loss program with circuit training and HIIT",
      icon: Scale,
      duration: "6 weeks"
    }
  ];

  const handleWorkoutSelect = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  const handleProgramSelect = (programId: string) => {
    navigate(`/trainingprogram/${programId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Button>
        )}
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Free Workouts & Programs</h1>
        <p className="text-center text-muted-foreground mb-8">
          Filter by your goal and start training today. No login required.
        </p>
        
        {/* Info Ribbon */}
        {!isPremium && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Try these workouts and programs for free — no login required. Want full access?
            </p>
            <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")} className="cta-button">
              Join Premium
            </Button>
          </div>
        )}

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
              Designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — 6–8 week results-based training plans
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
        {!isPremium && (
          <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
            <h3 className="text-xl font-semibold mb-2">Want full access?</h3>
            <p className="text-muted-foreground mb-4">
              Get all programs, workouts, and tools with Smarty Gym Premium.
            </p>
            <Button size="lg" onClick={() => navigate("/premiumbenefits")} className="cta-button">
              Join Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeContent;
