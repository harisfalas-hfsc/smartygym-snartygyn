import { Users, Heart, GraduationCap, Target, Plane, Dumbbell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WhoIsForCompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full bg-background/80">
        <CardContent className="p-8 flex flex-col h-full space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-5xl font-bold text-foreground mb-2">
              Who Is SmartyGym For?
            </h2>
            <p className="text-xl text-muted-foreground">Professional fitness training for everyone</p>
          </div>

          {/* Grid of 6 Audience Cards */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Busy Adults */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Busy Adults</span>
              </div>
              <p className="text-base text-muted-foreground">
                Quick, effective workouts that fit your schedule
              </p>
            </div>

            {/* Parents */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Parents</span>
              </div>
              <p className="text-base text-muted-foreground">
                Train at home while kids play nearby
              </p>
            </div>

            {/* Beginners */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <GraduationCap className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Beginners</span>
              </div>
              <p className="text-base text-muted-foreground">
                Start your fitness journey with guided programs
              </p>
            </div>

            {/* Intermediate Lifters */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Intermediate Lifters</span>
              </div>
              <p className="text-base text-muted-foreground">
                Push past plateaus with structured plans
              </p>
            </div>

            {/* Travelers */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Plane className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Travelers</span>
              </div>
              <p className="text-base text-muted-foreground">
                Stay consistent wherever you go
              </p>
            </div>

            {/* Gym-Goers */}
            <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Dumbbell className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">Gym-Goers</span>
              </div>
              <p className="text-base text-muted-foreground">
                Enhance your gym routine with expert guidance
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
