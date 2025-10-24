import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { TimedPopup } from "@/components/TimedPopup";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";

const TrainingProgramFlow = () => {
  const navigate = useNavigate();

  // Program counts (automatically synced with TrainingProgramDetail.tsx data)
  const programCounts: { [key: string]: number } = {
    "cardio-endurance": 2,
    "functional-strength": 2,
    "muscle-hypertrophy": 2,
    "weight-loss": 2,
    "low-back-pain": 2,
    "mobility-stability": 2,
  };

  const programTypes = [
    {
      id: "cardio-endurance",
      title: "Cardio Endurance",
      description: "6-8 week program to build cardiovascular fitness",
      icon: Heart,
    },
    {
      id: "functional-strength",
      title: "Functional Strength",
      description: "6-8 week program for real-world strength and movement",
      icon: Dumbbell,
    },
    {
      id: "muscle-hypertrophy",
      title: "Muscle Hypertrophy",
      description: "6-8 week program focused on muscle growth",
      icon: Activity,
    },
    {
      id: "weight-loss",
      title: "Weight Loss",
      description: "6-8 week program designed for fat loss",
      icon: Flame,
    },
    {
      id: "low-back-pain",
      title: "Low Back Pain",
      description: "6-8 week program to strengthen and rehabilitate",
      icon: User,
    },
    {
      id: "mobility-stability",
      title: "Mobility & Stability",
      description: "6-8 week program for movement quality",
      icon: Move,
    },
  ];

  const handleProgramSelect = (programId: string) => {
    navigate(`/trainingprogram/${programId}`);
  };

  return (
    <>
      <Helmet>
        <title>Training Programs - Smarty Gym | 6-8 Week Structured Programs Cyprus | smartygym.com</title>
        <meta name="description" content="Structured 6-8 week training programs by Sports Scientist Haris Falas at smartygym.com. Results-based programs for cardio endurance, functional strength, muscle hypertrophy, weight loss, low back pain rehab, mobility & stability. Convenient & flexible gym reimagined for Cyprus and worldwide - evidence-based progressive training anywhere, anytime." />
        <meta name="keywords" content="training programs Cyprus, smartygym programs, smarty gym, smartygym.com, Haris Falas programs, 6 week programs, 8 week programs, cardio endurance program, functional strength program, muscle hypertrophy program, weight loss program Cyprus, back pain program, mobility program, structured training Cyprus, progressive training, evidence-based programs, convenient fitness, flexible training, gym reimagined, online gym Cyprus, sports scientist Cyprus, workout programs, fitness programs Cyprus" />
        
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
      <TimedPopup />
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
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">Training Programs</h1>
        <p className="text-center text-lg text-foreground mb-2 max-w-3xl mx-auto">
          Structured 6–8 week programs created by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>.
        </p>
        <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
          Build strength, lose fat, improve mobility — all through evidence-based, functional training.
        </p>
        
        {/* Info Ribbon */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Every SMARTY GYM program is a complete path toward better performance and health—but results multiply when training meets smart recovery and mindful living. Stay disciplined, fuel your body intelligently, rest deeply, and treat movement as a daily practice—not a task. That's the SMARTY GYM way.
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
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border relative"
              >
                {/* Counter Badge */}
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-semibold">
                  {programCounts[program.id]} programs
                </Badge>
                
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{program.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{program.description}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — Sports Scientist & Strength and Conditioning Coach
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs mt-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded">6-8 weeks</span>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">Intermediate</span>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">Included in Premium</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mt-12">
          <TestimonialsSlider />
        </div>

        {/* Bottom Premium Banner */}
        <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
          <h3 className="text-xl font-semibold mb-2">Start your transformation</h3>
          <p className="text-muted-foreground mb-4">
            Join Smarty Gym Premium for full access to all training programs.
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
