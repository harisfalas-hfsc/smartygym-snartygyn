import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="text-xs sm:text-sm">Back to Home</span>
        </Button>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Workouts</h1>
        <p className="text-center text-muted-foreground mb-8">Choose your workout type</p>
        
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
                    <p className="text-sm text-muted-foreground">{workout.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutFlow;
