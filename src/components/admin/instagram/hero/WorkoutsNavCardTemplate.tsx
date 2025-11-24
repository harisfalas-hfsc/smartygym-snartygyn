import { Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WorkoutsNavCardTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-8 p-16">
          <div className="p-10 rounded-full bg-primary/10">
            <Dumbbell className="w-32 h-32 text-primary" />
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-6xl font-bold">500+ Expert Workouts</h3>
            <p className="text-2xl text-muted-foreground leading-relaxed">
              Access a vast library of professional workout routines for every fitness level and goal
            </p>
          </div>
          <p className="text-2xl font-semibold text-primary mt-8">smartygym.com</p>
        </CardContent>
      </Card>
    </div>
  );
};
