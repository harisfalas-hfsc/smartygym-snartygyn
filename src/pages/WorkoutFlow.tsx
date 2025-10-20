import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity } from "lucide-react";
import { EmailCaptureBox } from "@/components/EmailCaptureBox";
import { PremiumPopup } from "@/components/PremiumPopup";
import { BackToTop } from "@/components/BackToTop";

const WorkoutFlow = () => {
  const navigate = useNavigate();

  const workoutTypes = [
    {
      id: "strength",
      icon: Dumbbell,
      title: "Strength",
      description: "Build muscle and increase power with resistance training"
    },
    {
      id: "calorie-burning",
      icon: Flame,
      title: "Calorie Burning",
      description: "High-intensity workouts to maximize calorie expenditure"
    },
    {
      id: "metabolic",
      icon: Zap,
      title: "Metabolic",
      description: "Boost your metabolism with interval-based training"
    },
    {
      id: "cardio",
      icon: Heart,
      title: "Cardio",
      description: "Improve cardiovascular health and endurance"
    },
    {
      id: "mobility",
      icon: Move,
      title: "Mobility & Stability",
      description: "Enhance flexibility, balance, and joint health"
    },
    {
      id: "challenge",
      icon: Activity,
      title: "Challenge",
      description: "Push your limits with advanced workout challenges"
    }
  ];

  const handleWorkoutSelect = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  return (
    <>
      <Helmet>
        <title>Workouts - Smarty Gym | Convenient & Flexible Training by Haris Falas</title>
        <meta name="description" content="Free online workouts by Haris Falas at smartygym.com - convenient & flexible gym reimagined. Strength, cardio, metabolic, mobility training anywhere, anytime." />
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Workouts</h1>
        <p className="text-center text-muted-foreground mb-4">
          Standalone workout sessions designed to challenge you, motivate you, and make you sweat — crafted by Sports Scientist Haris Falas.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Try these workouts for free — no login required. Want all programs?
          </p>
          <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")}>
            Join Premium
          </Button>
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
                    <h3 className="font-semibold text-lg mb-2">{workout.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{workout.description}</p>
                    
                    {/* Metadata Labels */}
                    <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        ⏱️ 30-45 min
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        📊 {workout.id === 'strength' || workout.id === 'challenge' ? 'Advanced' : workout.id === 'mobility' ? 'Beginner' : 'Intermediate'}
                      </span>
                      <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        {workout.id === 'cardio' || workout.id === 'mobility' ? '🤸 Bodyweight' : '🏋️ Equipment'}
                      </span>
                    </div>
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
