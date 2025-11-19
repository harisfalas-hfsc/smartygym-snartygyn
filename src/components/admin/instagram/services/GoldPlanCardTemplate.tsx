import { Check, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GoldPlanCardTemplate = () => {
  const features = [
    "Unlimited Workouts",
    "Training Programs",
    "Exercise Library",
    "Fitness Calculators",
    "Ad-free Experience",
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-5 rounded-full bg-primary/10 w-fit">
            <Crown className="w-16 h-16 text-primary" />
          </div>
          <CardTitle className="text-6xl font-bold text-primary mb-2">
            Gold Plan
          </CardTitle>
          <p className="text-3xl text-muted-foreground">All Included</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <p className="text-2xl font-medium">{feature}</p>
            </div>
          ))}
          <div className="text-center mt-8 pt-8 border-t-2 border-primary/20">
            <p className="text-5xl font-bold text-primary mb-2">€9.99</p>
            <p className="text-2xl text-muted-foreground mb-6">per month</p>
            <p className="text-xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
