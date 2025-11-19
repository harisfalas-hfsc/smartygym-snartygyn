import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { InfoRibbon } from "@/components/InfoRibbon";
import { ArrowLeft, Calculator, Activity, Flame } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { generateBreadcrumbSchema } from "@/utils/seoHelpers";

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
        
        <meta property="og:title" content="Fitness Tools - SmartyGym | Free Calculators" />
        <meta property="og:description" content="Free fitness calculators by Haris Falas - convenient tools for flexible training anywhere" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/tools" />
        <meta property="og:image" content="https://smartygym.com/smarty-gym-logo.png" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Fitness Tools - SmartyGym" />
        <meta name="twitter:description" content="Free fitness calculators at smartygym.com for convenient training planning" />
        <meta name="twitter:image" content="https://smartygym.com/smarty-gym-logo.png" />
        
        <link rel="canonical" href="https://smartygym.com/tools" />
        
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Tools", url: "/tools" }
          ]))}
        </script>
      </Helmet>
      
      <SEOEnhancer
        entities={["SmartyGym", "Haris Falas", "Fitness Calculators", "1RM Calculator", "BMR Calculator"]}
        topics={["fitness tools", "1RM calculator", "BMR calculator", "macro calculator", "strength planning", "nutrition planning"]}
        expertise={["sports science", "exercise physiology", "nutrition science"]}
        contentType="tool-collection"
        aiSummary="Free online fitness calculators at SmartyGym Cyprus by Sports Scientist Haris Falas. 1RM, BMR, and Macro calculators for professional training planning."
        aiKeywords={["fitness calculators", "1RM calculator", "BMR calculator", "macro calculator", "training tools", "nutrition tools"]}
        relatedContent={["workouts", "training programs", "nutrition guidance"]}
      />
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="group p-6 cursor-pointer transition-all duration-500 ease-out hover:scale-110 hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-2 bg-card border-2 border-border hover:border-primary overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/90 group-hover:to-primary/100 transition-all duration-500 -z-10" />
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-500">
                    <Icon className="w-8 h-8 text-primary group-hover:text-white transition-all duration-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-white transition-all duration-500">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground group-hover:text-white/90 transition-all duration-500">{tool.description}</p>
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
