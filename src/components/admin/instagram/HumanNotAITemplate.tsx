import { User, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HumanNotAITemplate = () => {
  const values = [
    { icon: User, title: "Real Expertise", description: "Created by Sports Scientists" },
    { icon: Heart, title: "Personal Touch", description: "Workouts that fit YOUR life" },
    { icon: Sparkles, title: "Not a Robot", description: "Human-designed, not AI-generated" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-7xl font-extrabold text-primary mb-6">
          100% Human.
        </h1>
        <h2 className="text-7xl font-extrabold text-primary mb-8">
          0% AI.
        </h2>
        <p className="text-3xl text-foreground mb-4">
          Smarty Gym workouts and programs
        </p>
        <p className="text-3xl text-foreground">
          are built to fit <span className="text-primary font-bold">YOUR</span> life
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {values.map((value, index) => {
          const Icon = value.icon;
          return (
            <Card key={index} className="border-primary border-2">
              <CardContent className="flex items-center gap-6 p-8">
                <div className="p-4 rounded-full bg-primary/10">
                  <Icon className="w-12 h-12 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{value.title}</h3>
                  <p className="text-xl text-muted-foreground">{value.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-2xl font-semibold text-primary">smartygym.com</p>
      </div>
    </div>
  );
};
