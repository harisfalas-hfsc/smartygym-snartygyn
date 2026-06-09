import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { STRIPE_PRICE_IDS } from "@/config/pricing";
import { isIOSNative } from "@/utils/platform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { 
  Crown, 
  Check, 
  Dumbbell, 
  Calendar, 
  Calculator,
  BookOpen,
  
  Zap,
  Sparkles,
  Heart,
  TrendingUp,
  Target,
  Eye,
  UserCheck,
  X,
  ClipboardCheck,
  LayoutDashboard,
  MessageCircle,
  Flame,
  Building2,
  CircleMinus,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { isNativePlatform, openExternal } from "@/utils/native";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { AlreadyPremiumCard } from "@/components/pricing/AlreadyPremiumCard";

export default function SmartyPlans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const [user, setUser] = useState<User | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<'gold' | 'platinum' | null>(null);
  const [mobileCarouselApi, setMobileCarouselApi] = useState<CarouselApi>();
  const selectedPlanRef = useRef<'gold' | 'platinum'>('gold');
  const loading = loadingPlan !== null;
  
  // Pricing
  const goldOriginal = 9.99;
  const platinumOriginal = 89.99;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!mobileCarouselApi) return;

    const syncSelectedPlan = () => {
      selectedPlanRef.current = mobileCarouselApi.selectedScrollSnap() === 1 ? 'platinum' : 'gold';
    };

    const restoreSelectedPlan = () => {
      const index = selectedPlanRef.current === 'platinum' ? 1 : 0;
      requestAnimationFrame(() => mobileCarouselApi.scrollTo(index, true));
    };

    restoreSelectedPlan();
    mobileCarouselApi.on('select', syncSelectedPlan);
    mobileCarouselApi.on('reInit', restoreSelectedPlan);

    return () => {
      mobileCarouselApi.off('select', syncSelectedPlan);
      mobileCarouselApi.off('reInit', restoreSelectedPlan);
    };
  }, [mobileCarouselApi]);

  const handleSubscribe = async (plan: 'gold' | 'platinum') => {
    if (isPremium) {
      toast({
        title: "Already Premium",
        description: "Congratulations, you are already a premium member!",
      });
      navigate('/userdashboard');
      return;
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    selectedPlanRef.current = plan;
    mobileCarouselApi?.scrollTo(plan === 'platinum' ? 1 : 0, true);
    setLoadingPlan(plan);
    const priceIds = {
      gold: STRIPE_PRICE_IDS.gold,
      platinum: STRIPE_PRICE_IDS.platinum,
    };

    // In native Capacitor, skip pre-opening a blank window (not needed)
    // In browser, open window BEFORE async call to avoid Safari/iOS popup blocker
    const checkoutWindow = isNativePlatform() ? null : window.open('', '_blank');

    try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: priceIds[plan] }
      });

      // Handle already subscribed response from backend
      if (data?.hasActiveSubscription) {
        checkoutWindow?.close();
        toast({
          title: "You're Already Subscribed!",
          description: "You already have an active premium subscription.",
        });
        navigate('/userdashboard');
        return;
      }

      if (error) {
        checkoutWindow?.close();
        throw error;
      }

      if (data?.url) {
        if (isNativePlatform()) {
          await openExternal(data.url);
        } else if (checkoutWindow) {
          checkoutWindow.location.href = data.url;
        }
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the opened window",
        });
      } else {
        checkoutWindow?.close();
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const comparisonFeatures = [
    { category: "Smarty Workouts", icon: Dumbbell, visitor: false, subscriber: "limited", premium: true },
    { category: "Smarty Training Programs", icon: Flame, visitor: false, subscriber: "limited", premium: true },
    { category: "Smarty Ritual", icon: Sparkles, visitor: false, subscriber: true, premium: true },
    { category: "Smarty Check-ins", icon: ClipboardCheck, visitor: false, subscriber: false, premium: true },
    { category: "Smarty Tools (1RM, BMR, Macro, Calories, Timer)", icon: Calculator, visitor: true, subscriber: true, premium: true },
    { category: "Dashboard", icon: LayoutDashboard, visitor: false, subscriber: "limited", premium: true },
    { category: "LogBook", icon: FileText, visitor: false, subscriber: false, premium: true },
    { category: "Exercise Library", icon: BookOpen, visitor: true, subscriber: true, premium: true },
    { category: "Blog", icon: BookOpen, visitor: true, subscriber: true, premium: true },
    { category: "Workout Interactions", icon: Heart, visitor: false, subscriber: "limited", premium: true },
    { category: "Program Interactions", icon: Heart, visitor: false, subscriber: "limited", premium: true },
    { category: "WhatsApp Interaction with Coach", icon: MessageCircle, visitor: false, subscriber: false, premium: true }
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (value === false) return <X className="w-5 h-5 text-destructive ml-auto" />;
    if (value === true) return <Check className="w-5 h-5 text-green-600 ml-auto" />;
    if (value === "limited") return (
      <div className="relative inline-flex items-center justify-center w-8 h-8 ml-auto">
        <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
        <CircleMinus className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-amber-500 bg-background rounded-full" strokeWidth={2.6} />
      </div>
    );
    return <span className="text-sm text-right">{value}</span>;
  };

  const benefits = [
    { icon: Dumbbell, title: "All Workouts", description: "Access to all personalized workout plans" },
    { icon: Calendar, title: "Training Programs", description: "Structured training programs to achieve long-term goals" },
    { icon: Heart, title: "Track Favorites", description: "Save and organize your favorite workouts" },
    { icon: TrendingUp, title: "Progress", description: "Monitor completed workouts and achievements" },
    { icon: Target, title: "Goal Setting", description: "Set and track your fitness goals" },
    { icon: BookOpen, title: "Exercise Library", description: "Complete exercise database with videos" },
    { icon: Calculator, title: "Fitness Tools", description: "BMR, 1RM, and macro calculators with history" },
    { icon: Sparkles, title: "Rituals & Check-ins", description: "Daily wellness routines and fitness tracking check-ins" },
    { icon: Zap, title: "Priority Support", description: "Get help when you need it" }
  ];

  const yearlyBenefits = [
    "Save €29.89 (25% off) compared to monthly",
    "Only €7.50 per month when paid annually",
    "Lock in your rate for 12 months",
    "Best value for committed users",
    "Full access to all features"
  ];

  const PricingPlansBlock = () => (
    <>
      {/* Mobile: swipeable carousel */}
      <div className="md:hidden mb-8">
        <Carousel
          className="w-full"
          opts={{ align: "start", loop: false, containScroll: "trimSnaps" }}
          setApi={setMobileCarouselApi}
        >
          <CarouselContent className="-ml-2">
            <CarouselItem className="pl-2 basis-[88%]">
              {GoldPlanCard}
            </CarouselItem>
            <CarouselItem className="pl-2 basis-[88%]">
              {PlatinumPlanCard}
            </CarouselItem>
          </CarouselContent>
        </Carousel>
        <p className="text-center text-xs text-muted-foreground mt-2">← Swipe to compare plans →</p>
      </div>

      {/* Desktop: side-by-side grid */}
      <div className="hidden md:grid grid-cols-2 gap-6 mb-8">
        {GoldPlanCard}
        {PlatinumPlanCard}
      </div>
    </>
  );

  const GoldPlanCard = (
    <Card className="relative border-2 border-[#D4AF37] shadow-lg flex flex-col h-full">
        <CardHeader className="text-center pb-2 sm:pb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Gold Plan</h2>
          <Badge className="bg-[#D4AF37] text-white mx-auto mb-3 sm:mb-4">MONTHLY</Badge>
          <CardTitle className="text-2xl sm:text-3xl font-bold">€{goldOriginal.toFixed(2)}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">per month</p>
          <p className="text-xs text-[#D4AF37] font-semibold mt-1">🔄 Auto-renews monthly</p>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            {["Full access to all Smarty Workouts", "Full access to all Smarty Programs", "Full access to Smarty Ritual", "Full access to Smarty Tools", "Flexible monthly billing", "Cancel anytime"].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm">{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-auto">
            {isIOSNative() ? (
              <div className="text-center text-xs sm:text-sm text-muted-foreground p-3 border rounded">
                Subscribe at <span className="text-primary font-semibold">smartygym.com</span>
              </div>
            ) : (
            <Button
              className="w-full py-4 sm:py-6 text-white bg-[#D4AF37] hover:bg-[#C9A431]"
              onClick={() => handleSubscribe('gold')}
              disabled={loading}
            >
              {loadingPlan === 'gold' ? "Processing..." : "Start Your Plan"}
            </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">Auto-renews each month</p>
          </div>
        </CardContent>
      </Card>
  );

  const PlatinumPlanCard = (
    <Card className="relative overflow-hidden border-2 border-[#A8A9AD] shadow-lg flex flex-col h-full bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10">
        <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-green-600 text-white px-2 sm:px-3 py-1 z-10">
          BEST VALUE
        </Badge>
        <CardHeader className="text-center pb-2 sm:pb-4 pt-4 sm:pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8A9AD]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#A8A9AD]">Platinum</h2>
          </div>
          <Badge className="bg-[#A8A9AD] text-white mx-auto mb-3 sm:mb-4">YEARLY</Badge>
          <CardTitle className="text-2xl sm:text-3xl font-bold">€{platinumOriginal.toFixed(2)}</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">per year</p>
          <p className="text-sm text-green-600 font-bold mt-2">Save €29.89!</p>
          <p className="text-xs text-muted-foreground">Just €7.50/month • 🔄 Auto-renews yearly</p>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
          <div className="space-y-1.5 sm:space-y-2 flex-1">
            {["Full access to all Smarty Workouts", "Full access to all Smarty Programs", "Full access to Smarty Ritual", "Full access to Smarty Tools", "25% savings vs monthly", "Cancel anytime"].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 mt-0.5 ${item.includes("25%") ? "text-green-600" : "text-green-500"}`} />
                <span className={`text-xs sm:text-sm ${item.includes("25%") ? "font-bold text-green-600" : ""}`}>{item}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-auto">
            {isIOSNative() ? (
              <div className="text-center text-xs sm:text-sm text-muted-foreground p-3 border rounded">
                Subscribe at <span className="text-primary font-semibold">smartygym.com</span>
              </div>
            ) : (
            <Button
              className="w-full py-4 sm:py-6 text-white bg-[#A8A9AD] hover:bg-[#9A9B9F]"
              onClick={() => handleSubscribe('platinum')}
              disabled={loading}
            >
              {loadingPlan === 'platinum' ? "Processing..." : "Start Your Plan"}
            </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">Auto-renews each year</p>
          </div>
        </CardContent>
      </Card>
  );

  return (
    <>
      <Helmet>
        <title>Smarty Plans | Premium Membership | SmartyGym | Compare Gold vs Platinum</title>
        <meta name="description" content="Compare SmartyGym membership plans - Gold €9.99/month or Platinum €89.99/year (save 25%). 500+ workouts, training programs, fitness tools. Cancel anytime." />
        <meta name="keywords" content="SmartyGym plans, compare gym memberships, Gold vs Platinum, online gym pricing, monthly vs yearly gym, affordable online fitness, gym subscription comparison, premium fitness plans, smartygym pricing" />
        
        <meta property="og:title" content="Compare Premium Plans | SmartyGym" />
        <meta property="og:description" content="Gold €9.99/month or Platinum €89.99/year. Compare features and choose your perfect fitness plan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/smarty-plans" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Compare Premium Plans | SmartyGym" />
        <meta name="twitter:description" content="Gold vs Platinum - Find your perfect membership plan." />
        
        <link rel="canonical" href="https://smartygym.com/smarty-plans" />
        
        {/* AI Search Optimization Meta Tags */}
        <meta name="ai-pricing-gold" content="€9.99/month recurring subscription" />
        <meta name="ai-pricing-platinum" content="€89.99/year (save 25% vs monthly)" />
        <meta name="ai-comparison" content="Gold: monthly billing, Platinum: yearly billing with 25% savings" />
        <meta name="ai-value-proposition" content="100% human-designed workouts by certified Sports Scientist Haris Falas" />
        
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
              "price": goldOriginal.toString(),
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://smartygym.com/smarty-plans",
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
            "description": "Yearly premium membership with unlimited workouts, training programs, and fitness calculators. Best value - save 25%.",
            "brand": {
              "@type": "Brand",
              "name": "SmartyGym"
            },
            "offers": {
              "@type": "Offer",
              "price": platinumOriginal.toString(),
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://smartygym.com/smarty-plans",
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
                "name": "Smarty Plans",
                "item": "https://smartygym.com/smarty-plans"
              }
            ]
          })}
        </script>
      </Helmet>
      
      <SEOEnhancer
        entities={["Premium Membership", "Online Gym Subscription", "Gold Plan", "Platinum Plan", "SmartyGym"]}
        topics={["online gym membership comparison", "fitness subscription pricing", "premium vs free gym", "monthly vs yearly fitness plans"]}
        expertise={["subscription management", "membership comparison", "fitness pricing"]}
        contentType="Product Comparison"
        aiSummary="SmartyGym Premium Plans comparison: Gold Plan €9.99/month vs Platinum Plan €89.99/year (save 25%). Both include 500+ workouts, training programs, fitness calculators, and expert coaching. Cancel anytime."
        aiKeywords={["compare gym plans", "Gold vs Platinum", "online gym pricing", "fitness subscription comparison", "best value gym membership"]}
        relatedContent={["Premium Benefits", "Workout Library", "Training Programs", "Fitness Tools"]}
        targetAudience="fitness enthusiasts comparing membership options"
        pageType="Product"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pb-8">
          <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Smarty Plans" }]} />

          {/* Show Already Premium Card for premium users */}
          {isPremium && (
            <AlreadyPremiumCard className="mb-8" />
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="block">Transform your fitness journey.</span>
              <span className="block">Join Premium</span>
            </h1>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                Join thousands of members who've upgraded to premium and achieved their fitness goals
              </p>
              <p className="text-sm font-semibold text-primary mt-2">
                Cancel anytime. Auto-renews until cancelled.
              </p>
            </div>
          </div>

          {/* What You Get with Premium */}
          <Card className="mb-8 bg-white dark:bg-card border-2 border-primary/40 shadow-primary">
            <CardHeader>
              <CardTitle className="text-2xl">What You Get with Premium</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile: ultra-compact icon + title pills */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-1.5 py-2 px-1 border-b border-primary/10 min-w-0">
                    <benefit.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium whitespace-nowrap truncate">{benefit.title}</span>
                  </div>
                ))}
              </div>

              {/* Desktop / tablet: full description grid */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Pricing Plans (after What You Get) - Hidden for premium users */}
          {!isPremium && <PricingPlansBlock />}

          {/* Compare Access Levels */}
          <Card className="mb-8 overflow-hidden border-2 border-[hsl(var(--primary)/0.6)] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Compare Access Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="md:hidden">
                <Carousel className="w-full" opts={{ align: "start", loop: false, containScroll: "trimSnaps" }}>
                  <CarouselContent className="-ml-2">
                    <CarouselItem className="pl-2 basis-[88%]">
                      <Card className="border-2 border-[hsl(var(--primary)/0.3)] h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Eye className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold">Visitor</h3>
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
                    </CarouselItem>

                    <CarouselItem className="pl-2 basis-[88%]">
                      <Card className="border-2 border-[hsl(var(--primary)/0.5)] h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <UserCheck className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold">Subscriber</h3>
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
                      <Button className="w-full mt-6" onClick={() => navigate("/auth")}>
                        Sign Up Free
                      </Button>
                    )}
                  </CardContent>
                      </Card>
                    </CarouselItem>

                    <CarouselItem className="pl-2 basis-[88%]">
                      <Card className="border-2 border-[hsl(var(--primary)/0.8)] h-full bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.2)]">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="w-6 h-6 text-primary" />
                      <h3 className="text-2xl font-bold">Premium</h3>
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
                  </CardContent>
                      </Card>
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
                <p className="text-center text-xs text-muted-foreground mt-2">← Swipe Visitor · Subscriber · Premium →</p>
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
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
                        <tr key={idx} className="border-b border-[hsl(var(--primary)/0.2)] hover:bg-[hsl(var(--primary)/0.05)]">
                          <td className="p-4 font-medium">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-primary" />
                              <span>{feature.category}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right">{renderFeatureValue(feature.visitor)}</td>
                          <td className="p-4 text-right">{renderFeatureValue(feature.subscriber)}</td>
                          <td className="p-4 text-right">{renderFeatureValue(feature.premium)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Plans - Hidden for premium users */}
          {!isPremium && (
            <>
              {/* Pricing Cards (after Compare Access Levels) */}
              <PricingPlansBlock />

              {/* Why Choose Yearly - Compact */}
              <Card className="mb-6 border-2 border-primary">
                <CardHeader className="bg-primary/5 py-3">
                  <CardTitle className="text-xl text-center">Why Choose the Yearly Plan?</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-base font-bold mb-2">Save Big with Annual Membership</h3>
                      <div className="space-y-1.5">
                        {yearlyBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-3 flex flex-col justify-center">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Monthly Plan</p>
                        <div className="text-base font-bold line-through text-muted-foreground mb-1">€9.99 × 12 = €119.88</div>
                        <p className="text-xs text-muted-foreground mb-2">per year</p>
                        <p className="text-xs text-muted-foreground mb-1">Annual Plan (Save 25%)</p>
                        <div className="text-xl font-bold text-primary mb-1">€89.99</div>
                        <p className="text-sm text-green-600 font-semibold">You save €29.89!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Cards (after Why Choose Yearly) */}
              <PricingPlansBlock />
            </>
          )}

          {/* Corporate Section */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2">Looking for Corporate Plans?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    We offer special pricing for teams and organizations. Get premium access for your entire team with bulk discounts and dedicated support.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/corporate")}>
                    View Corporate Plans
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-primary/10 rounded-full">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2">Frequently Asked Questions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Want to know more? Find answers to common questions about plans, billing, and access.
                  </p>
                  <Button variant="outline" onClick={() => navigate("/faq")}>
                    View FAQ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA for non-authenticated users */}
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
