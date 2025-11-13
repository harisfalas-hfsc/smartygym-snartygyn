import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const CardioCardTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-8 p-16">
          <div className="p-10 rounded-full bg-primary/10">
            <Heart className="w-32 h-32 text-primary" />
          </div>
          <h3 className="text-6xl font-bold text-center">Cardio</h3>
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </CardContent>
      </Card>
    </div>
  );
};
