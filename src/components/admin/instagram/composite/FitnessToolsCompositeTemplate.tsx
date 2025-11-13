import { Calculator, Target, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FitnessToolsCompositeTemplate = () => {
  const tools = [
    { icon: Calculator, name: "1RM Calculator", desc: "Track your strength progress" },
    { icon: Target, name: "Macro Tracker", desc: "Optimize your nutrition" },
    { icon: Scale, name: "BMR Calculator", desc: "Know your calorie needs" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <div className="text-center py-16">
          <h1 className="text-7xl font-bold text-primary mb-4">Fitness Tools</h1>
          <p className="text-2xl text-muted-foreground">Professional calculators for your goals</p>
        </div>
        
        <CardContent className="flex-1 grid grid-cols-3 gap-8 p-12">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card key={index} className="border-primary border-2">
                <CardContent className="flex flex-col items-center justify-center gap-6 p-8">
                  <div className="p-8 rounded-full bg-primary/10">
                    <Icon className="w-20 h-20 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-3xl font-bold">{tool.name}</h3>
                    <p className="text-xl text-muted-foreground">{tool.desc}</p>
                  </div>
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
