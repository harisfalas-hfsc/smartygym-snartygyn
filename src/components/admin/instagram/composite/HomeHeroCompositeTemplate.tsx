import { Dumbbell, Target, UserCheck, Wrench, Video, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export const HomeHeroCompositeTemplate = () => {
  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full bg-gradient-to-r from-primary/5 to-primary/10 relative overflow-hidden">
        <div className="p-16 text-center relative">
          {/* Left Side Icons */}
          <div className="absolute left-12 top-1/2 -translate-y-1/2 flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <Dumbbell className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Workouts</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Target className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Programs</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <UserCheck className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Personal Training</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-8xl font-extrabold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
              Smarty Gym
            </h1>
            <p className="text-3xl text-foreground leading-relaxed">
              Your Gym Re-imagined. Anywhere, Anytime.
            </p>
          </div>

          {/* Right Side Icons */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <Wrench className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Tools</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Video className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Exercise Library</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-14 h-14 text-primary" />
              <span className="text-sm font-medium text-primary">Blog</span>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-3xl font-semibold text-primary">smartygym.com</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
