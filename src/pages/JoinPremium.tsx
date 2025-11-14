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
import { useShowBackButton } from "@/hooks/useShowBackButton";

export default function JoinPremium() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
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

          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Join Premium</h1>
          <p className="text-center text-muted-foreground mb-4">
            Unlock your full fitness potential with unlimited access to all premium features
          </p>

          {/* Info Ribbon */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Recurring subscriptions save you money!</strong> Choose between monthly or yearly plans. All prices in Euro (€). Cancel anytime.
            </p>
          </div>

          {/* Subscription Benefits Banner */}
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-bold mb-2 text-green-700 dark:text-green-400">
                💰 Smart Investment: Lock in Recurring Payments & Save!
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                Choose a subscription plan that auto-renews and you'll save compared to one-time purchases. The yearly plan saves you 25% - that's €29.89 in your pocket!
              </p>
            </CardContent>
          </Card>

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
            <Card 
              itemScope
              itemType="https://schema.org/Product"
              className="relative border-2 border-amber-500 shadow-lg flex flex-col"
              data-plan="gold"
              data-keywords="online gym membership, smarty gym, online fitness subscription, smartygym.com, Cyprus online gym"
              aria-label="Gold Plan - Smarty Gym Cyprus online gym membership - smartygym.com"
            >
              <CardHeader className="text-center pb-4">
                <div className="mb-3">
                  <h2 
                    className="text-2xl font-bold text-amber-600 dark:text-amber-400"
                    itemProp="name"
                  >
                    Gold Plan
                  </h2>
                </div>
                <Badge className="bg-amber-500 text-white mx-auto mb-4">
                  MONTHLY SUBSCRIPTION
                </Badge>
                <CardTitle className="text-3xl font-bold" itemProp="offers">€9.99</CardTitle>
                <p className="text-sm text-muted-foreground h-5" itemProp="description">per month</p>
                <div className="h-14 flex flex-col justify-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    🔄 Auto-renews monthly
                  </p>
                </div>
                <meta itemProp="brand" content="Smarty Gym Cyprus - smartygym.com" />
                <meta itemProp="category" content="Online Gym Membership" />
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Full access to all features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Flexible monthly billing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime (subscription-based)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Perfect for trying premium features</span>
                  </div>
                </div>
                <div className="space-y-4 mt-auto">
                  <Button 
                    className="w-full text-lg py-6" 
                    onClick={() => handleSubscribe('gold')}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Start Monthly Plan"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Renews automatically each month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="relative border-2 border-primary shadow-lg flex flex-col">
              <CardHeader className="text-center pb-4">
                <div className="mb-3 relative">
                  <Badge className="absolute -top-2 right-0 bg-green-600 text-white px-2 py-1 text-xs">
                    BEST VALUE
                  </Badge>
                  <h2 className="text-2xl font-bold text-primary">Platinum Plan</h2>
                </div>
                <Badge className="bg-primary text-primary-foreground mx-auto mb-4">
                  YEARLY SUBSCRIPTION
                </Badge>
                <CardTitle className="text-3xl font-bold">€89.99</CardTitle>
                <p className="text-sm text-muted-foreground h-5">per year (billed annually)</p>
                <div className="h-14 flex flex-col justify-center">
                  <p className="text-sm text-green-600 font-semibold">
                    Just €7.50/month - Save €29.89!
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    🔄 Auto-renews yearly
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Full access to all features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm"><strong>25% savings</strong> vs monthly plan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Lock in your rate for 12 months</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime (subscription-based)</span>
                  </div>
                </div>
                <div className="space-y-4 mt-auto">
                  <Button 
                    className="w-full text-lg py-6" 
                    onClick={() => handleSubscribe('platinum')}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Start Yearly Plan"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Renews automatically each year • Best value for committed members
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Notice */}
          <div className="text-center mb-8">
            <p className="text-xs text-muted-foreground">
              🔄 All plans are recurring subscriptions
            </p>
          </div>

          {/* FAQ / Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details & FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Why choose a recurring subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  Subscriptions give you uninterrupted access and better value. The yearly plan offers 25% savings - that's €29.89 you save compared to paying monthly!
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                </p>
                <p className="text-sm font-medium text-primary">
                  How to cancel: Go to your Dashboard → Click "Manage Subscription" → Cancel your plan
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, debit cards, and various local payment methods through our secure payment processor.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">How do recurring payments work?</h3>
                <p className="text-sm text-muted-foreground">
                  Your subscription automatically renews at the end of each billing cycle (monthly or yearly). This ensures uninterrupted access to all premium features. You'll receive a reminder before each renewal.
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="font-semibold mb-1 text-amber-700 dark:text-amber-400">💡 Pro Tip: Choose Yearly!</h3>
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  Our yearly plan is the smart choice for committed fitness enthusiasts. At just €7.50/month, you save 25% and lock in your rate for a full year. It's the best value for your fitness journey!
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
