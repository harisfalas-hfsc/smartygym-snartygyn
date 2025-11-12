import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTitleCard } from "@/components/PageTitleCard";
import { InfoRibbon } from "@/components/InfoRibbon";
import { DecorativeDivider } from "@/components/DecorativeDivider";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, TrendingUp } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { TimedPopup } from "@/components/TimedPopup";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";

const WorkoutFlow = () => {
  const navigate = useNavigate();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

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
        <title>Workouts - SmartyGym | Online Fitness | Free AMRAP TABATA HIIT | smartygym.com</title>
        <meta name="description" content="Browse 60+ SmartyGym online fitness workouts at smartygym.com - AMRAP, TABATA, HIIT by Sports Scientist Haris Falas. Free bodyweight & equipment workouts: strength, cardio, metabolic, mobility. Your convenient online fitness solution for Cyprus and worldwide." />
        <meta name="keywords" content="smartygym workouts, online fitness workouts, smartygym, smartygym.com, online gym, Haris Falas workouts, free workouts, AMRAP workouts, TABATA training, HIIT workouts, circuit training, bodyweight training, no equipment workouts, strength training, cardio workouts, metabolic conditioning, mobility training, power workouts, challenge workouts, convenient fitness, flexible training, online workouts, functional fitness, home workouts, online gym Cyprus" />
        
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
      <TimedPopup />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="h-10 mb-6 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back</span>
          </Button>
        </div>
        
        <PageTitleCard 
          title="Workouts" 
          subtitle="Purchase individual workouts or unlock unlimited access with a premium plan"
          icon={Dumbbell}
        />
        
        {!isPremium ? (
          <InfoRibbon ctaText="Join Premium" onCtaClick={() => navigate("/premiumbenefits")}>
            <p>
              Choose your goal and start your fitness journey today. All SmartyGym workouts designed by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> for convenient online fitness training anywhere, anytime.
            </p>
            <p className="mt-2">
              SMARTY GYM workouts are standalone sessions designed to target specific fitness goals—whether you want to build strength, torch calories, boost your metabolism, get a quick sweat, or simply keep your body moving. Each workout is crafted to fit your schedule and deliver results, no matter where you train.
            </p>
          </InfoRibbon>
        ) : (
          <InfoRibbon>
            <p>
              All workouts included in your premium membership. Choose your goal and start training today with unlimited access to every workout.
            </p>
          </InfoRibbon>
        )}

        <DecorativeDivider className="my-12" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workoutTypes.map((workout) => {
            const Icon = workout.icon;
            return (
              <ScrollReveal key={workout.id}>
                <Card
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
                      <p className="text-xs text-muted-foreground mb-3">
                        Created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — Sports Scientist & Strength and Conditioning Coach
                      </p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom Premium Banner */}
        {!isPremium && (
          <ScrollReveal delay={700}>
            <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Love these workouts?</h3>
              <p className="text-muted-foreground mb-4">
                Unlock 100+ more exclusive sessions with Smarty Gym Premium.
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

export default WorkoutFlow;
