import { Dumbbell, Calendar, Calculator, Video, FileText, GraduationCap, Sparkles, Smartphone, UserCheck, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WelcomeHeroCompositeTemplate = () => {
  const navCards = [
    { icon: Dumbbell, title: "Workouts" },
    { icon: Calendar, title: "Programs" },
    { icon: Calculator, title: "Tools" },
    { icon: Video, title: "Library" },
    { icon: FileText, title: "Blog" },
    { icon: GraduationCap, title: "Coach" },
  ];

  const messageCards = [
    { icon: Sparkles, title: "Online Fitness Redefined", desc: "Quality training accessible anywhere" },
    { icon: Smartphone, title: "Your Gym In Your Pocket", desc: "Professional fitness platform worldwide" },
    { icon: UserCheck, title: "100% Human. 0% AI.", desc: "Real expertise by Sports Scientist Haris Falas" },
    { icon: Plane, title: "Train Anywhere, Anytime", desc: "Flexible training that fits YOUR schedule" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex items-center justify-center">
      <Card className="border-primary border-4 w-full h-full">
        <CardContent className="p-8 h-full flex flex-col">
          <h2 className="text-4xl font-bold text-center mb-6 text-primary">Welcome to SmartyGym</h2>
          
          <div className="flex-1 flex gap-6">
            {/* Left: Tablet with 6 Cards */}
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-card border-4 border-border rounded-2xl p-6 shadow-xl w-full max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  {navCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={index}
                        className="bg-background border-2 border-primary/20 rounded-lg p-4 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-center">{card.title}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: 4 Message Cards */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              {messageCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    className="bg-primary/5 border-2 border-primary/30 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                      <p className="text-sm text-muted-foreground leading-tight">{card.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-2xl font-semibold text-primary">smartygym.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
