import { Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const YourGymInPocketCardTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardContent className="flex flex-col items-center gap-8 p-12">
          <div className="p-8 rounded-full bg-primary/10">
            <Smartphone className="w-24 h-24 text-primary" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-5xl font-bold">Your Gym In Your Pocket</h3>
            <p className="text-3xl text-muted-foreground leading-relaxed">
              Professional fitness platform with expert workouts, structured programs, and personalized coaching - accessible worldwide at smartygym.com.
            </p>
          </div>
          <p className="text-2xl font-semibold text-primary mt-8">smartygym.com</p>
        </CardContent>
      </Card>
    </div>
  );
};
