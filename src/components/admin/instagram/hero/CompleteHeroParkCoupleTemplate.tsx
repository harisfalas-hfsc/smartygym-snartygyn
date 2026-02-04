import { UserCheck, Ban, Brain, CheckCircle2, Users, Heart, GraduationCap, Target, Plane, Dumbbell, CalendarCheck, Calendar, Calculator, Video, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import heroParkCouple from "@/assets/hero-park-couple.jpg";

export const CompleteHeroParkCoupleTemplate = () => {
  const navCards = [
    { id: "wod", title: "Workout of the Day", description: "Today's featured workout designed fresh by Coach Haris", icon: CalendarCheck },
    { id: "workouts", title: "Smarty Workouts", description: "Complete workout library with 500+ expert-designed routines", icon: Dumbbell },
    { id: "programs", title: "Smarty Programs", description: "Structured multi-week training plans to transform your fitness", icon: Calendar },
    { id: "tools", title: "Smarty Tools", description: "Professional fitness calculators and tracking tools", icon: Calculator },
    { id: "library", title: "Exercise Library", description: "Comprehensive video demos with proper form guides", icon: Video },
    { id: "blog", title: "Blog & Insights", description: "Evidence-based articles and expert coaching tips", icon: FileText },
  ];

  const audiences = [
    { icon: Users, label: "Busy Adults", color: "text-blue-500" },
    { icon: Heart, label: "Parents", color: "text-pink-500" },
    { icon: GraduationCap, label: "Beginners", color: "text-emerald-500" },
    { icon: Target, label: "Intermediate", color: "text-orange-500" },
    { icon: Plane, label: "Travelers", color: "text-cyan-500" },
    { icon: Dumbbell, label: "Gym-Goers", color: "text-purple-500" },
  ];

  return (
    <div className="w-[1080px] h-[1080px] bg-background relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroParkCouple})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/65" />
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12 z-10" />
      
      {/* Content */}
      <div className="relative z-20 h-full flex flex-col p-8">
        {/* Header Icons */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCheck className="w-7 h-7 text-primary" />
          </div>
          <Ban className="w-10 h-10 text-destructive" />
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <Brain className="w-7 h-7 text-destructive" />
          </div>
        </div>
        
        {/* Main Title */}
        <h2 className="text-3xl font-bold mb-4 text-center text-foreground">
          100% Human. <span className="text-destructive">0% AI.</span>
        </h2>
        
        {/* Description */}
        <div className="max-w-3xl mx-auto text-center mb-4">
          <p className="text-lg font-semibold text-foreground mb-2">
            <span className="text-primary">SmartyGym</span> workouts and programs are built to fit YOUR life.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            That's why they work — safe and efficient design by <span className="text-primary font-medium">Haris Falas</span>, crafted by hand with care to deliver effective results at <strong>smartygym.com</strong>, <strong className="text-foreground">NOT by AI</strong>.
          </p>
        </div>
        
        {/* Feature Box */}
        <div className="bg-background/60 backdrop-blur-sm p-4 rounded-lg border-2 border-primary/30 max-w-3xl mx-auto mb-4">
          <p className="text-lg font-bold text-primary mb-1 text-center">
            Your Gym Re-imagined Anywhere, Anytime
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            We are not here to replace your gym. We are here to back you up when life gets in the way. Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — SmartyGym is your backup plan. <span className="font-semibold text-primary">Wherever you are, your gym comes with you.</span>
          </p>
        </div>
        
        {/* Value Props */}
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-4">
          <article className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs mb-0.5">Real Expertise</p>
              <p className="text-xs text-muted-foreground leading-tight">Sports science degree & years of professional coaching</p>
            </div>
          </article>
          <article className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs mb-0.5">Personal Touch</p>
              <p className="text-xs text-muted-foreground leading-tight">Workouts designed to fit YOUR unique schedule</p>
            </div>
          </article>
          <article className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs mb-0.5">Not a Robot</p>
              <p className="text-xs text-muted-foreground leading-tight">Human-designed workouts backed by science</p>
            </div>
          </article>
        </div>
        
        {/* Science text */}
        <div className="text-center mb-4 pt-3 border-t border-primary/20 max-w-3xl mx-auto">
          <p className="text-sm font-semibold text-primary">
            Every workout is science-based and personally created by <span className="text-primary font-medium">Haris Falas</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Never by AI. Never by algorithms. Always by a real human expert.
          </p>
        </div>
        
        {/* Navigation Cards */}
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mb-4">
          {navCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.id} className="border-2 border-primary/40 bg-background/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-foreground truncate">{card.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary/50 flex-shrink-0" />
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Who is SmartyGym For? */}
        <div className="pt-3 border-t border-primary/20 max-w-3xl mx-auto">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2 text-center">
            Who is <span className="text-primary">SmartyGym</span> For?
          </h4>
          <div className="grid grid-cols-6 gap-2">
            {audiences.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-medium text-foreground text-center">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-auto pt-3">
          <p className="text-xl font-semibold text-primary">smartygym.com</p>
        </div>
      </div>
    </div>
  );
};
