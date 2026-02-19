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
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useShowBackButton } from "@/hooks/useShowBackButton";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { AlreadyPremiumCard } from "@/components/pricing/AlreadyPremiumCard";

export default function SmartyPlans() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canGoBack, goBack } = useShowBackButton();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
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
        body: { priceId: priceIds[plan], trial: true }
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
    { category: "Workouts", icon: Dumbbell, visitor: false, subscriber: "limited", premium: true },
    { category: "Training Programs", icon: Flame, visitor: false, subscriber: "limited", premium: true },
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
                  "text": "SmartyGym Gold costs €9.99/month. With Platinum yearly billing, the effective cost is just €7.50/month."
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
        aiSummary="SmartyGym Premium Plans comparison: Gold Plan €9.99/month vs Platinum Plan €89.99/year (save 25%). Both include 500+ workouts, training programs, fitness calculators, and expert coaching. Cancel anytime."
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

          {/* Header */}
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Transform Your Fitness Journey</h1>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-sm text-muted-foreground">
                Join thousands of members who've upgraded to premium and achieved their fitness goals
              </p>
              <p className="text-sm font-semibold text-primary mt-2">
                🎉 Try free for 7 days. Cancel anytime.
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
              {/* Pricing Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Gold Plan */}
                <Card className="relative border-2 border-[#D4AF37] shadow-lg flex flex-col">
                  <CardHeader className="text-center pb-2 sm:pb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#D4AF37]">Gold Plan</h2>
                    <Badge className="bg-[#D4AF37] text-white mx-auto mb-3 sm:mb-4">MONTHLY</Badge>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">€{goldOriginal.toFixed(2)}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">per month</p>
                    <p className="text-xs text-green-600 font-semibold mt-2">🎉 7 days free trial included</p>
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
                      <Button 
                        className="w-full py-4 sm:py-6 text-white bg-[#D4AF37] hover:bg-[#C9A431]"
                        onClick={() => handleSubscribe('gold')}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Start 7-Day Free Trial"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Auto-renews each month</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Platinum Plan */}
                <Card className="relative border-2 border-[#A8A9AD] shadow-lg flex flex-col bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10">
                  <Badge className="absolute -top-2 right-2 sm:-top-3 sm:right-3 bg-green-600 text-white px-2 sm:px-3 py-1 z-10">
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
                    <p className="text-xs text-green-600 font-semibold mt-1">🎉 7 days free trial included</p>
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
                      <Button 
                        className="w-full py-4 sm:py-6 text-white bg-[#A8A9AD] hover:bg-[#9A9B9F]"
                        onClick={() => handleSubscribe('platinum')}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "Start 7-Day Free Trial"}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Auto-renews each year</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">What's the difference between Gold and Platinum?</h3>
                <p className="text-sm text-muted-foreground">
                  Both plans include the same premium features - the only difference is billing frequency. Gold is billed monthly, while Platinum is billed yearly and saves you 25%.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! You can cancel your subscription at any time from your dashboard. You'll keep access until the end of your current billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Can I switch plans?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade from Gold to Platinum anytime. Contact support for assistance with plan changes.
                </p>
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
