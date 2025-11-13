import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BMRCardTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 p-6 rounded-full bg-primary/10 w-fit">
            <Scale className="w-20 h-20 text-primary" />
          </div>
          <CardTitle className="text-6xl mb-4">BMR Calculator</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-3xl text-muted-foreground leading-relaxed mb-6">
            Discover your daily calorie needs
          </p>
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </CardContent>
      </Card>
    </div>
  );
};
