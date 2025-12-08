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
        <title>Free Fitness Calculators | 1RM BMR Macro | Haris Falas HFSC | SmartyGym</title>
        <meta name="description" content="Free fitness calculators at smartygym.com. 1RM Calculator, BMR Calculator, Macro Tracking by Sports Scientist Haris Falas HFSC. Professional gym tools online for strength & nutrition planning. Train smart anywhere, anytime." />
        <meta name="keywords" content="fitness calculators, gym calculators, 1RM calculator, BMR calculator, personal trainer tools, online gym, fitness tools, HFSC, Haris Falas, Sports Scientist, fitness tools online, gym training tools, macro calculator, strength calculator, nutrition calculator, smartygym.com, HFSC Performance, workout planning tools" />
        
        {/* Greek Language */}
        <link rel="alternate" hrefLang="el" href="https://smartygym.com/tools" />
        <link rel="alternate" hrefLang="en-GB" href="https://smartygym.com/tools" />
      </Helmet>
      
      <SEOEnhancer
        entities={["SmartyGym", "Haris Falas", "Fitness Calculators", "1RM Calculator", "BMR Calculator"]}
        topics={["fitness tools", "1RM calculator", "BMR calculator", "macro calculator", "strength planning", "nutrition planning"]}
        expertise={["sports science", "exercise physiology", "nutrition science"]}
        contentType="tool-collection"
        aiSummary="Free online fitness calculators at SmartyGym by Sports Scientist Haris Falas. 1RM, BMR, and Macro calculators for professional training planning."
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

        {/* Info Section */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 border-primary/40 shadow-gold">
          <div className="p-5">
            <h2 className="text-2xl font-bold mb-3 text-center">About Smarty Tools</h2>
            <div className="space-y-2 text-muted-foreground max-w-3xl mx-auto">
              <p>
                Smarty Tools are fitness calculators designed to help you understand your body and optimize your training. 
                All tools use scientifically validated formulas and equations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.id}
                onClick={() => navigate(tool.route)}
                className="group p-6 cursor-pointer transition-all duration-500 ease-out transform-gpu hover:scale-110 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/40 hover:border-primary/60 bg-card border-2 border-border"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:rotate-3" />
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
      </div>
      </div>
    </>
  );
};

export default Tools;
