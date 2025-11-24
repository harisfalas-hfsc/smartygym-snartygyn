import { Dumbbell, Calendar, Calculator, Video, FileText, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const TabletWithSixCardsTemplate = () => {
  const navCards = [
    { icon: Dumbbell, title: "500+ Workouts", color: "text-primary" },
    { icon: Calendar, title: "Programs", color: "text-primary" },
    { icon: Calculator, title: "Smart Tools", color: "text-primary" },
    { icon: Video, title: "Exercise Library", color: "text-primary" },
    { icon: FileText, title: "Blog & Articles", color: "text-primary" },
    { icon: GraduationCap, title: "Coach Guidance", color: "text-primary" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-12 flex items-center justify-center">
      <Card className="border-primary border-4 w-full max-w-4xl bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-16">
          <h2 className="text-5xl font-bold text-center mb-12">Your Complete Fitness Platform</h2>
          
          {/* Tablet Frame */}
          <div className="relative bg-card border-4 border-border rounded-3xl p-8 shadow-2xl">
            {/* Screen Content - 6 Cards Grid */}
            <div className="grid grid-cols-2 gap-6">
              {navCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="bg-background border-2 border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors"
                  >
                    <div className="p-4 rounded-full bg-primary/10">
                      <Icon className={`w-12 h-12 ${card.color}`} />
                    </div>
                    <p className="text-xl font-semibold text-center">{card.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-3xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
