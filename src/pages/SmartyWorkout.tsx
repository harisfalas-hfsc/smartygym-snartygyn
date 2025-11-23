import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WorkoutGeneratorCard } from "@/components/workout-generator/WorkoutGeneratorCard";

const SmartyWorkout = () => {
  return (
    <>
      <Helmet>
        <title>SmartyWorkout - Create Your Custom Workout | SmartyGym</title>
        <meta name="description" content="Create personalized workouts based on your needs with the SmartyWorkout generator by Coach Haris Falas" />
        <link rel="canonical" href="https://smartygym.com/smartyworkout" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Workouts", href: "/workout" },
            { label: "SmartyWorkout" }
          ]} />

          {/* Title Card */}
          <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
            <div className="p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">SmartyWorkout</h1>
              <div className="space-y-3 text-muted-foreground max-w-3xl mx-auto text-center">
                <p>
                  This is a Smarty Calculator — a comprehensive library built from Coach Haris Falas's extensive knowledge, expertise, and real-world database.
                </p>
                <p>
                  Instead of relying on generic AI, this tool uses actual workout protocols, movement patterns, and training science to design a tailor-made workout that fits your needs, equipment, and characteristics.
                </p>
                <p>
                  Choose your preferences below, and let's get you a workout that works.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Tips Collapsible */}
          <Collapsible className="mb-6">
            <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg">Quick Tips: Valid Input Combinations</h3>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-data-[state=open]:rotate-180">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4 text-sm">
                  
                  {/* Strength Workouts */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-primary">💪</span> Strength Workouts
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Must use "Reps & Sets" format</li>
                      <li>✅ Equipment recommended for best results</li>
                      <li>✅ Any body focus works (Upper, Lower, Full Body)</li>
                      <li>✅ Focus on compound lifts and progressive overload</li>
                    </ul>
                  </div>

                  {/* Calorie Burning */}
                  <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-orange-500">🔥</span> Calorie Burning Workouts
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Use time-based formats (Tabata, Circuit, AMRAP, EMOM, For Time)</li>
                      <li>✅ Bodyweight or light equipment (KB, DB, Bands)</li>
                      <li>⚠️ Full Body or Lower Body recommended</li>
                      <li>❌ "Reps & Sets" not available for this type</li>
                    </ul>
                  </div>

                  {/* Metabolic */}
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-red-500">⚡</span> Metabolic Workouts
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Flexible formats (all time-based options)</li>
                      <li>✅ Mix of bodyweight and equipment exercises</li>
                      <li>✅ High-intensity, moderate rest periods</li>
                      <li>✅ Any body focus works</li>
                    </ul>
                  </div>

                  {/* Cardio */}
                  <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-blue-500">🏃</span> Cardio Workouts
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Use time-based formats only</li>
                      <li>✅ Full Body or Lower Body focus recommended</li>
                      <li>⚠️ Upper Body only may have limited options</li>
                      <li>✅ Includes plyometrics, sprints, and cardio machines</li>
                    </ul>
                  </div>

                  {/* Mobility */}
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-green-500">🧘</span> Mobility & Stability
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Any format works</li>
                      <li>✅ Focus on stretching, flexibility, and balance</li>
                      <li>✅ Bodyweight recommended</li>
                      <li>✅ Suitable for all difficulty levels</li>
                    </ul>
                  </div>

                  {/* Challenge */}
                  <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span className="text-purple-500">🎯</span> Challenge Workouts
                    </h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>✅ Advanced difficulty only</li>
                      <li>✅ Mixed formats and equipment</li>
                      <li>✅ High-intensity, complex movements</li>
                      <li>✅ Full Body focus recommended</li>
                    </ul>
                  </div>

                  {/* General Tips */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-semibold text-foreground mb-2">💡 General Tips</h4>
                    <ul className="space-y-1 text-muted-foreground ml-6">
                      <li>• Longer durations (45-60 min) = more exercises and variety</li>
                      <li>• Equipment = more exercise options and progression potential</li>
                      <li>• Mixed body focus = most versatile workout plans</li>
                      <li>• Beginner difficulty = accessible exercises with clear form cues</li>
                    </ul>
                  </div>

                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Workout Generator */}
          <WorkoutGeneratorCard />
        </div>
      </div>
    </>
  );
};

export default SmartyWorkout;
