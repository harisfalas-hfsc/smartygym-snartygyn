import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  ArrowLeft,
  Zap,
  Sparkles,
  Heart,
  TrendingUp,
  Target,
  Gift
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

export default function JoinPremium() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check if first-time discount is active
  const isDiscountActive = searchParams.get('discount') === 'first35';
  
  // Pricing
  const goldOriginal = 9.99;
  const platinumOriginal = 89.99;
  const goldDiscounted = parseFloat((goldOriginal * 0.65).toFixed(2));
  const platinumDiscounted = parseFloat((platinumOriginal * 0.65).toFixed(2));

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
        body: { 
          priceId: priceIds[plan],
          applyFirstTimeDiscount: isDiscountActive 
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: isDiscountActive ? "35% discount applied!" : "Checkout opened",
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
    { icon: Dumbbell, title: "Unlimited Workouts", description: "Access to all personalized workout plans" },
    { icon: Calendar, title: "Training Programs", description: "Structured training programs to achieve long-term goals" },
    { icon: Heart, title: "Track Favorites", description: "Save and organize your favorite workouts" },
    { icon: TrendingUp, title: "Progress Tracking", description: "Monitor completed workouts and achievements" },
    { icon: Target, title: "Goal Setting", description: "Set and track your fitness goals" },
    { icon: BookOpen, title: "Exercise Library", description: "Complete exercise database with videos" },
    { icon: Calculator, title: "Fitness Tools", description: "BMR, 1RM, and macro calculators with history" },
    { icon: Sparkles, title: "Smarty Rituals & Check-ins", description: "Daily wellness routines and fitness tracking check-ins" },
    { icon: Zap, title: "Priority Support", description: "Get help when you need it" }
  ];

  return (
    <>
      <Helmet>
        <title>Gold & Platinum Membership | Premium Online Gym | SmartyGym by Haris Falas | smartygym.com</title>
        <meta name="description" content="Join SmartyGym Premium at smartygym.com - Gold Plan €9.99/month or Platinum €89.99/year. Unlimited workouts, training programs, calculators, full dashboard access. Premium online gym by Sports Scientist Haris Falas. Cancel anytime." />
        <meta name="keywords" content="online gym membership, premium fitness, gym subscription, online gym plans, Gold membership SmartyGym, Platinum membership SmartyGym, smartygym premium, online fitness subscription, gym membership online, affordable online gym, premium workouts, unlimited training programs, Haris Falas membership, smartygym.com premium" />
        
        <meta property="og:title" content="Premium Membership | SmartyGym | smartygym.com" />
        <meta property="og:description" content="Gold €9.99/month or Platinum €89.99/year. Unlimited workouts, training programs, premium fitness tools." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/join-premium" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Premium Membership | SmartyGym" />
        <meta name="twitter:description" content="Gold €9.99/month or Platinum €89.99/year. Unlimited fitness access." />
        
        <link rel="canonical" href="https://smartygym.com/join-premium" />
        
        {/* Product Schema - Gold Plan */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "SmartyGym Gold Plan",
            "description": "Monthly premium membership with unlimited workouts, training programs, and fitness calculators",
            "brand": {
              "@type": "Brand",
              "name": "SmartyGym"
            },
            "offers": {
              "@type": "Offer",
              "price": "9.99",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://smartygym.com/join-premium",
              "priceValidUntil": "2026-12-31"
            },
            "category": "Online Fitness Membership"
          })}
        </script>
        
        {/* Product Schema - Platinum Plan */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "SmartyGym Platinum Plan",
            "description": "Yearly premium membership with unlimited workouts, training programs, and fitness calculators. Best value.",
            "brand": {
              "@type": "Brand",
              "name": "SmartyGym"
            },
            "offers": {
              "@type": "Offer",
              "price": "89.99",
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://smartygym.com/join-premium",
              "priceValidUntil": "2026-12-31"
            },
            "category": "Online Fitness Membership"
          })}
        </script>
        
        {/* BreadcrumbList Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://smartygym.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Premium Plans",
                "item": "https://smartygym.com/join-premium"
              }
            ]
          })}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["Premium Membership", "Online Gym Subscription", "Gold Plan", "Platinum Plan"]}
        topics={["online gym membership", "fitness subscription", "premium access", "unlimited workouts"]}
        expertise={["subscription management", "membership benefits", "premium fitness"]}
        contentType="Membership Plans"
        aiSummary="SmartyGym Premium Membership: Gold Plan €9.99/month or Platinum Plan €89.99/year. Unlimited access to 500+ workouts, training programs, fitness calculators, and expert coaching by Sports Scientist Haris Falas. Cancel anytime."
        aiKeywords={["online gym membership", "fitness subscription", "premium workouts", "unlimited training programs", "fitness membership", "gym subscription online"]}
        relatedContent={["Premium Benefits", "Workout Library", "Training Programs", "Fitness Tools"]}
        targetAudience="fitness enthusiasts seeking unlimited access"
        pageType="Product"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-7xl p-4 py-8">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}

          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Premium Plans" }
          ]} />

          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Join Premium</h1>
          <p className="text-center text-muted-foreground mb-4">
            Unlock your full fitness potential with unlimited access to all premium features
          </p>

          {/* First-Time Discount Banner */}
          {isDiscountActive && (
            <Card className="mb-6 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-primary/30 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Gift className="h-6 w-6 text-primary animate-pulse" />
                  <h3 className="text-lg sm:text-xl font-bold text-primary">
                    First-Time Subscriber Discount Applied!
                  </h3>
                  <Gift className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  You're getting <span className="font-bold text-primary">35% off</span> your first billing cycle. This discount will be automatically applied at checkout!
                </p>
              </CardContent>
            </Card>
          )}

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
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{feature.title}</span>
                      <span className="text-xs text-muted-foreground">{feature.description}</span>
                    </div>
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
              className="relative border-2 border-[#D4AF37] shadow-lg flex flex-col"
              data-plan="gold"
              data-keywords="online gym membership, smarty gym, online fitness subscription, smartygym.com"
              aria-label="Gold Plan - SmartyGym online gym membership - smartygym.com"
            >
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mb-2 sm:mb-3">
                  <h2 
                    className="text-xl sm:text-2xl font-bold text-[#D4AF37]"
                    itemProp="name"
                  >
                    Gold Plan
                  </h2>
                </div>
                <Badge className="bg-[#D4AF37] text-white mx-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                  MONTHLY
                </Badge>
                {isDiscountActive ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">€{goldOriginal}</span>
                      <CardTitle className="text-2xl sm:text-3xl font-bold text-primary" itemProp="offers">€{goldDiscounted}</CardTitle>
                    </div>
                    <p className="text-xs sm:text-sm text-primary font-semibold" itemProp="description">per month (35% off!)</p>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl sm:text-3xl font-bold" itemProp="offers">€{goldOriginal}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground h-4 sm:h-5" itemProp="description">per month</p>
                  </>
                )}
                <div className="h-10 sm:h-14 flex flex-col justify-center">
                  <p className="text-xs text-[#D4AF37] font-semibold">
                    🔄 Auto-renews monthly
                  </p>
                </div>
                <meta itemProp="brand" content="SmartyGym - smartygym.com" />
                <meta itemProp="category" content="Online Gym Membership" />
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                <div className="space-y-1.5 sm:space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all Smarty Workouts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all Smarty Programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to Smarty Ritual</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to Smarty Tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Flexible monthly billing</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Perfect for trying premium</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 mt-auto">
                  <Button 
                    className="w-full text-sm sm:text-lg py-4 sm:py-6 bg-[#D4AF37] hover:bg-[#C9A431] text-white" 
                    onClick={() => handleSubscribe('gold')}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : (
                      <>
                        <span className="sm:hidden">Get Monthly</span>
                        <span className="hidden sm:inline">Start Monthly Plan</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Auto-renews each month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="relative border-2 border-[#A8A9AD] shadow-lg flex flex-col bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10">
              <Badge className="absolute -top-2 right-2 sm:-top-3 sm:right-3 bg-green-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm shadow-md z-10">
                BEST VALUE
              </Badge>
              
              <CardHeader className="text-center pb-2 sm:pb-4 pt-4 sm:pt-6">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8A9AD]" />
                  <h2 className="text-xl sm:text-2xl font-bold text-[#A8A9AD]">Platinum</h2>
                </div>
                <Badge className="bg-[#A8A9AD] text-white mx-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                  YEARLY
                </Badge>
                {isDiscountActive ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg text-muted-foreground line-through">€{platinumOriginal}</span>
                      <CardTitle className="text-2xl sm:text-3xl font-bold text-primary">€{platinumDiscounted}</CardTitle>
                    </div>
                    <p className="text-xs sm:text-sm text-primary font-semibold">per year (35% off!)</p>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">€{platinumOriginal}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground h-4 sm:h-5">per year</p>
                  </>
                )}
                <div className="h-10 sm:h-14 flex flex-col justify-center">
                  <p className="text-sm sm:text-base text-green-600 font-bold">
                    Save €29.89!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Just €7.50/month • 🔄 Auto-renews yearly
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                <div className="space-y-1.5 sm:space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all Smarty Workouts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all Smarty Programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to Smarty Ritual</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to Smarty Tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-bold text-green-600">25% savings vs monthly</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Best for committed fitness goals</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 mt-auto">
                  <Button 
                    className="w-full text-sm sm:text-lg py-4 sm:py-6 bg-[#A8A9AD] hover:bg-[#9A9B9F] text-white" 
                    onClick={() => handleSubscribe('platinum')}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : (
                      <>
                        <span className="sm:hidden">Get Yearly</span>
                        <span className="hidden sm:inline">Start Yearly Plan</span>
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Auto-renews each year
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
