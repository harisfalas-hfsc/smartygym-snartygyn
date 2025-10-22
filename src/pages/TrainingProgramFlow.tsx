import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

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
    navigate(`/trainingprogram/${programId}`);
  };

  return (
    <>
      <Helmet>
        <title>Training Programs - Smarty Gym | 6-8 Week Programs Cyprus | smartygym.com</title>
        <meta name="description" content="Explore structured training programs designed by sports scientist Haris Falas. 6-8 week results-based plans for convenient, flexible fitness - gym reimagined for anywhere, anytime training.Structured 6-8 week training programs by Sports Scientist Haris Falas. Cardio, strength, hypertrophy, weight loss, mobility programs. Cyprus online fitness expertise." />
        <meta name="keywords" content="training programs Cyprus, workout programs, 6 week programs, 8 week programs, strength programs, weight loss programs, smartygym programs" />
        
        <meta property="og:title" content="Training Programs - Smarty Gym Cyprus" />
        <meta property="og:description" content="Structured training programs designed by Sports Scientist Haris Falas" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/training-program" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Training Programs - Smarty Gym" />
        <meta name="twitter:description" content="Structured training programs designed by Sports Scientist Haris Falas" />
        
        <link rel="canonical" href="https://smartygym.com/training-program" />
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Training Programs</h1>
        <p className="text-center text-muted-foreground mb-4">
          Structured 6–8 week programs designed by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — progressions for strength, fat loss and mobility.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Explore our structured programs — want full access to all programs and workouts?
          </p>
          <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")}>
            Join Premium
          </Button>
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
                    <p className="text-xs text-muted-foreground mb-2">
                      Designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — 6–8 week results-based training plan
                    </p>
                    <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Premium Banner */}
        <div className="bg-card border border-border rounded-xl p-6 mt-12 text-center shadow-soft">
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

export default TrainingProgramFlow;
