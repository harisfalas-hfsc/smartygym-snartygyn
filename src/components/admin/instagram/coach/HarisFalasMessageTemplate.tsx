import { UserCheck, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import harisPhoto from "@/assets/haris-falas-coach.png";

export const HarisFalasMessageTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full bg-gradient-to-br from-primary/5 to-accent/10">
        <CardContent className="p-6 flex flex-col h-full space-y-4">
          {/* Header with Photo */}
          <div className="flex items-center gap-4 pb-4 border-b-2 border-primary/20">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0">
              <img 
                src={harisPhoto} 
                alt="Haris Falas - Head Coach" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Message from Haris Falas</h2>
              <p className="text-lg text-muted-foreground">Sports Scientist & Head Coach</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-3 overflow-auto">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border-2 border-primary/30">
              <p className="text-lg font-bold text-primary mb-2">
                20+ Years of Coaching Experience
              </p>
              <p className="text-base text-muted-foreground">
                BSc Sports Science, Certified Strength & Conditioning Specialist (CSCS)
              </p>
            </div>

            <p className="text-base leading-relaxed">
              I created SmartyGym to give people the kind of coaching that makes everything simpler: 
              structured programs, smart progressions, expert guidance, and clear workouts you can follow with confidence.
            </p>

            <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
              <p className="text-base font-bold mb-2">
                100% Human. 0% AI.
              </p>
              <p className="text-sm leading-relaxed">
                Every single program you see here? I designed it myself. No AI. No automation. 
                Just years of education, experience, and a genuine commitment to YOUR success.
              </p>
            </div>

            {/* Three Key Points */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="flex flex-col items-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
                <Award className="w-8 h-8 text-primary" />
                <p className="text-xs font-semibold text-center">Real Expertise</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
                <UserCheck className="w-8 h-8 text-primary" />
                <p className="text-xs font-semibold text-center">Personal Touch</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
                <CheckCircle2 className="w-8 h-8 text-primary" />
                <p className="text-xs font-semibold text-center">Science-Based</p>
              </div>
            </div>

            <p className="text-base font-semibold text-center text-primary italic">
              "Every day is a game day."
            </p>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 border-t-2 border-primary/20">
            <p className="text-xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
