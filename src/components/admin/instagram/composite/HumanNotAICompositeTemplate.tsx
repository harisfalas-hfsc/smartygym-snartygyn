import { User, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HumanNotAICompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <div className="text-center py-12">
          <h1 className="text-7xl font-bold mb-4">100% Human.</h1>
          <h1 className="text-7xl font-bold text-primary">0% AI.</h1>
        </div>
        
        <CardContent className="flex-1 grid grid-cols-3 gap-6 p-8">
          <Card className="border-primary border-2">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-6 rounded-full bg-primary/10">
                <User className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Real Expertise</h3>
              <p className="text-xl text-muted-foreground text-center">
                Created by Sports Scientists
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary border-2">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-6 rounded-full bg-primary/10">
                <Heart className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Personal Touch</h3>
              <p className="text-xl text-muted-foreground text-center">
                Workouts that fit YOUR life
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary border-2">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
              <div className="p-6 rounded-full bg-primary/10">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-center">Not a Robot</h3>
              <p className="text-xl text-muted-foreground text-center">
                Human-designed, not AI-generated
              </p>
            </CardContent>
          </Card>
        </CardContent>

        <div className="text-center py-8">
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </div>
      </Card>
    </div>
  );
};
