import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PremiumBenefitsTemplate = () => {
  const benefits = [
    "Unlimited Smarty Workouts",
    "Structured Training Programs",
    "Track Favorites & Progress",
    "Goal Setting & Tracking",
    "Complete Exercise Library",
    "Advanced Fitness Calculators",
    "Smarty Rituals & Check-ins",
    "Priority Support",
    "New Content Every Week",
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-6xl font-bold text-primary mb-4">
            Go Premium
          </CardTitle>
          <p className="text-2xl text-muted-foreground">
            Unlock unlimited fitness potential
          </p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 mt-1">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xl font-medium flex-1">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <div className="inline-block px-8 py-4 bg-primary rounded-lg">
              <p className="text-4xl font-bold text-primary-foreground">
                Starting at €9.99/month
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <p className="text-xl font-semibold text-primary">smartygym.com</p>
      </div>
    </div>
  );
};
