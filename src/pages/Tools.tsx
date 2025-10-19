import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calculator, Activity, Flame } from "lucide-react";

const Tools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: "1rm-calculator",
      icon: Calculator,
      title: "1RM Calculator",
      description: "Calculate your one-rep maximum for any exercise",
      route: "/1rm-calculator"
    },
    {
      id: "bmr-calculator",
      icon: Activity,
      title: "BMR Calculator",
      description: "Calculate your basal metabolic rate",
      route: "/bmr-calculator"
    },
    {
      id: "calorie-calculator",
      icon: Flame,
      title: "Calorie Calculator",
      description: "Calculate your daily calorie needs based on activity",
      route: "/calorie-calculator"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Smart Tools</h1>
          <p className="text-muted-foreground">Free fitness calculators to support your training</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-gold bg-card border-border"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="mt-12 bg-muted/30">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">About These Tools</h2>
            <div className="space-y-4 text-muted-foreground max-w-3xl mx-auto">
              <p>
                Our fitness calculators are designed to help you understand your body and optimize your training. 
                All tools use scientifically validated formulas and equations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">1RM Calculator</h3>
                  <p className="text-sm">
                    Uses the Brzycki formula to estimate your one-rep maximum. Essential for programming strength training.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">BMR Calculator</h3>
                  <p className="text-sm">
                    Uses the Mifflin-St Jeor equation to calculate your basal metabolic rate — the calories you burn at rest.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Calorie Calculator</h3>
                  <p className="text-sm">
                    Combines BMR with activity level to determine your total daily energy expenditure (TDEE).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tools;
