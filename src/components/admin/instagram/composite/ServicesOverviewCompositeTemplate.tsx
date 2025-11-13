import { Dumbbell, BookOpen, Video, Calculator, Target, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ServicesOverviewCompositeTemplate = () => {
  const services = [
    { icon: Dumbbell, name: "Workouts" },
    { icon: BookOpen, name: "Programs" },
    { icon: Video, name: "Exercise Library" },
    { icon: Calculator, name: "1RM Calculator" },
    { icon: Target, name: "Macro Tracker" },
    { icon: Scale, name: "BMR Calculator" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background p-8 flex flex-col">
      <Card className="border-primary border-4 flex-1 flex flex-col">
        <div className="text-center py-12">
          <h1 className="text-7xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-2xl text-muted-foreground">Everything you need to succeed</p>
        </div>
        
        <CardContent className="flex-1 grid grid-cols-3 gap-6 p-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="border-primary border-2">
                <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                  <div className="p-6 rounded-full bg-primary/10">
                    <Icon className="w-14 h-14 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-center">{service.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>

        <div className="text-center py-8">
          <p className="text-2xl font-semibold text-primary">smartygym.com</p>
        </div>
      </Card>
    </div>
  );
};
