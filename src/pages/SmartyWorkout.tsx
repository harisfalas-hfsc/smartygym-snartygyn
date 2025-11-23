import { Helmet } from "react-helmet";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { Card } from "@/components/ui/card";

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

          <Card className="p-6">
            <h1 className="text-3xl font-bold mb-4">SmartyWorkout Generator</h1>
            <p className="text-muted-foreground">
              Content coming soon - you'll tell me what goes here next!
            </p>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SmartyWorkout;
