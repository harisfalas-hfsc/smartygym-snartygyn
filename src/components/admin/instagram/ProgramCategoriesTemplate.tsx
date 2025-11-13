import { TrendingUp, Users, Target, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ProgramCategoriesTemplate = () => {
  const categories = [
    { icon: TrendingUp, name: "Muscle Hypertrophy", description: "Build serious muscle mass" },
    { icon: Users, name: "Functional Strength", description: "Real-world performance" },
    { icon: Target, name: "Cardio Endurance", description: "Boost your stamina" },
    { icon: Sparkles, name: "Weight Loss", description: "Sustainable fat loss" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-primary mb-4">Training Programs</h1>
        <p className="text-2xl text-muted-foreground">Structured plans for every goal</p>
      </div>

      <div className="space-y-6 flex-1">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="border-primary border-2">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="p-5 rounded-full bg-primary/10">
                  <Icon className="w-14 h-14 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold mb-2">{category.name}</h3>
                  <p className="text-xl text-muted-foreground">{category.description}</p>
                </div>
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
