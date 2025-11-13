import { UserCheck, Ban, Brain, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const HumanNotAICompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full flex flex-col bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12" aria-hidden="true"></div>
        
        <CardContent className="p-12 flex flex-col flex-1 relative">
          {/* Top Icons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <UserCheck className="w-10 h-10 text-primary" />
            </div>
            <Ban className="w-16 h-16 text-destructive" />
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
              <Brain className="w-10 h-10 text-destructive" />
            </div>
          </div>
          
          {/* Main Title */}
          <h2 className="text-6xl font-bold mb-6 text-center">
            100% Human. 0% AI.
          </h2>
          
          {/* Content */}
          <div className="max-w-5xl mx-auto space-y-5 text-center mb-8 flex-1 flex flex-col justify-center">
            <p className="text-2xl font-semibold text-foreground">
              Smarty Gym workouts and programs are built to fit YOUR life.
            </p>
            <p className="text-xl leading-relaxed text-muted-foreground">
              That's why they work — safe and efficient design by <strong>Haris Falas</strong>, crafted by hand with care to deliver effective results at <strong>smartygym.com</strong>, <strong className="text-foreground">NOT by AI</strong>.
            </p>
            
            {/* Highlighted Box */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 mt-4">
              <p className="text-xl font-bold text-primary mb-2">
                Every program is science-based and personally created by Haris Falas.
              </p>
              <p className="text-lg text-muted-foreground">
                Never by AI. Never by algorithms. Always by a real human expert who understands YOUR needs. Training designed by humans, for humans.
              </p>
            </div>
          </div>

          {/* Three Cards at Bottom */}
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-base mb-1">Real Expertise</p>
                <p className="text-sm text-muted-foreground">Sports science degree & years of coaching experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-base mb-1">Personal Touch</p>
                <p className="text-sm text-muted-foreground">Direct access to Haris and the team anytime</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-base mb-1">Not a Robot</p>
                <p className="text-sm text-muted-foreground">Real people who care about your progress</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
