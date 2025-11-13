import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const GoalSettingBenefitTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardContent className="flex items-center gap-8 p-12">
          <div className="p-8 rounded-full bg-primary/10">
            <TrendingUp className="w-20 h-20 text-primary" />
          </div>
          <div className="flex-1 space-y-3">
            <h3 className="text-5xl font-bold">Goal Setting</h3>
            <p className="text-3xl text-muted-foreground">Define and achieve targets</p>
          </div>
        </CardContent>
        <div className="text-center pb-8">
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </div>
      </Card>
    </div>
  );
};
