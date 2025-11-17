import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, TrendingUp } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ScrollReveal } from "@/components/ScrollReveal";

const WorkoutFlow = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
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
        <title>Online Gym Workouts | AMRAP TABATA HIIT | SmartyGym Cyprus | Haris Falas Fitness</title>
        <meta name="description" content="100+ online gym workouts at smartygym.com - #1 online fitness platform Cyprus. AMRAP, TABATA, HIIT, circuit training by Sports Scientist Haris Falas. Free online workouts + premium gym programs. Train anywhere, anytime." />
        <meta name="keywords" content="online gym workouts, gym workouts online, online fitness workouts, workout programs online, gym Cyprus, smartygym workouts, online gym, smartygym.com, Haris Falas workouts, Haris Falas Cyprus, Cyprus fitness, free gym workouts, AMRAP workouts, TABATA training, HIIT workouts, circuit training workouts, bodyweight training, no equipment gym workouts, strength training workouts, cardio workouts online, metabolic conditioning, mobility training, power workouts, challenge workouts, convenient gym, flexible training, online workouts, functional fitness, home gym workouts, online gym Cyprus, Cyprus gym workouts, virtual gym, digital gym, gym training online, workout training programs" />
        
        <meta property="og:title" content="Workouts - SmartyGym | Fitness Reimagined" />
        <meta property="og:description" content="Convenient & flexible workouts designed by Sports Scientist Haris Falas - train anywhere, anytime" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/workout" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Workouts - SmartyGym" />
        <meta name="twitter:description" content="Convenient & flexible workouts by Haris Falas at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/workout" />
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
            { label: "Workouts" }
          ]} 
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {workoutTypes.map((workout) => {
            const Icon = workout.icon;
            return (
              <ScrollReveal key={workout.id}>
                <Card
                  itemScope
                  itemType="https://schema.org/ExercisePlan"
                  onClick={() => handleWorkoutSelect(workout.id)}
                  className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
                  role="button"
                  aria-label={`${workout.title} workouts - Online gym category at Smarty Gym Cyprus - smartygym.com by Haris Falas`}
                  data-workout-category={workout.id}
                  data-keywords="online gym workouts, smarty gym, online fitness, smartygym.com, Haris Falas Cyprus workouts"
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
                        {workout.title}
                      </h3>
                      <p 
                        className="text-sm text-muted-foreground mb-3"
                        itemProp="description"
                      >
                        {workout.description}
                      </p>
                      <meta itemProp="exerciseType" content={workout.title} />
                      <meta itemProp="provider" content="Smarty Gym Cyprus - Online Gym - smartygym.com" />
                      <meta itemProp="audience" content="All fitness levels" />
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Info Section - About Workouts */}
        <Card className="mt-12 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">About Our Workouts</h2>
            <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto">
              <p className="text-sm sm:text-base">
                Our workouts are single-session training routines designed to fit your lifestyle and goals. 
                Whether you're targeting strength, calorie burning, metabolic conditioning, cardio endurance, 
                mobility & stability, or looking for a challenge — we have you covered.
              </p>
              <p className="text-sm sm:text-base">
                Each workout can be performed with bodyweight only or with equipment, making them perfect for 
                quick training sessions anywhere you are. Hit the gym without a plan? On the go? 
                Our workouts are designed to deliver results in any setting.
              </p>
              <p className="text-sm sm:text-base font-semibold text-foreground text-center mt-6">
                Unlock all workouts with a Premium plan or grab one standalone session whenever you need it.
              </p>
            </div>
          </div>
        </Card>

        {/* Bottom Premium Banner */}
        {!isPremium && (
          <ScrollReveal delay={700}>
            <div className="bg-card border border-border rounded-xl p-6 mt-8 text-center shadow-soft">
              <h3 className="text-xl font-semibold mb-2">Love these workouts?</h3>
              <p className="text-muted-foreground mb-4">
                Unlock 100+ more exclusive sessions with SmartyGym Premium.
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

export default WorkoutFlow;
