import { Smartphone, UserCheck, Dumbbell, Calendar, Wrench, Video, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const FullHeroCompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full flex flex-col bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30">
        <CardContent className="p-5 flex flex-col h-full space-y-3">
          
          {/* Main Title */}
          <div className="text-center space-y-1">
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent">
              Welcome to SmartyGym
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              Your Gym Re-imagined. Anywhere, Anytime.
            </p>
          </div>

          {/* Three Core Messages */}
          <div className="grid grid-cols-3 gap-2">
            
            {/* Your Gym In Your Pocket */}
            <div className="text-center space-y-1 p-2 rounded-lg bg-background/50 border border-primary/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Your Gym In Your Pocket
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Professional fitness platform with expert workouts, structured programs, and personalized coaching - accessible worldwide at smartygym.com.
              </p>
            </div>

            {/* 100% Human. 0% AI. */}
            <div className="text-center space-y-1 p-2 rounded-lg bg-background/50 border border-primary/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                100% Human. 0% AI.
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every workout personally designed by Sports Scientist <span className="text-primary font-semibold">Haris Falas</span> with 20+ years of experience. Real expertise, not algorithms.
              </p>
            </div>

            {/* Train Anywhere, Anytime */}
            <div className="text-center space-y-1 p-2 rounded-lg bg-background/50 border border-primary/20">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Train Anywhere, Anytime
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access professional workouts on any device. Flexible training that fits YOUR schedule and YOUR goals—at home, gym, or traveling.
              </p>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="border-t border-primary/20 pt-3">
            <div className="grid grid-cols-2 gap-2">
              
              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <Dumbbell className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">100+ Expert Workouts</p>
                  <p className="text-xs text-muted-foreground">AMRAP, HIIT, Strength & more</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">Training Programs</p>
                  <p className="text-xs text-muted-foreground">Structured long-term plans</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <UserCheck className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">Personal Training</p>
                  <p className="text-xs text-muted-foreground">Custom plans by <span className="text-primary font-semibold">Haris Falas</span></p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <Wrench className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">Smart Tools</p>
                  <p className="text-xs text-muted-foreground">BMR, Macro, 1RM calculators</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <Video className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">Exercise Library</p>
                  <p className="text-xs text-muted-foreground">Comprehensive video guide</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-background/50 p-1.5 rounded-lg">
                <Activity className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs text-foreground">Community Support</p>
                  <p className="text-xs text-muted-foreground">Connect with members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
