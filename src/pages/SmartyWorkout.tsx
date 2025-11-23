import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card } from "@/components/ui/card";
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

          {/* Workout Generator */}
          <WorkoutGeneratorCard />
        </div>
      </div>
    </>
  );
};

export default SmartyWorkout;
