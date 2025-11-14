import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Check, 
  Dumbbell, 
  Calendar, 
  Calculator,
  BookOpen,
  Users,
  ArrowLeft,
  Zap,
  TrendingUp,
  Heart,
  Target,
  Eye,
  UserCheck,
  Sparkles,
  Flame,
  LayoutDashboard,
  MessageCircle,
  X
} from "lucide-react";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export default function PremiumBenefits() {
  const navigate = useNavigate();
  const { canGoBack, goBack } = useShowBackButton();
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

  const comparisonFeatures = [
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

  const benefits = [
    { icon: Dumbbell, title: "Unlimited Workouts", description: "Access to all personalized workout plans" },
    { icon: Calendar, title: "Training Programs", description: "Structured training programs to achieve long-term goals" },
    { icon: Heart, title: "Track Favorites", description: "Save and organize your favorite workouts" },
    { icon: TrendingUp, title: "Progress Tracking", description: "Monitor completed workouts and achievements" },
    { icon: Target, title: "Goal Setting", description: "Set and track your fitness goals" },
    { icon: BookOpen, title: "Exercise Library", description: "Complete exercise database with videos" },
    { icon: Calculator, title: "Fitness Tools", description: "BMR, 1RM, and macro calculators with history" },
    { icon: Zap, title: "Priority Support", description: "Get help when you need it" }
  ];

  const yearlyBenefits = [
    "Save €29.89 (25% off) compared to monthly",
    "Only €7.50 per month when paid annually",
    "Lock in your rate for 12 months",
    "Best value for committed users",
    "Full access to all features"
  ];

  return (
    <>
      <Helmet>
        <title>Premium Benefits | Smarty Gym</title>
        <meta name="description" content="Discover what you get with Smarty Gym Premium - unlimited workouts, training programs, and exclusive fitness tools." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-7xl p-4 py-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}

          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Transform Your Fitness Journey</h1>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                Join thousands of members who've upgraded to premium and achieved their fitness goals
              </p>
            </div>
          </div>

          {/* What You Get */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">What You Get with Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full shrink-0">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Access Level Comparison */}
          <Card className="mb-8 overflow-hidden border-2 border-[hsl(var(--primary)/0.6)] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Compare Access Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-6">
                <Card className="border-2 border-[hsl(var(--primary)/0.3)] bg-gradient-to-br from-background to-[hsl(var(--primary)/0.05)]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Eye className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold text-center">Visitor</h3>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mb-4">Free • No login</div>
                    <div className="space-y-3">
                      {comparisonFeatures.map((feature, idx) => {
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
                      <h3 className="text-2xl font-bold text-center">Subscriber</h3>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mb-4">Free • Login required</div>
                    <div className="space-y-3">
                      {comparisonFeatures.map((feature, idx) => {
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
                      <h3 className="text-2xl font-bold text-center">Premium</h3>
                    </div>
                    <div className="text-center text-sm font-semibold text-primary mb-4">Gold / Platinum</div>
                    <div className="space-y-3">
                      {comparisonFeatures.map((feature, idx) => {
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
                      {comparisonFeatures.map((feature, idx) => {
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
              </div>
            </CardContent>
          </Card>

          {/* Why Choose Yearly */}
          <Card className="mb-8 border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Why Choose the Yearly Plan?</CardTitle>
                <Badge className="bg-green-600 text-white">BEST VALUE</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">Save Big with Annual Membership</h3>
                  <div className="space-y-3">
                    {yearlyBenefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/5 rounded-lg p-6 flex flex-col justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Monthly Plan</p>
                    <div className="text-2xl font-bold line-through text-muted-foreground mb-2">
                      €9.99 × 12 = €119.88
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">per year</p>
                    
                    <div className="my-4 border-t border-border"></div>
                    
                    <p className="text-sm text-muted-foreground mb-2">Annual Plan (Save 25%)</p>
                    <div className="text-4xl font-bold text-primary mb-2">
                      €89.99
                    </div>
                    <p className="text-sm text-green-600 font-semibold">
                      You save €29.89!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="w-full max-w-md text-lg py-6"
              onClick={() => navigate("/joinpremium")}
            >
              <Crown className="mr-2 h-5 w-5" />
              Choose Your Plan
            </Button>
            <p className="text-sm text-muted-foreground">
              Cancel anytime • No hidden fees • Secure payment
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
