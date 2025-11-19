import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PlatinumPlanCardTemplate = () => {
  const features = [
    "Everything in Gold",
    "Priority Support",
    "Early Access",
    "Exclusive Content",
    "Personalized Plans",
    "Weekly Check-ins",
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 p-4 rounded-full bg-primary/10 w-fit">
            <Sparkles className="w-14 h-14 text-primary" />
          </div>
          <CardTitle className="text-5xl font-bold text-primary mb-1">
            Platinum Plan
          </CardTitle>
          <p className="text-2xl text-muted-foreground">All Included</p>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Check className="w-7 h-7 text-primary" />
              </div>
              <p className="text-xl font-medium">{feature}</p>
            </div>
          ))}
          <div className="text-center mt-6 pt-6 border-t-2 border-primary/20">
            <p className="text-5xl font-bold text-primary mb-2">€89.99</p>
            <p className="text-2xl text-muted-foreground mb-4">per year</p>
            <p className="text-xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
