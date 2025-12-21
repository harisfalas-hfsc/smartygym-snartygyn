import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Move, Activity, CalendarCheck, Star, Clock, Crown, ChevronRight, Target } from "lucide-react";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { generateBreadcrumbSchema } from "@/utils/seoHelpers";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const WorkoutFlow = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const isMobile = useIsMobile();
  const [currentWodIndex, setCurrentWodIndex] = useState(0);

  // Fetch WODs from Supabase
  const { data: wods, isLoading: wodsLoading } = useQuery({
    queryKey: ["wod-workout-page-banner"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from("admin_workouts")
        .select("id, name, category, focus, difficulty_stars, duration, image_url, equipment, is_premium, type")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", today)
        .limit(2);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Rotate WODs every 4 seconds
  useEffect(() => {
    if (!wods || wods.length < 2) return;
    const interval = setInterval(() => {
      setCurrentWodIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, [wods]);

  // Helper functions
  const getDifficultyLabel = (stars: number | null) => {
    if (!stars) return "Beginner";
    if (stars <= 2) return "Beginner";
    if (stars <= 4) return "Intermediate";
    return "Advanced";
  };

  const renderStars = (count: number | null) => {
    const starCount = count || 1;
    return Array.from({ length: Math.min(starCount, 6) }).map((_, i) => (
      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    ));
  };

  // Static workout types (excluding WOD since we have the rotating card)
  const workoutTypes = [{
    id: "strength",
    title: "Strength",
    description: "Build muscle and power with resistance training",
    icon: Dumbbell,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "calorie-burning",
    title: "Calorie Burning",
    description: "High-intensity workouts to maximize calorie burn",
    icon: Flame,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "metabolic",
    title: "Metabolic",
    description: "Boost your metabolism with dynamic conditioning",
    icon: Zap,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "cardio",
    title: "Cardio",
    description: "Improve cardiovascular endurance and stamina",
    icon: Heart,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "mobility",
    title: "Mobility & Stability",
    description: "Enhance flexibility and movement quality",
    icon: Move,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }, {
    id: "challenge",
    title: "Challenge",
    description: "Push your limits with advanced workouts",
    icon: Activity,
    level: "Beginner-Advanced",
    equipment: "Equipment/No Equipment"
  }];

  const handleWorkoutSelect = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  return (
    <>
      <Helmet>
        <title>Online Workouts | AMRAP TABATA HIIT Strength Cardio | Haris Falas | SmartyGym</title>
        <meta name="description" content="500+ online gym workouts at smartygym.com. AMRAP, TABATA, HIIT, circuit training, strength, cardio, metabolic, mobility workouts by Sports Scientist Haris Falas. Home workouts, bodyweight training, equipment workouts. Train anywhere, anytime." />
        <meta name="keywords" content="online gym, online workouts, gym workouts, home workouts, online fitness, HFSC, Haris Falas, Sports Scientist, AMRAP workouts, TABATA training, HIIT workouts, circuit training, strength training workouts, cardio workouts, bodyweight training, metabolic training, mobility training, calorie burning workouts, challenge workouts, smartygym.com, workout of the day, WOD" />
        
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/workout" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/workout" />
        <link rel="canonical" href="https://smartygym.com/workout" />
        
        <meta property="og:title" content="500+ Online Workouts | AMRAP TABATA HIIT | SmartyGym by Haris Falas" />
        <meta property="og:description" content="Professional workout library by Sports Scientist Haris Falas - Strength, Cardio, Metabolic, Mobility workouts. Train anywhere, anytime." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/workout" />
        <meta property="og:image" content="https://smartygym.com/smarty-gym-logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="500+ Online Workouts | SmartyGym" />
        <meta name="twitter:description" content="Expert workouts by Haris Falas - AMRAP, TABATA, HIIT, strength, cardio at smartygym.com" />
        <meta name="twitter:image" content="https://smartygym.com/smarty-gym-logo.png" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "SmartyGym Workout Library",
            "description": "500+ expert-designed workouts including AMRAP, TABATA, HIIT, strength, cardio, metabolic, and mobility sessions by Sports Scientist Haris Falas",
            "url": "https://smartygym.com/workout",
            "numberOfItems": 500,
            "mainEntity": {
              "@type": "ItemList",
              "name": "Workout Categories",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Workout of the Day", "url": "https://smartygym.com/workout/wod" },
                { "@type": "ListItem", "position": 2, "name": "Strength Workouts", "url": "https://smartygym.com/workout/strength" },
                { "@type": "ListItem", "position": 3, "name": "Calorie Burning Workouts", "url": "https://smartygym.com/workout/calorie-burning" },
                { "@type": "ListItem", "position": 4, "name": "Metabolic Workouts", "url": "https://smartygym.com/workout/metabolic" },
                { "@type": "ListItem", "position": 5, "name": "Cardio Workouts", "url": "https://smartygym.com/workout/cardio" },
                { "@type": "ListItem", "position": 6, "name": "Mobility & Stability", "url": "https://smartygym.com/workout/mobility" },
                { "@type": "ListItem", "position": 7, "name": "Challenge Workouts", "url": "https://smartygym.com/workout/challenge" }
              ]
            },
            "author": { "@type": "Person", "name": "Haris Falas", "jobTitle": "Sports Scientist" },
            "provider": { "@type": "Organization", "name": "SmartyGym", "url": "https://smartygym.com" }
          })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema([{ name: "Home", url: "/" }, { name: "Workouts", url: "/workout" }]))}
        </script>
      </Helmet>
      
      <SEOEnhancer 
        entities={["SmartyGym", "Haris Falas", "Online Workouts", "AMRAP", "HIIT", "Tabata", "Circuit Training"]} 
        topics={["online gym workouts", "AMRAP", "HIIT", "Tabata", "circuit training", "strength training", "cardio workouts", "metabolic conditioning", "mobility training"]} 
        expertise={["sports science", "strength conditioning", "functional fitness", "exercise programming"]} 
        contentType="workout-collection" 
        aiSummary="SmartyGym Workout Library: 500+ online gym workouts by Sports Scientist Haris Falas. Categories include Workout of the Day (WOD), Strength, Calorie Burning, Metabolic, Cardio, Mobility & Stability, and Challenge. Formats include AMRAP, TABATA, HIIT, Circuit, EMOM, For Time. Suitable for all levels worldwide." 
        aiKeywords={["online gym", "AMRAP workouts", "HIIT training", "Tabata", "strength workouts", "cardio training", "home workouts", "bodyweight workouts", "gym workouts"]} 
        relatedContent={["training programs", "fitness tools", "exercise library", "workout of the day"]} 
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 pb-8">
          {canGoBack && (
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Back</span>
              </Button>
            </div>
          )}
          
          <PageBreadcrumbs items={[{
            label: "Home",
            href: "/"
          }, {
            label: "Smarty Workouts"
          }]} />

          {/* Info Section - About Smarty Workouts */}
          <Card className="mb-8 bg-white dark:bg-card border-2 border-primary/40 shadow-primary">
            <div className="p-4 sm:p-5">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 text-center">About Smarty Workouts</h2>
              <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
                {isMobile ? (
                  <p className="text-sm text-center">
                    <span className="text-primary font-semibold">Smarty Workouts</span> are single-session training routines designed to fit your lifestyle and goals. Hit the gym without a plan? In the home? On the go? <span className="text-primary font-semibold">Smarty Workouts</span> are designed to deliver results in any setting. Unlock all workouts with a Premium plan, or grab one standalone session whenever you need it.
                  </p>
                ) : (
                  <>
                    <p className="text-sm sm:text-base text-center">
                      <span className="text-primary font-semibold">Smarty Workouts</span> are single-session training routines designed to fit your lifestyle and goals. Whether you're targeting strength, calorie burning, metabolic conditioning, cardio endurance, mobility & stability, or looking for a challenge — we have you covered. Hit the gym without a plan? In the home? On the go? <span className="text-primary font-semibold">Smarty Workouts</span> are designed to deliver results in any setting.
                    </p>
                    
                    <p className="text-sm sm:text-base font-semibold text-foreground text-center mt-6">
                      Unlock all workouts with a Premium plan or grab one standalone session whenever you need it.
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* WOD Card - Matches homepage banner exactly */}
            <ScrollReveal>
              <div 
                onClick={() => navigate("/workout/wod")}
                className="cursor-pointer group border-2 border-primary/60 rounded-xl 
                           hover:border-primary hover:shadow-2xl hover:shadow-primary/40 hover:scale-110 hover:-translate-y-3 
                           transition-all duration-500 ease-out transform-gpu
                           flex flex-col h-full overflow-hidden bg-card"
                role="button"
                aria-label="Workout of the Day - Today's featured workouts at SmartyGym"
              >
                {/* Header: Workout of the Day with icon */}
                <div className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500/10 to-primary/10 border-b border-green-500/30">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">Workout of the Day</span>
                </div>
                
                {/* WOD Card Content - smooth crossfade between WODs */}
                <div className="flex-1 relative overflow-hidden min-h-[200px]">
                  {wodsLoading ? (
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ) : wods && wods.length > 0 ? (
                    wods.slice(0, 2).map((wod, index) => (
                      <div 
                        key={wod.id}
                        className={cn(
                          "absolute inset-0 flex flex-col transition-opacity duration-700 ease-in-out",
                          index === currentWodIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        )}
                      >
                        {/* Image Section */}
                        <div className="relative h-[140px] overflow-hidden bg-muted">
                          {wod.image_url ? (
                            <img 
                              src={wod.image_url} 
                              alt={wod.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Dumbbell className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                          )}
                          {/* Equipment Badge */}
                          <div className="absolute top-2 left-2">
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                              wod.equipment?.toLowerCase().includes("none") || wod.equipment?.toLowerCase().includes("bodyweight")
                                ? "bg-emerald-500 text-white"
                                : "bg-blue-500 text-white"
                            )}>
                              {wod.equipment?.toLowerCase().includes("none") || wod.equipment?.toLowerCase().includes("bodyweight") 
                                ? "Bodyweight" 
                                : "Equipment"}
                            </span>
                          </div>
                          {/* Premium Badge */}
                          {wod.is_premium && (
                            <div className="absolute top-2 right-2">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-0.5">
                                <Crown className="w-2.5 h-2.5" />
                                Premium
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content Section */}
                        <div className="flex-1 p-3 flex flex-col justify-between">
                          {/* Workout Name */}
                          <p className="text-sm font-bold text-foreground line-clamp-1">{wod.name}</p>
                          
                          {/* Badge-style metadata pills - matching other cards */}
                          <div className="flex flex-wrap gap-1 text-[10px] mt-auto">
                            {wod.type && (
                              <span className="bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 rounded-full uppercase font-medium">
                                {wod.type}
                              </span>
                            )}
                            {wod.difficulty_stars && (
                              <span className="bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded-full uppercase font-medium">
                                {getDifficultyLabel(wod.difficulty_stars)}
                              </span>
                            )}
                            {wod.category && (
                              <span className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded-full uppercase font-medium">
                                {wod.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4">
                      <Dumbbell className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Fresh workouts coming soon!</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Static Workout Cards */}
            {workoutTypes.map(workout => {
              const Icon = workout.icon;
              return (
                <ScrollReveal key={workout.id}>
                  <Card 
                    itemScope 
                    itemType="https://schema.org/ExercisePlan" 
                    onClick={() => handleWorkoutSelect(workout.id)} 
                    className="group p-6 cursor-pointer transition-all duration-500 ease-out transform-gpu hover:scale-110 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/40 hover:border-primary/60 bg-card border-2 border-border" 
                    role="button" 
                    aria-label={`${workout.title} workouts - Online gym category at SmartyGym - smartygym.com by Haris Falas`} 
                    data-workout-category={workout.id} 
                    data-keywords="online gym workouts, smarty gym, online fitness, smartygym.com, Haris Falas workouts"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                        <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-3" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2" itemProp="name">
                          {workout.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3" itemProp="description">
                          {workout.description}
                        </p>
                        <p className="text-xs text-muted-foreground/80 italic">
                          Crafted by{" "}
                          <a href="/coach-profile" className="text-primary hover:underline font-medium whitespace-nowrap" onClick={e => e.stopPropagation()}>
                            Haris Falas
                          </a>
                          {" "}BSc Sports Science, EXOS Specialist, CSCS
                        </p>
                        
                        <div className="flex gap-1 text-[10px] mt-2">
                          <span className="bg-primary/20 text-primary border border-primary/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            Single Session
                          </span>
                          <span className="bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {workout.level}
                          </span>
                          <span className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            {workout.equipment}
                          </span>
                        </div>
                        
                        <meta itemProp="exerciseType" content={workout.title} />
                        <meta itemProp="provider" content="Smarty Gym - Online Gym - smartygym.com" />
                        <meta itemProp="audience" content="All fitness levels" />
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
                  Unlock 500+ more exclusive sessions with SmartyGym Premium.
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