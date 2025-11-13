import { Dumbbell, BookOpen, Video, Calculator, Scale, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ServicesTemplate = () => {
  const services = [
    { icon: Dumbbell, title: "Workouts", description: "Expert-designed routines" },
    { icon: BookOpen, title: "Training Programs", description: "Structured plans" },
    { icon: Video, title: "Exercise Library", description: "Professional tutorials" },
    { icon: Calculator, title: "1RM Calculator", description: "Track your strength" },
    { icon: Scale, title: "BMR Calculator", description: "Know your metabolism" },
    { icon: Target, title: "Macro Tracker", description: "Hit your goals" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-primary mb-4">Smarty Gym Services</h1>
        <p className="text-2xl text-muted-foreground">Your Gym Re-imagined. Anywhere, Anytime.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-6 flex-1">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index} className="border-primary border-2">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Icon className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-xl font-semibold text-primary">smartygym.com</p>
      </div>
    </div>
  );
};
