import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Calculator, Activity, Flame } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";

const Tools = () => {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  const tools = [
    {
      id: "1rm-calculator",
      icon: Calculator,
      title: "1RM Calculator",
      description: "Calculate your one-rep maximum for any exercise",
      route: "/1rmcalculator"
    },
    {
      id: "bmr-calculator",
      icon: Activity,
      title: "BMR Calculator",
      description: "Calculate your basal metabolic rate",
      route: "/bmrcalculator"
    },
    {
      id: "macro-calculator",
      icon: Flame,
      title: "Macro Tracking Calculator",
      description: "Get personalized nutrition and macro recommendations",
      route: "/macrocalculator"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Free Fitness Calculators | Online Gym Tools | SmartyGym Cyprus | smartygym.com</title>
        <meta name="description" content="Free online gym fitness tools at smartygym.com: 1RM Calculator, BMR Calculator, Macro Tracking Calculator. Professional fitness planning tools by Sports Scientist Haris Falas for online gym training. Convenient fitness tools for anywhere, anytime." />
        <meta name="keywords" content="online gym tools, fitness calculators online, gym calculators, smartygym tools, smartygym.com, online gym Cyprus, gym tools Cyprus, Haris Falas tools, Haris Falas Cyprus, 1rm calculator online, bmr calculator online, macro calculator, fitness tools online, gym training tools, convenient fitness tools, gym Reimagined, workout calculators, online fitness tools, gym planning tools, training calculators, Cyprus fitness tools, strength calculator, nutrition calculator, calorie calculator online" />
        
        <meta property="og:title" content="Fitness Tools - Smarty Gym | Free Calculators" />
        <meta property="og:description" content="Free fitness calculators by Haris Falas - convenient tools for flexible training anywhere" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/tools" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fitness Tools - Smarty Gym" />
        <meta name="twitter:description" content="Free fitness calculators at smartygym.com for convenient training planning" />
        
        <link rel="canonical" href="https://smartygym.com/tools" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {canGoBack && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        )}

        <PageBreadcrumbs 
          items={[
            { label: "Home", href: "/" },
            { label: "Tools" }
          ]} 
        />
        
        {userTier === "guest" ? (
          <InfoRibbon 
            ctaText="Login / Sign Up"
            onCtaClick={() => navigate("/auth")}
          >
            <p>Login required to use these calculators. Already a member? Sign in to access all tools.</p>
          </InfoRibbon>
        ) : !isPremium ? (
          <InfoRibbon 
            ctaText="Join Premium"
            onCtaClick={() => navigate("/premiumbenefits")}
          >
            <p>Use these tools for free as a member. Want personalized training programs?</p>
          </InfoRibbon>
        ) : (
          <InfoRibbon>
            <p>All tools included in your premium membership — plus personalized training programs!</p>
          </InfoRibbon>
        )}

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
        <Card className="mt-12 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
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
                  <h3 className="font-semibold text-foreground mb-2">Macro Tracking Calculator</h3>
                  <p className="text-sm">
                    Get complete nutrition recommendations including calories, macros, fiber, water, and meal frequency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </>
  );
};

export default Tools;
