import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTitleCard } from "@/components/PageTitleCard";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale, Target } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { TimedPopup } from "@/components/TimedPopup";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";

const TrainingProgramFlow = () => {
  const navigate = useNavigate();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

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
        <title>Training Programs - SmartyGym | Online Fitness Programs | smartygym.com</title>
        <meta name="description" content="SmartyGym online fitness: Structured 6-8 week training programs by Sports Scientist Haris Falas at smartygym.com. Programs for cardio, strength, muscle growth, weight loss, mobility. Your convenient online gym for Cyprus and worldwide." />
        <meta name="keywords" content="smartygym programs, online fitness programs, smartygym, smartygym.com, online gym programs, training programs, Haris Falas programs, 6 week programs, 8 week programs, cardio endurance, functional strength, muscle hypertrophy, weight loss program, back pain program, mobility program, structured training, progressive training, evidence-based programs, convenient fitness, flexible training, online gym, sports scientist, workout programs, fitness programs" />
        
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
        
        <PageTitleCard 
          title="Training Programs" 
          subtitle="Purchase individual programs or unlock unlimited access with a premium plan"
          icon={Target}
        />
        <p className="text-center text-muted-foreground mb-4 max-w-3xl mx-auto text-sm sm:text-base px-2">
          Structured 6–8 week training programs created by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> at smartygym.com. Build strength, lose fat, improve mobility — SmartyGym delivers evidence-based functional training anywhere, anytime.
        </p>
        
        {/* Info Ribbon */}
        {!isPremium && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              Every SMARTY GYM program is a complete path toward better performance and health—but results multiply when training meets smart recovery and mindful living. Stay disciplined, fuel your body intelligently, rest deeply, and treat movement as a daily practice—not a task. That's the SMARTY GYM way.
            </p>
            <Button variant="default" size="sm" onClick={() => navigate("/premiumbenefits")} className="text-xs sm:text-sm">
              Join Premium
            </Button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {programTypes.map((program, index) => {
            const Icon = program.icon;
            return (
              <ScrollReveal key={program.id} delay={index * 100}>
                <Card
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
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Premium Banner */}
        {!isPremium && (
          <ScrollReveal delay={600}>
            <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Start your transformation</h3>
              <p className="text-muted-foreground mb-4">
                Join Smarty Gym Premium for full access to all training programs.
              </p>
              <Button size="lg" onClick={() => navigate("/premiumbenefits")}>
                Join Premium
              </Button>
            </div>
          </ScrollReveal>
        )}
      </div>
      </div>
    </>
  );
};

export default TrainingProgramFlow;
