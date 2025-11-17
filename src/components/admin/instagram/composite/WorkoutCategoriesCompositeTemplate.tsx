import { Dumbbell, Heart, Flame, Zap, Trophy, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WorkoutCategoriesCompositeTemplate = () => {
  const categories = [
    { icon: Dumbbell, name: "Strength" },
    { icon: Heart, name: "Cardio" },
    { icon: Flame, name: "Calorie Burning" },
    { icon: Zap, name: "Metabolic" },
    { icon: Waves, name: "Mobility" },
    { icon: Trophy, name: "Challenge" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <div className="text-center py-10">
          <h1 className="text-7xl font-bold text-primary mb-4">Workout Categories</h1>
          <p className="text-2xl text-muted-foreground">Find your perfect workout</p>
        </div>
        
        <CardContent className="flex-1 grid grid-cols-3 gap-5 p-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="border-primary border-2">
                <CardContent className="flex flex-col items-center justify-center gap-3 p-5">
                  <div className="p-5 rounded-full bg-primary/10">
                    <Icon className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">{category.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>

        <div className="text-center py-8">
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </div>
      </Card>
    </div>
  );
};
