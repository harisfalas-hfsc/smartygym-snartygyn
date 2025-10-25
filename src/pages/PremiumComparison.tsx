import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ArrowLeft, Eye, UserCheck, Crown, Dumbbell, BookOpen, Calculator, Users, Heart, Sparkles, Flame, LayoutDashboard, MessageCircle } from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const PremiumComparison = () => {
  const navigate = useNavigate();
  useShowBackButton();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      category: "Workouts",
      icon: Dumbbell,
      visitor: false,
      subscriber: "Free workouts",
      premium: "All workouts"
    },
    {
      category: "Training Programs",
      icon: Flame,
      visitor: false,
      subscriber: "Free programs",
      premium: "Full access"
    },
    {
      category: "Dashboard",
      icon: LayoutDashboard,
      visitor: false,
      subscriber: "Limited access",
      premium: "Full access"
    },
    {
      category: "Exercise Library",
      icon: BookOpen,
      visitor: "Full access",
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Calculators (1RM, BMR, Macro)",
      icon: Calculator,
      visitor: false,
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Blog",
      icon: BookOpen,
      visitor: "Full access",
      subscriber: "Full access",
      premium: "Full access"
    },
    {
      category: "Workout Interactions",
      icon: Heart,
      visitor: false,
      subscriber: "Favorites, ratings, history (free only)",
      premium: "Full favorites, ratings, history"
    },
    {
      category: "Program Interactions",
      icon: Heart,
      visitor: false,
      subscriber: "Favorites, ratings, history (free only)",
      premium: "Full favorites, ratings, history"
    },
    {
      category: "WhatsApp Interaction with Coach",
      icon: MessageCircle,
      visitor: false,
      subscriber: false,
      premium: "Full customer support"
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
            <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  Compare what's included in each tier and find the perfect fit for your fitness goals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-6">
            <Card className="border-2 border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-background to-[hsl(var(--primary)/0.05)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Eye className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-center">Visitor</h2>
                </div>
                <div className="text-center text-sm text-muted-foreground mb-4">Free • No login</div>
                <div className="space-y-3">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{feature.category}</span>
                        </div>
                        <div>{renderFeatureValue(feature.visitor)}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[hsl(var(--primary)/0.5)] bg-gradient-to-br from-background to-[hsl(var(--primary)/0.1)]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <UserCheck className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-center">Subscriber</h2>
                </div>
                <div className="text-center text-sm text-muted-foreground mb-4">Free • Login required</div>
                <div className="space-y-3">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{feature.category}</span>
                        </div>
                        <div>{renderFeatureValue(feature.subscriber)}</div>
                      </div>
                    );
                  })}
                </div>
                {!user && (
                  <Button 
                    className="w-full mt-6"
                    onClick={() => navigate("/auth")}
                  >
                    Sign Up Free
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-2 border-[hsl(var(--primary)/0.8)] bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.2)] shadow-lg">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-center">Premium</h2>
                </div>
                <div className="text-center text-sm font-semibold text-primary mb-4">Gold / Platinum</div>
                <div className="space-y-3">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-primary/10">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{feature.category}</span>
                        </div>
                        <div>{renderFeatureValue(feature.premium)}</div>
                      </div>
                    );
                  })}
                </div>
                <Button 
                  className="w-full mt-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  onClick={() => navigate("/joinpremium")}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Get Premium
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block">
            <Card className="overflow-hidden border-2 border-[hsl(var(--primary)/0.6)] shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[hsl(var(--primary)/0.4)]">
                      <th className="p-6 text-left font-bold text-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <span>Feature</span>
                        </div>
                      </th>
                      <th className="p-6 text-center font-bold bg-gradient-to-b from-[hsl(var(--primary)/0.05)] to-transparent">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-primary" />
                          <div className="text-lg">Visitor</div>
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">Free • No login</div>
                      </th>
                      <th className="p-6 text-center font-bold bg-gradient-to-b from-[hsl(var(--primary)/0.1)] to-transparent">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <UserCheck className="w-5 h-5 text-primary" />
                          <div className="text-lg">Subscriber</div>
                        </div>
                        <div className="text-sm font-normal text-muted-foreground">Free • Login required</div>
                      </th>
                      <th className="p-6 text-center font-bold bg-gradient-to-b from-[hsl(var(--primary)/0.2)] to-transparent">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Crown className="w-5 h-5 text-primary" />
                          <div className="text-lg">Premium</div>
                        </div>
                        <div className="text-sm font-semibold text-primary">Gold / Platinum</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <tr key={idx} className="border-b border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                          <td className="p-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span>{feature.category}</span>
                            </div>
                          </td>
                          <td className="p-4 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.03)] to-transparent">{renderFeatureValue(feature.visitor)}</td>
                          <td className="p-4 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.07)] to-transparent">{renderFeatureValue(feature.subscriber)}</td>
                          <td className="p-4 bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.12)] to-transparent">{renderFeatureValue(feature.premium)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gradient-to-b from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.05)] border-t-2 border-[hsl(var(--primary)/0.4)]">
                      <td className="p-6"></td>
                      <td className="p-6 text-center">
                        <Button 
                          className="bg-gradient-to-r from-primary to-accent shadow-lg cursor-default disabled:opacity-100"
                          disabled
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Free Access
                        </Button>
                      </td>
                      <td className="p-6 text-center">
                        {!user && (
                          <Button 
                            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                            onClick={() => navigate("/auth")}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Sign Up Free
                          </Button>
                        )}
                        {user && (
                          <Button 
                            className="bg-gradient-to-r from-primary to-accent shadow-lg cursor-default disabled:opacity-100"
                            disabled
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Already Signed In
                          </Button>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        <Button 
                          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                          onClick={() => navigate("/joinpremium")}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Get Premium
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
