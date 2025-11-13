import { Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const MacroToolCardTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="p-6 rounded-full bg-primary/10">
              <Target className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-5xl font-bold">Macro Tracker</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl text-muted-foreground leading-relaxed">
            Calculate your optimal macro distribution to fuel your fitness goals effectively
          </p>
        </CardContent>
        <div className="text-center pb-8">
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </div>
      </Card>
    </div>
  );
};
