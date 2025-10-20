import { useEffect, useState } from "react";
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
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export default function JoinPremium() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubscribe = async (plan: 'gold' | 'platinum') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    const priceIds = {
      gold: 'price_1SJ9q1IxQYg9inGKZzxxqPbD',
      platinum: 'price_1SJ9qGIxQYg9inGKFbgqVRjj'
    };

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: priceIds[plan] }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the new tab",
        });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Dumbbell, text: "Unlimited personalized workouts" },
    { icon: Calendar, text: "Structured training programs" },
    { icon: Calculator, text: "Advanced fitness calculators" },
    { icon: BookOpen, text: "Complete exercise library" },
    { icon: Users, text: "Community forum access" },
    { icon: Zap, text: "Priority support" }
  ];

  return (
    <>
      <Helmet>
        <title>Join Premium | Smarty Gym</title>
        <meta name="description" content="Upgrade to Smarty Gym Premium and unlock unlimited workouts, training programs, and exclusive fitness tools." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-7xl p-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back to Home</span>
          </Button>

          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Join Premium</h1>
          <p className="text-center text-muted-foreground mb-4">
            Unlock your full fitness potential with unlimited access to all premium features
          </p>

          {/* Info Ribbon */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              Choose the plan that fits your goals. All prices in Euro (€). Cancel anytime.
            </p>
          </div>

          {/* Premium Features */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                What's Included in Premium
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
            {/* Gold Plan */}
            <Card className="relative">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-primary border-primary">
                    GOLD
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold">€9.99</CardTitle>
                <p className="text-sm text-muted-foreground">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Full access to all features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Monthly billing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('gold')}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Get Gold Plan"}
                </Button>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="relative border-2 border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  BEST VALUE
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-primary-foreground">
                    PLATINUM
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold">€89.99</CardTitle>
                <p className="text-sm text-muted-foreground">per year</p>
                <p className="text-xs text-green-600 font-semibold">Save €29.89 (25% off)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Full access to all features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Annual billing (best value)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Priority support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe('platinum')}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Get Platinum Plan"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ / Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and various local payment methods through our secure payment processor.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer free workouts and tools without requiring a subscription. Try them out before upgrading to premium!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          {!user && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Don't have an account yet?
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign Up Free
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
