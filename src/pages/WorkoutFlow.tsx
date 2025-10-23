import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, TrendingUp } from "lucide-react";
import { EmailCaptureBox } from "@/components/EmailCaptureBox";
import { BackToTop } from "@/components/BackToTop";

const WorkoutFlow = () => {
  const navigate = useNavigate();

  const workoutTypes = [
    {
      id: "strength",
      title: "Strength",
      description: "Build muscle and power with resistance training",
      icon: Dumbbell,
    },
    {
      id: "calorie-burning",
      title: "Calorie Burning",
      description: "High-intensity workouts to maximize calorie burn",
      icon: Flame,
    },
    {
      id: "metabolic",
      title: "Metabolic",
      description: "Boost your metabolism with dynamic conditioning",
      icon: Zap,
    },
    {
      id: "cardio",
      title: "Cardio",
      description: "Improve cardiovascular endurance and stamina",
      icon: Heart,
    },
    {
      id: "mobility",
      title: "Mobility & Stability",
      description: "Enhance flexibility and movement quality",
      icon: Move,
    },
    {
      id: "power",
      title: "Power",
      description: "Explosive movements for athletic performance",
      icon: TrendingUp,
    },
    {
      id: "challenge",
      title: "Challenge",
      description: "Push your limits with advanced workouts",
      icon: Activity,
    },
  ];

  const handleWorkoutSelect = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  return (
    <>
      <Helmet>
        <title>Workouts - Smarty Gym | Convenient & Flexible Training by Haris Falas</title>
        <meta name="description" content="Browse standalone workout sessions designed to challenge and motivate you. Functional fitness workouts by certified sports scientist Haris Falas - convenient training anywhere, anytime.Free online workouts by Haris Falas at smartygym.com - convenient & flexible gym reimagined. Strength, cardio, metabolic, mobility training anywhere, anytime." />
        <meta name="keywords" content="smartygym workouts, smarty gym, smartygym.com, Haris Falas, free workouts, convenient fitness, flexible training, gym reimagined, online workouts, strength training, cardio workouts" />
        
        <meta property="og:title" content="Workouts - Smarty Gym | Fitness Reimagined" />
        <meta property="og:description" content="Convenient & flexible workouts designed by Sports Scientist Haris Falas - train anywhere, anytime" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/workout" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Workouts - Smarty Gym" />
        <meta name="twitter:description" content="Convenient & flexible workouts by Haris Falas at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/workout" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Workouts</h1>
        <p className="text-center text-muted-foreground mb-4">
          Standalone workout sessions designed to challenge you, motivate you, and make you sweat — crafted by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Free workouts included. Join premium to unlock everything.
          </p>
          <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")}>
            Join Premium
          </Button>
          <button 
            onClick={() => navigate("/premium-comparison")}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline mt-1"
          >
            Why Premium?
          </button>
        </div>
        
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
                    <p className="text-xs text-muted-foreground mb-2">
                      Designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — Results-based training plan
                    </p>
                    <h3 className="font-semibold text-lg mb-2">{workout.title}</h3>
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

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
          <Button size="lg" onClick={() => navigate("/premiumbenefits")}>
            Join Premium
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default WorkoutFlow;
