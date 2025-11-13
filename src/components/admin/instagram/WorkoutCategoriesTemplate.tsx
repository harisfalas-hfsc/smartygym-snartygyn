import { Flame, Zap, Activity, Dumbbell, Heart, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WorkoutCategoriesTemplate = () => {
  const categories = [
    { icon: Dumbbell, name: "Strength" },
    { icon: Flame, name: "Calorie Burning" },
    { icon: Zap, name: "Metabolic" },
    { icon: Activity, name: "HIIT" },
    { icon: Heart, name: "Cardio" },
    { icon: Timer, name: "EMOM" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-primary mb-4">Workout Variety</h1>
        <p className="text-2xl text-muted-foreground">Every workout style you need</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="border-primary border-2 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <div className="mx-auto mb-6 p-6 rounded-full bg-primary/10 w-fit">
                  <Icon className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">{category.name}</h3>
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
