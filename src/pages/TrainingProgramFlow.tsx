import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Heart, Dumbbell, Activity, Flame, User, Move, Scale } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ScrollReveal } from "@/components/ScrollReveal";

const TrainingProgramFlow = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  const programTypes = [
    {
      id: "cardio-endurance",
      title: "Cardio Endurance",
      description: "Structured program to build cardiovascular fitness",
      icon: Heart,
    },
    {
      id: "functional-strength",
      title: "Functional Strength",
      description: "Structured program for real-world strength and movement",
      icon: Dumbbell,
    },
    {
      id: "muscle-hypertrophy",
      title: "Muscle Hypertrophy",
      description: "Structured program focused on muscle growth",
      icon: Activity,
    },
    {
      id: "weight-loss",
      title: "Weight Loss",
      description: "Structured program designed for fat loss",
      icon: Flame,
    },
    {
      id: "low-back-pain",
      title: "Low Back Pain",
      description: "Structured program to strengthen and rehabilitate",
      icon: User,
    },
    {
      id: "mobility-stability",
      title: "Mobility & Stability",
      description: "Structured program for movement quality",
      icon: Move,
    },
  ];

  const handleProgramSelect = (programId: string) => {
    navigate(`/trainingprogram/${programId}`);
  };

  return (
    <>
      <Helmet>
        <title>Online Gym Training Programs | Structured Plans | SmartyGym Cyprus | Haris Falas</title>
        <meta name="description" content="Structured online gym training programs at smartygym.com - Cyprus' #1 online fitness. Long-term programs by Sports Scientist Haris Falas: cardio, strength, muscle growth, weight loss, mobility. Gym programs online for anywhere, anytime training." />
        <meta name="keywords" content="online gym training programs, gym training programs, training programs online, online fitness programs, gym programs online, workout training programs, smartygym programs, online gym, smartygym.com, online gym Cyprus, gym Cyprus, Haris Falas programs, Haris Falas Cyprus, Cyprus fitness programs, structured training programs, long-term training programs, cardio endurance programs, functional strength training, muscle hypertrophy programs, online gym weight loss program, back pain program, mobility training program, structured gym training, progressive training programs, evidence-based gym programs, convenient fitness programs, flexible gym training, virtual gym programs, sports scientist programs, workout programs online, fitness training programs" />
        
        <meta property="og:title" content="Training Programs - SmartyGym.com" />
        <meta property="og:description" content="Structured training programs designed by Sports Scientist Haris Falas" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/training-program" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Training Programs - SmartyGym" />
        <meta name="twitter:description" content="Structured training programs designed by Sports Scientist Haris Falas" />
        
        <link rel="canonical" href="https://smartygym.com/training-program" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <BackToTop />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {canGoBack && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          </div>
        )}
        
        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Training Programs" }
          ]} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {programTypes.map((program) => {
            const Icon = program.icon;
            return (
              <ScrollReveal key={program.id}>
                <Card
                  itemScope
                  itemType="https://schema.org/Course"
                  onClick={() => handleProgramSelect(program.id)}
                  className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                  role="button"
                  aria-label={`${program.title} training program - Online gym program at Smarty Gym Cyprus - smartygym.com by Haris Falas`}
                  data-program-category={program.id}
                  data-keywords="online gym training programs, workout training programs, smarty gym, online fitness programs, smartygym.com, Haris Falas Cyprus"
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div 
                      className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 
                        className="font-semibold text-lg mb-2"
                        itemProp="name"
                      >
                        {program.title}
                      </h3>
                      <p 
                        className="text-sm text-muted-foreground mb-3"
                        itemProp="description"
                      >
                        {program.description}
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        By <a href="/coach-profile" className="text-primary hover:underline font-medium" itemProp="instructor">Haris Falas</a>
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs mt-2">
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded" itemProp="duration">4-12 weeks</span>
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded">Intermediate</span>
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded">Included in Premium</span>
                      </div>
                      <meta itemProp="provider" content="Smarty Gym Cyprus - Online Gym - smartygym.com" />
                      <meta itemProp="courseMode" content="Online" />
                      <meta itemProp="availableLanguage" content="English" />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Info Section - About Training Programs */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">About Our Training Programs</h2>
            <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto">
              <p className="text-sm sm:text-base">
                Our training programs are long-term, structured plans designed to help you achieve your specific 
                fitness goals. Whether you want to lose weight, build muscle, improve functional strength, 
                enhance cardiovascular endurance, rehabilitate from low back pain, or develop better mobility 
                and stability — we have a science-based program for you.
              </p>
              <p className="text-sm sm:text-base">
                Each program is meticulously crafted by Sports Scientist Haris Falas, using evidence-based 
                training principles and progressive programming to ensure sustainable results. These aren't 
                just random workouts — they're strategic, periodized plans that take you from where you are 
                to where you want to be.
              </p>
              <p className="text-sm sm:text-base font-semibold text-foreground text-center mt-6">
                Unlock all training programs with a Premium plan or grab one standalone program to start your journey.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom Premium Banner */}
        {!isPremium && (
          <ScrollReveal delay={600}>
            <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Start your transformation</h3>
              <p className="text-muted-foreground mb-4">
                Join SmartyGym Premium for full access to all training programs.
              </p>
              <Button size="lg" onClick={() => navigate("/premiumbenefits")} className="cta-button">
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
