import { Check, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GoldPlanCompositeTemplate = () => {
  const features = [
    "Unlimited Workouts",
    "Training Programs",
    "Exercise Library",
    "Fitness Calculators",
    "Ad-free Experience",
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-3xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 p-6 rounded-full bg-primary/10 w-fit">
            <Crown className="w-20 h-20 text-primary" />
          </div>
          <CardTitle className="text-7xl font-bold text-primary mb-4">
            Gold Plan
          </CardTitle>
          <p className="text-4xl text-muted-foreground">All Included</p>
        </CardHeader>
        <CardContent className="space-y-8 pb-12">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <p className="text-3xl font-medium">{feature}</p>
            </div>
          ))}
          <div className="text-center mt-12 pt-12 border-t-2 border-primary/20">
            <p className="text-6xl font-bold text-primary mb-3">€9.99</p>
            <p className="text-3xl text-muted-foreground mb-8">per month</p>
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
