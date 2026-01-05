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
  Eye,
  UserCheck,
  X,
  ClipboardCheck,
  LayoutDashboard,
  MessageCircle,
  Flame,
  Building2,
  CircleMinus,
  Gift,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { FirstTimeDiscountBanner } from "@/components/pricing/FirstTimeDiscountBanner";
import { FirstTimeDiscountInlineCallout } from "@/components/pricing/FirstTimeDiscountInlineCallout";
import { AlreadyPremiumCard } from "@/components/pricing/AlreadyPremiumCard";

export default function SmartyPlans() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check for first-time discount
  const hasFirstTimeDiscount = searchParams.get('discount') === 'first35';
  
  // Original and discounted prices
  const goldOriginal = 9.99;
  const platinumOriginal = 89.99;
  const goldDiscounted = Number((goldOriginal * 0.65).toFixed(2));
  const platinumDiscounted = Number((platinumOriginal * 0.65).toFixed(2));

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

    setLoading(true);
    const priceIds = {
      gold: 'price_1SJ9q1IxQYg9inGKZzxxqPbD',
      platinum: 'price_1SJ9qGIxQYg9inGKFbgqVRjj'
    };

    // CRITICAL: Open window BEFORE async call to avoid Safari/iOS popup blocker
    const checkoutWindow = window.open('', '_blank');

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          priceId: priceIds[plan],
          applyFirstTimeDiscount: hasFirstTimeDiscount
        }
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

      if (data?.url && checkoutWindow) {
        checkoutWindow.location.href = data.url;
        toast({
          title: "Checkout opened",
          description: "Complete your purchase in the opened window",
        });
      } else if (checkoutWindow) {
        checkoutWindow.close();
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
      setLoading(false);
    }
  };

  const comparisonFeatures = [
    { category: "Workouts", icon: Dumbbell, visitor: false, subscriber: true, premium: true },
    { category: "Training Programs", icon: Flame, visitor: false, subscriber: true, premium: true },
    { category: "Daily Smarty Ritual", icon: Sparkles, visitor: false, subscriber: true, premium: true },
    { category: "Smarty Check-ins", icon: ClipboardCheck, visitor: false, subscriber: false, premium: true },
    { category: "Dashboard", icon: LayoutDashboard, visitor: false, subscriber: "limited", premium: true },
    { category: "LogBook", icon: FileText, visitor: false, subscriber: false, premium: true },
    { category: "Exercise Library", icon: BookOpen, visitor: true, subscriber: true, premium: true },
    { category: "Calculators (1RM, BMR, Macro)", icon: Calculator, visitor: false, subscriber: true, premium: true },
    { category: "Blog", icon: BookOpen, visitor: true, subscriber: true, premium: true },
    { category: "Workout Interactions", icon: Heart, visitor: false, subscriber: "limited", premium: true },
    { category: "Program Interactions", icon: Heart, visitor: false, subscriber: "limited", premium: true },
    { category: "WhatsApp Interaction with Coach", icon: MessageCircle, visitor: false, subscriber: false, premium: true }
  ];

  const renderFeatureValue = (value: string | boolean) => {
    if (value === false) return <X className="w-5 h-5 text-destructive ml-auto" />;
    if (value === true) return <Check className="w-5 h-5 text-green-600 ml-auto" />;
    if (value === "limited") return <CircleMinus className="w-5 h-5 text-sky-500 ml-auto" />;
    return <span className="text-sm text-right">{value}</span>;
  };

  const benefits = [
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
        <title>Smarty Plans | Premium Membership | SmartyGym | Compare Gold vs Platinum</title>
        <meta name="description" content="Compare SmartyGym membership plans - Gold €9.99/month or Platinum €89.99/year (save 25%). 500+ workouts, training programs, fitness tools. First-time subscribers get 35% off. Cancel anytime." />
        <meta name="keywords" content="SmartyGym plans, compare gym memberships, Gold vs Platinum, online gym pricing, monthly vs yearly gym, affordable online fitness, gym subscription comparison, premium fitness plans, smartygym pricing, 35% off first subscription" />
        
        <meta property="og:title" content="Compare Premium Plans | SmartyGym" />
        <meta property="og:description" content="Gold €9.99/month or Platinum €89.99/year. Compare features and choose your perfect fitness plan." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/smarty-plans" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Compare Premium Plans | SmartyGym" />
        <meta name="twitter:description" content="Gold vs Platinum - Find your perfect membership plan." />
        
        <link rel="canonical" href="https://smartygym.com/smarty-plans" />
        
        {/* AI Search Optimization Meta Tags */}
        <meta name="ai-subscription-offer" content="35% off first billing cycle for new subscribers" />
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
              "price": hasFirstTimeDiscount ? goldDiscounted.toString() : goldOriginal.toString(),
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
              "price": hasFirstTimeDiscount ? platinumDiscounted.toString() : platinumOriginal.toString(),
              "priceCurrency": "EUR",
              "availability": "https://schema.org/InStock",
              "url": "https://smartygym.com/smarty-plans",
              "priceValidUntil": "2026-12-31"
            },
            "category": "Online Fitness Membership"
          })}
        </script>
        
        {/* Sale/Discount Schema - Only when discount is active */}
        {hasFirstTimeDiscount && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Sale",
              "name": "First-Time Subscriber 35% Discount",
              "description": "New subscribers get 35% off their first billing cycle on Gold or Platinum plans",
              "seller": {
                "@type": "Organization",
                "name": "SmartyGym"
              },
              "priceSpecification": [
                {
                  "@type": "PriceSpecification",
                  "name": "Gold Plan (Discounted)",
                  "price": goldDiscounted.toString(),
                  "priceCurrency": "EUR"
                },
                {
                  "@type": "PriceSpecification",
                  "name": "Platinum Plan (Discounted)",
                  "price": platinumDiscounted.toString(),
                  "priceCurrency": "EUR"
                }
              ]
            })}
          </script>
        )}
        
        {/* FAQ Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What is the difference between Gold and Platinum plans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Both plans include full access to all SmartyGym features. Gold is billed monthly at €9.99/month. Platinum is billed yearly at €89.99/year (€7.50/month equivalent), saving you 25% compared to monthly billing."
                }
              },
              {
                "@type": "Question",
                "name": "How much does SmartyGym cost per month?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "SmartyGym Gold costs €9.99/month. With Platinum yearly billing, the effective cost is just €7.50/month. First-time subscribers get 35% off their first billing cycle."
                }
              },
              {
                "@type": "Question",
                "name": "Can I switch between Gold and Platinum plans?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can upgrade from Gold to Platinum anytime to lock in yearly savings. Contact support for assistance with plan changes."
                }
              }
            ]
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
        aiSummary="SmartyGym Premium Plans comparison: Gold Plan €9.99/month vs Platinum Plan €89.99/year (save 25%). Both include 500+ workouts, training programs, fitness calculators, and expert coaching. First-time subscribers get 35% off. Cancel anytime."
        aiKeywords={["compare gym plans", "Gold vs Platinum", "online gym pricing", "fitness subscription comparison", "best value gym membership"]}
        relatedContent={["Premium Benefits", "Workout Library", "Training Programs", "Fitness Tools"]}
        targetAudience="fitness enthusiasts comparing membership options"
        pageType="Product"
      />

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-6xl px-4 pb-8">
          {canGoBack && (
            <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </Button>
          )}

          <PageBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Smarty Plans" }]} />

          {/* Show Already Premium Card for premium users */}
          {isPremium && (
            <AlreadyPremiumCard className="mb-8" />
          )}

          {/* Persistent First-Time Discount Banner for eligible users - only show if not premium */}
          {!isPremium && <FirstTimeDiscountBanner />}

          {/* First-Time Discount Banner */}
          {hasFirstTimeDiscount && !isPremium && (
            <div className="mb-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 border-2 border-green-500 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-green-600">
                  First-Time Subscriber Discount Applied!
                </h2>
              </div>
              <p className="text-center text-green-700 dark:text-green-400 text-sm sm:text-base">
                Welcome! Enjoy <span className="font-bold">35% off</span> your first billing cycle on any plan below.
              </p>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Transform Your Fitness Journey</h1>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                Join thousands of members who've upgraded to premium and achieved their fitness goals
              </p>
            </div>
          </div>

          {/* What You Get with Premium */}
          <Card className="mb-8 bg-white dark:bg-card border-2 border-primary/40 shadow-primary">
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

          {/* Compare Access Levels */}
          <Card className="mb-8 overflow-hidden border-2 border-[hsl(var(--primary)/0.6)] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Compare Access Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              <div className="md:hidden space-y-6">
                <Card className="border-2 border-[hsl(var(--primary)/0.3)]">
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

                <Card className="border-2 border-[hsl(var(--primary)/0.5)]">
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

                <Card className="border-2 border-[hsl(var(--primary)/0.8)] bg-gradient-to-br from-[hsl(var(--primary)/0.1)] to-[hsl(var(--primary)/0.2)]">
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
              {/* Pricing Cards - Full width to align with Compare Access Levels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Gold Plan */}
                <Card className={`relative border-2 border-[#D4AF37] shadow-lg flex flex-col ${hasFirstTimeDiscount ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                  {hasFirstTimeDiscount && (
                    <Badge className="absolute -top-2 left-2 bg-green-600 text-white px-2 py-0.5 z-10">
                      35% OFF
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2 sm:pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Gold Plan</h2>
                    <Badge className="bg-[#D4AF37] text-white mx-auto mb-3 sm:mb-4">MONTHLY</Badge>
                    {hasFirstTimeDiscount ? (
                      <>
                        <p className="text-lg text-muted-foreground line-through">€{goldOriginal.toFixed(2)}</p>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-green-600">€{goldDiscounted.toFixed(2)}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">first month</p>
                        <p className="text-xs text-green-600 font-semibold mt-1">Then €{goldOriginal.toFixed(2)}/month</p>
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-2xl sm:text-3xl font-bold">€{goldOriginal.toFixed(2)}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">per month</p>
                      </>
                    )}
                    <p className="text-xs text-[#D4AF37] font-semibold mt-2">🔄 Auto-renews monthly</p>
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
                      <Button 
                        className={`w-full py-4 sm:py-6 text-white ${hasFirstTimeDiscount ? 'bg-green-600 hover:bg-green-700' : 'bg-[#D4AF37] hover:bg-[#C9A431]'}`}
                        onClick={() => handleSubscribe('gold')}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : hasFirstTimeDiscount ? "Claim 35% Off" : "Start Monthly Plan"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Auto-renews each month</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Platinum Plan */}
                <Card className={`relative border-2 border-[#A8A9AD] shadow-lg flex flex-col bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10 ${hasFirstTimeDiscount ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                  <Badge className="absolute -top-2 right-2 sm:-top-3 sm:right-3 bg-green-600 text-white px-2 sm:px-3 py-1 z-10">
                    {hasFirstTimeDiscount ? '35% OFF + BEST VALUE' : 'BEST VALUE'}
                  </Badge>
                  <CardHeader className="text-center pb-2 sm:pb-4 pt-4 sm:pt-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#A8A9AD]" />
                      <h2 className="text-xl sm:text-2xl font-bold text-[#A8A9AD]">Platinum</h2>
                    </div>
                    <Badge className="bg-[#A8A9AD] text-white mx-auto mb-3 sm:mb-4">YEARLY</Badge>
                    {hasFirstTimeDiscount ? (
                      <>
                        <p className="text-lg text-muted-foreground line-through">€{platinumOriginal.toFixed(2)}</p>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-green-600">€{platinumDiscounted.toFixed(2)}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">first year</p>
                        <p className="text-xs text-green-600 font-semibold mt-1">Then €{platinumOriginal.toFixed(2)}/year</p>
                        <p className="text-xs text-muted-foreground">Just €{(platinumDiscounted / 12).toFixed(2)}/month first year • 🔄 Auto-renews yearly</p>
                      </>
                    ) : (
                      <>
                        <CardTitle className="text-2xl sm:text-3xl font-bold">€{platinumOriginal.toFixed(2)}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">per year</p>
                        <p className="text-sm text-green-600 font-bold mt-2">Save €29.89!</p>
                        <p className="text-xs text-muted-foreground">Just €7.50/month • 🔄 Auto-renews yearly</p>
                      </>
                    )}
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
                      <Button 
                        className={`w-full py-4 sm:py-6 text-white ${hasFirstTimeDiscount ? 'bg-green-600 hover:bg-green-700' : 'bg-[#A8A9AD] hover:bg-[#9A9B9F]'}`}
                        onClick={() => handleSubscribe('platinum')}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : hasFirstTimeDiscount ? "Claim 35% Off" : "Start Yearly Plan"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Auto-renews each year</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* First-Time Discount Inline Callout - shown below pricing cards */}
              <FirstTimeDiscountInlineCallout />

              {/* Why Choose Yearly - Compact */}
              <Card className="mb-6 border-2 border-primary">
                <CardHeader className="bg-primary/5 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Why Choose the Yearly Plan?</CardTitle>
                    <Badge className="bg-green-600 text-white">BEST VALUE</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-bold mb-3">Save Big with Annual Membership</h3>
                      <div className="space-y-2">
                        {yearlyBenefits.map((benefit, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 flex flex-col justify-center">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Monthly Plan</p>
                        <div className="text-lg font-bold line-through text-muted-foreground mb-1">€9.99 × 12 = €119.88</div>
                        <p className="text-xs text-muted-foreground mb-2">per year</p>
                        <p className="text-xs text-muted-foreground mb-1">Annual Plan (Save 25%)</p>
                        <div className="text-2xl font-bold text-primary mb-1">€89.99</div>
                        <p className="text-sm text-green-600 font-semibold">You save €29.89!</p>
                      </div>
                    </div>
                </div>
                </CardContent>
              </Card>

              {/* Corporate Plans Promotion */}
              <Card className="mb-8 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400">
                      Looking for Corporate Plans?
                    </h3>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
                    Empower your team with group fitness subscriptions. Choose from flexible plans for organizations of any size - from small teams to enterprises.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-600"
                    onClick={() => navigate('/corporate')}
                  >
                    View Corporate Plans
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Premium user message */}
          {isPremium && (
            <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-500">
              <CardContent className="p-6 text-center">
                <Crown className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-green-700 dark:text-green-400">
                  🎉 You're Already a Premium Member!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300 mb-4">
                  You have full access to all premium features. Enjoy your fitness journey!
                </p>
                <Button onClick={() => navigate('/userdashboard')} variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}

          {/* FAQ */}
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

          {/* CTA for non-authenticated */}
          {!user && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">Don't have an account yet?</p>
              <Button variant="outline" onClick={() => navigate('/auth')}>Sign Up Free</Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
