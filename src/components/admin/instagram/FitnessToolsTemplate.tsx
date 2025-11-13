import { Calculator, Scale, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FitnessToolsTemplate = () => {
  const tools = [
    {
      icon: Calculator,
      title: "1RM Calculator",
      description: "Calculate your one-rep max to track strength progress and optimize your training intensity",
    },
    {
      icon: Scale,
      title: "BMR Calculator",
      description: "Discover your Basal Metabolic Rate to understand your daily calorie needs",
    },
    {
      icon: Target,
      title: "Macro Tracker",
      description: "Calculate your optimal macro distribution to fuel your fitness goals effectively",
    },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-primary mb-4">Smart Fitness Tools</h1>
        <p className="text-2xl text-muted-foreground">Free calculators to optimize your training</p>
      </div>

      <div className="space-y-8 flex-1">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card key={index} className="border-primary border-2">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">{tool.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
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
