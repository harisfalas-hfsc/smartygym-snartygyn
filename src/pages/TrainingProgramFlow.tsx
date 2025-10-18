import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale } from "lucide-react";

const TrainingProgramFlow = () => {
  const navigate = useNavigate();

  const programTypes = [
    {
      id: "cardio",
      icon: Heart,
      title: "Cardio",
      description: "Improve cardiovascular endurance and heart health"
    },
    {
      id: "functional-strength",
      icon: Dumbbell,
      title: "Functional Strength",
      description: "Build strength for everyday movements and activities"
    },
    {
      id: "muscle-hypertrophy",
      icon: Activity,
      title: "Muscle Hypertrophy",
      description: "Maximize muscle growth with progressive overload"
    },
    {
      id: "weight-loss",
      icon: Scale,
      title: "Weight Loss",
      description: "Burn fat and achieve your ideal body composition"
    },
    {
      id: "low-back-pain",
      icon: User,
      title: "Low Back Pain",
      description: "Strengthen and rehabilitate your lower back"
    },
    {
      id: "mobility-stability",
      icon: Move,
      title: "Mobility & Stability",
      description: "Enhance flexibility, balance, and joint health"
    }
  ];

  const handleProgramSelect = (programId: string) => {
    navigate(`/training-program/${programId}`);
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Training Programs</h1>
        <p className="text-center text-muted-foreground mb-8">Choose your training program type</p>
        
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
                    <p className="text-sm text-muted-foreground">{program.description}</p>
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

export default TrainingProgramFlow;
