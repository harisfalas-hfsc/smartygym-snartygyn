import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowLeft } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";

const PremiumComparison = () => {
  const navigate = useNavigate();
  useShowBackButton();

  const features = [
    {
      category: "Workouts",
      visitor: "Free workouts",
      subscriber: "All workouts",
      premium: "All workouts"
    },
    {
      category: "Training Programs",
      visitor: false,
      subscriber: false,
      premium: "Full access"
    },
    {
      category: "Exercise Library",
      visitor: false,
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Calculators (1RM, BMR, Macro)",
      visitor: false,
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Community Access",
      visitor: false,
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Workout Interactions",
      visitor: false,
      subscriber: "Favorites, ratings, history",
      premium: "Favorites, ratings, history"
    },
    {
      category: "Program Interactions",
      visitor: false,
      subscriber: false,
      premium: "Favorites, ratings, history"
    },
    {
      category: "AI Diet Plans",
      visitor: false,
      subscriber: false,
      premium: "Personalized plans"
    },
    {
      category: "AI Training Programs",
      visitor: false,
      subscriber: false,
      premium: "Custom programs"
    },
    {
      category: "Price",
      visitor: "Free",
      subscriber: "€9.99/month",
      premium: "€89.99/year"
    }
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (value === false) {
      return <X className="w-5 h-5 text-destructive mx-auto" />;
    }
    if (value === true) {
      return <Check className="w-5 h-5 text-primary mx-auto" />;
    }
    return <span className="text-sm text-center">{value}</span>;
  };

  return (
    <>
      <Helmet>
        <title>Compare Plans | Smarty Gym</title>
        <meta name="description" content="Compare Visitor, Subscriber, and Premium access levels at Smarty Gym. Find the perfect plan for your fitness journey." />
      </Helmet>

      <div className="min-h-screen bg-background py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Choose Your Access Level
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Compare what's included in each tier and find the perfect fit for your fitness goals
            </p>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-6">
            <Card className="border-2">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-center mb-4">Visitor</h2>
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">{feature.category}</span>
                      <div>{renderFeatureValue(feature.visitor)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/50">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-center mb-4 text-primary">Subscriber</h2>
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">{feature.category}</span>
                      <div>{renderFeatureValue(feature.subscriber)}</div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-6"
                  onClick={() => navigate("/join-premium")}
                >
                  Get Subscriber
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto mb-4">
                  BEST VALUE
                </div>
                <h2 className="text-2xl font-bold text-center mb-4 text-primary">Premium</h2>
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm font-medium">{feature.category}</span>
                      <div>{renderFeatureValue(feature.premium)}</div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-6"
                  onClick={() => navigate("/join-premium")}
                >
                  Get Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left font-bold">Feature</th>
                      <th className="p-4 text-center font-bold">
                        <div className="text-lg">Visitor</div>
                        <div className="text-sm font-normal text-muted-foreground">Free</div>
                      </th>
                      <th className="p-4 text-center font-bold bg-primary/5">
                        <div className="text-lg text-primary">Subscriber</div>
                        <div className="text-sm font-normal text-muted-foreground">€9.99/month</div>
                      </th>
                      <th className="p-4 text-center font-bold bg-primary/10 relative">
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          BEST VALUE
                        </div>
                        <div className="text-lg text-primary mt-2">Premium</div>
                        <div className="text-sm font-normal text-muted-foreground">€89.99/year</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.slice(0, -1).map((feature, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{feature.category}</td>
                        <td className="p-4">{renderFeatureValue(feature.visitor)}</td>
                        <td className="p-4 bg-primary/5">{renderFeatureValue(feature.subscriber)}</td>
                        <td className="p-4 bg-primary/10">{renderFeatureValue(feature.premium)}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/50">
                      <td className="p-6"></td>
                      <td className="p-6 text-center">
                        <div className="text-xl font-bold">Free</div>
                      </td>
                      <td className="p-6 text-center bg-primary/5">
                        <div className="text-xl font-bold text-primary mb-3">€9.99/month</div>
                        <Button onClick={() => navigate("/join-premium")}>
                          Get Started
                        </Button>
                      </td>
                      <td className="p-6 text-center bg-primary/10">
                        <div className="text-xl font-bold text-primary mb-3">€89.99/year</div>
                        <Button onClick={() => navigate("/join-premium")}>
                          Get Started
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              All prices in Euro (€) • Available worldwide • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PremiumComparison;
