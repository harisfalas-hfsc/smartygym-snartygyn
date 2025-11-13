import { Activity, Users, TrendingUp, Sparkles, Shield, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ProgramCategoriesCompositeTemplate = () => {
  const categories = [
    { icon: Activity, name: "Cardio Endurance" },
    { icon: Users, name: "Functional Strength" },
    { icon: TrendingUp, name: "Muscle Hypertrophy" },
    { icon: Sparkles, name: "Weight Loss" },
    { icon: Shield, name: "Low Back Pain Relief" },
    { icon: Waves, name: "Mobility & Stability" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <div className="text-center py-12">
          <h1 className="text-7xl font-bold text-primary mb-4">Program Categories</h1>
          <p className="text-2xl text-muted-foreground">Structured plans for lasting results</p>
        </div>
        
        <CardContent className="flex-1 grid grid-cols-3 gap-6 p-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="border-primary border-2">
                <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                  <div className="p-6 rounded-full bg-primary/10">
                    <Icon className="w-14 h-14 text-primary" />
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
