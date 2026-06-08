import { Helmet } from "react-helmet";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CheckCircle2, Target, Heart, Users, Shield, Award, Compass, GraduationCap, Plane, Dumbbell, UserCheck, Smartphone, Calendar, Video, Wrench, FileText, BookOpen, ChevronRight, Flame, Crown, Check, Loader2, Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import harisPhoto from "@/assets/haris-falas-coach.png";
import { useAccessControl } from "@/hooks/useAccessControl";
import { SEOEnhancer } from "@/components/SEOEnhancer";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";
import { useState } from "react";
import { STRIPE_PRICE_IDS } from "@/config/pricing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const About = () => {
  const navigate = useNavigate();
  const { user, userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<"gold" | "platinum" | null>(null);
  const [activeAudienceTooltip, setActiveAudienceTooltip] = useState<string | null>(null);

  const audienceList = [
    { icon: Users, label: "Busy Adults", color: "text-blue-500", description: "Perfect for professionals juggling work and life. Get effective workouts that fit your schedule—no commute, no waiting for equipment. Train when you have time, not when the gym is open." },
    { icon: Heart, label: "Parents", color: "text-pink-500", description: "Train at home while kids nap or play nearby. No babysitter needed, no guilt about \"me time.\" Quick, focused sessions that work around your family's schedule." },
    { icon: GraduationCap, label: "Beginners", color: "text-emerald-500", description: "Start your fitness journey with confidence. Clear instructions, proper form guidance, and progressive programs designed to build your foundation safely." },
    { icon: Target, label: "Intermediate", color: "text-orange-500", description: "Break through plateaus with structured periodization. Challenge yourself with varied programming that keeps you progressing without the guesswork." },
    { icon: Plane, label: "Travelers", color: "text-cyan-500", description: "Stay consistent no matter where you are. Hotel room, Airbnb, or park—these workouts adapt to any space with minimal or no equipment needed." },
    { icon: Dumbbell, label: "Gym-Goers", color: "text-purple-500", description: "Enhance your gym routine with expert programming. Follow structured plans that maximize your gym time and ensure balanced, progressive training." },
  ];

  const handlePlanClick = async (plan: "gold" | "platinum") => {
    if (isPremium) {
      navigate("/userdashboard");
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(plan);
    try {
      const priceId = plan === "gold" ? STRIPE_PRICE_IDS.gold : STRIPE_PRICE_IDS.platinum;
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not start checkout. Please try again.",
        variant: "destructive",
      });
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>About SmartyGym | Science-Based Online Fitness</title>
        <meta name="description" content="Learn about SmartyGym - Your leading online fitness platform. Science-based workouts, expert coaching by Haris Falas, and accessible training for everyone, anywhere." />
        <meta name="keywords" content="about smartygym, online fitness platform, science-based training, haris falas, online personal training, functional workouts, home gym" />
        
        {/* Open Graph */}
        <meta property="og:title" content="About SmartyGym - Your Online Gym Re-imagined" />
        <meta property="og:description" content="Discover how SmartyGym makes quality fitness accessible to everyone with science-based workouts and expert coaching." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/about" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About SmartyGym - Online Fitness Platform" />
        <meta name="twitter:description" content="Science-based workouts and expert coaching by certified coach Haris Falas." />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://smartygym.com/about" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "SmartyGym",
            "url": "https://smartygym.com",
            "logo": "https://smartygym.com/smarty-gym-logo.png",
            "description": "Online fitness platform providing science-based workouts and training programs designed by certified coach Haris Falas",
            "founder": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength & Conditioning Coach"
            },
            "areaServed": "Worldwide",
            "sameAs": [
              "https://www.instagram.com/smartygym",
              "https://www.facebook.com/smartygym"
            ]
          })}
        </script>
        
        {/* Breadcrumb Schema */}
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
                "name": "About",
                "item": "https://smartygym.com/about"
              }
            ]
          })}
        </script>
      </Helmet>

      <SEOEnhancer
        entities={["About SmartyGym", "Company Information", "Our Mission", "Haris Falas"]}
        topics={["company background", "fitness mission", "online gym platform", "expert coaching"]}
        expertise={["platform development", "fitness coaching", "sports science"]}
        contentType="About Page"
        aiSummary="About SmartyGym: Global online fitness platform founded by Sports Scientist Haris Falas. Science-based workouts, accessible training, and 100% human-designed programs. Your gym reimagined for real life."
        aiKeywords={["about smartygym", "online fitness platform", "haris falas", "fitness mission", "company background", "gym platform"]}
        relatedContent={["Coach Profile", "FAQ", "Contact", "Premium Membership"]}
        targetAudience="users learning about the platform"
        pageType="AboutPage"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pb-8">
          
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "About" }
          ]} />

          {/* Hero Section */}
          <ScrollReveal>
            <div className="mb-12 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground leading-tight">
                About <span className="text-primary">SmartyGym</span>
              </h1>
            </div>
          </ScrollReveal>

          {/* Mission Statement */}
          {/* Desktop: Single card with both paragraphs */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-primary hidden md:block">
              <CardContent className="p-8 lg:p-10">
                <div className="space-y-8 text-center">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mx-auto">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-xs uppercase tracking-wider font-semibold text-primary">Our Mission</span>
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                      Your Gym Re-imagined.<br />
                      <span className="text-primary">Anywhere, Anytime.</span>
                    </h2>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                      Everything a complete gym must offer, built by real professionals, in your pocket at <strong className="text-foreground">smartygym.com</strong>.
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                      We are not here to replace your gym. We are here to back you up when life gets in the way. Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — <span className="text-primary font-semibold">SmartyGym</span> is your backup plan. Or, if you prefer training from home entirely, we've got you covered. Or, if you go to your gym but want to follow a professional, science-based workout or training program designed by{' '}
                      <a
                        href="/coach-profile"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate('/coach-profile');
                        }}
                        className="text-primary hover:underline font-medium cursor-pointer"
                      >
                        Haris Falas
                      </a>, we provide that expert guidance. <span className="font-semibold text-primary">Wherever you are, your gym comes with you.</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                    <p className="text-xs uppercase tracking-wider font-semibold text-primary mb-4 text-center">What's inside</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                      <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-red-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Workout of the Day</span></div>
                      <div className="flex items-center gap-3"><Dumbbell className="w-5 h-5 text-orange-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Expert Workouts</span></div>
                      <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Training Programs</span></div>
                      <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Smarty Ritual</span></div>
                      <div className="flex items-center gap-3"><Video className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Exercise Library</span></div>
                      <div className="flex items-center gap-3"><Wrench className="w-5 h-5 text-purple-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Smarty Tools</span></div>
                      <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-cyan-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">Articles</span></div>
                      <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-pink-500 flex-shrink-0" /><span className="text-sm font-semibold text-foreground">LogBook</span></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Mobile: Two separate cards */}
          <div className="md:hidden space-y-6 mb-12">
            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Your Gym Re-imagined. Anywhere, Anytime.
                  </h2>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/workout/wod')}>
                      <Flame className="w-6 h-6 text-red-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Workout of the Day</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/workout')}>
                      <Dumbbell className="w-6 h-6 text-orange-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Expert-Crafted Workouts</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/trainingprogram')}>
                      <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Structured Training Programs</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/daily-ritual')}>
                      <Sparkles className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Smarty Ritual</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/exerciselibrary')}>
                      <Video className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Exercise Library</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/tools')}>
                      <Wrench className="w-6 h-6 text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Smarty Tools</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/blog')}>
                      <FileText className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">Articles</span>
                    </div>
                    <div className="flex items-center gap-3 cursor-pointer active:opacity-70" onClick={() => navigate('/userdashboard?tab=logbook')}>
                      <BookOpen className="w-6 h-6 text-pink-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-primary hover:underline">LogBook</span>
                    </div>
                  </div>
                  <p className="text-base text-muted-foreground text-center leading-relaxed">
                    Everything a complete gym must offer, built by real professionals, in your pocket at <strong className="text-primary">smartygym.com</strong>.
                  </p>
                  <Link 
                    to="/best-online-fitness-platform" 
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Why We Are the Best
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Smartphone className="w-12 h-12 text-primary mx-auto" />
                  <h2 className="text-2xl font-bold text-foreground">
                    Who Is <span className="text-primary">SmartyGym</span> For
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {audienceList.map((audience) => {
                      const Icon = audience.icon;
                      return (
                        <Tooltip key={audience.label} open={activeAudienceTooltip === audience.label}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex flex-col items-center gap-1 cursor-pointer"
                              onClick={() => setActiveAudienceTooltip(activeAudienceTooltip === audience.label ? null : audience.label)}
                            >
                              <Icon className={`w-7 h-7 ${audience.color}`} />
                              <span className="text-xs font-bold text-foreground text-center">{audience.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            {audience.description}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <div className="pt-4 space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We are not here to replace your gym. We are here to back you up when life gets in the way.
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      Wherever you are, your gym comes with you.
                    </p>
                  </div>
                  <Link 
                    to="/why-invest-in-smartygym" 
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                  >
                    Why Invest in SmartyGym
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile: Core Values - Single compact card */}
          <Card className="mb-12 border-2 border-primary md:hidden">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">What We Stand For</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">100% Human. 0% AI.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Built for Real Life</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Science-Based Approach</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Accessible to Everyone</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-semibold text-foreground">Safe and Effective</span>
                  </div>
                  </div>
                  <Link to="/the-smarty-method" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-2">
                    <BookOpen className="w-4 h-4" />
                    Discover The Smarty Method
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>

          {/* Mobile: Meet the Coach Card */}
          <Card className="mb-12 border-2 border-primary md:hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Meet the Coach</h2>
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/30 flex-shrink-0">
                  <img 
                    src={harisPhoto} 
                    alt="Haris Falas - Head Coach" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary">Message from Haris Falas</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For more than twenty years, I've coached athletes, teams, and everyday people — helping them move better, train smarter, and build lasting fitness habits.
                  </p>
                </div>
                <Link 
                  to="/coach-profile" 
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Read More
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Desktop: Core Values - Grid Layout */}
          <ScrollReveal>
            <section className="mb-12 hidden md:block">
              <div className="text-center mb-6 pb-3 border-b border-border">
                <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">Principles</p>
                <h2 className="text-2xl md:text-3xl font-bold">What We Stand For</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-2 border-border hover:border-primary transition-all group">
                  <CardContent className="p-6 text-center space-y-3">
                    <Heart className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform mx-auto" />
                    <h3 className="font-bold text-lg">Built for Real Life</h3>
                    <p className="text-sm text-muted-foreground">
                      Flexible training that fits your schedule, location, and lifestyle — not the other way around.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all group">
                  <CardContent className="p-6 text-center space-y-3">
                    <Award className="w-10 h-10 text-purple-500 group-hover:scale-110 transition-transform mx-auto" />
                    <h3 className="font-bold text-lg">Science-Based Approach</h3>
                    <p className="text-sm text-muted-foreground">
                      Every workout is designed using evidence-based training principles, not trends or fads.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all group">
                  <CardContent className="p-6 text-center space-y-3">
                    <Users className="w-10 h-10 text-emerald-500 group-hover:scale-110 transition-transform mx-auto" />
                    <h3 className="font-bold text-lg">Accessible to Everyone</h3>
                    <p className="text-sm text-muted-foreground">
                      From beginners to advanced athletes, everyone deserves access to quality fitness guidance.
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border hover:border-primary transition-all group">
                  <CardContent className="p-6 text-center space-y-3">
                    <Shield className="w-10 h-10 text-blue-500 group-hover:scale-110 transition-transform mx-auto" />
                    <h3 className="font-bold text-lg">Safe and Effective</h3>
                    <p className="text-sm text-muted-foreground">
                      Proper technique, realistic progressions, and injury prevention are at the core of everything we do.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </ScrollReveal>

          {/* The SmartyGym Promise */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-border bg-primary/5">
              <CardContent className="p-8 lg:p-10">
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="hidden md:inline-flex w-14 h-14 rounded-xl bg-primary/15 items-center justify-center mb-3">
                      <Compass className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">Our commitment</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">The <span className="text-primary">SmartyGym</span> Promise</h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                      <h3 className="font-bold">Real Expertise</h3>
                      <p className="text-sm text-muted-foreground">
                        Every program is designed by certified coach <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> — never by AI, always with 20+ years of experience.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                      <h3 className="font-bold">Personal Touch</h3>
                      <p className="text-sm text-muted-foreground">
                        Direct access to the coach who created your program. Real support, real guidance, real results.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                      <h3 className="font-bold">Not a Robot</h3>
                      <p className="text-sm text-muted-foreground">
                        We don't generate workouts with algorithms. We design them with care, experience, and your goals in mind.
                      </p>
                    </div>

                  </div>

                  <div className="pt-2 border-t border-border text-center">
                    <a
                      href="/the-smarty-method"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-4"
                    >
                      Discover The Smarty Method
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>


          {/* Desktop/Tablet: Who Is SmartyGym For? - Grid Layout */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-border hidden md:block">
              <CardContent className="p-8 lg:p-10">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="hidden md:inline-flex w-14 h-14 rounded-xl bg-primary/15 items-center justify-center mb-3">
                      <Users className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">Designed for you</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      Who Is <span className="text-primary">SmartyGym</span> For
                    </h2>
                  </div>
                  <div className="grid grid-cols-6 gap-2 max-w-2xl mx-auto">
                    {audienceList.map((audience) => {
                      const Icon = audience.icon;
                      return (
                        <Tooltip key={audience.label} open={activeAudienceTooltip === audience.label}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex flex-col items-center gap-1 cursor-pointer"
                              onMouseEnter={() => setActiveAudienceTooltip(audience.label)}
                              onMouseLeave={() => setActiveAudienceTooltip(null)}
                              onClick={() => setActiveAudienceTooltip(audience.label)}
                            >
                              <Icon className={`w-6 h-6 ${audience.color}`} />
                              <span className="text-sm font-bold text-foreground text-center">{audience.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-center">
                            {audience.description}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border">
                    <Link 
                      to="/why-invest-in-smartygym" 
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Why Invest in SmartyGym
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link 
                      to="/best-online-fitness-platform" 
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Why We Are the Best
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Everywhere, Anywhere Card */}
          <ScrollReveal className="hidden md:block">
            <Card className="mb-12 border-[3px] border-primary/40 overflow-hidden">
              <CardContent className="p-8 lg:p-10 text-center">
                <Plane className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-xs uppercase tracking-widest font-semibold text-primary mb-3">Anywhere</p>
                <h2 className="text-2xl font-bold mb-3 text-primary">
                  Everywhere — Anywhere
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Whether you're <span className="text-primary font-bold">traveling</span>, <span className="text-primary font-bold">busy</span> with life, or simply <span className="text-primary font-bold">can't make it</span> to the gym, we've got you covered. And even if you do go to the <span className="text-primary font-bold">gym</span>, we're here with <span className="text-primary font-bold">structured, science-based, professional workouts and training programs</span> to back you up.
                </p>
                <p className="text-sm text-primary font-bold leading-relaxed mt-4">
                  Wherever you are, your gym comes with you, right in your pocket.
                </p>
                <div className="mt-4 flex justify-center">
                  <Link to="/the-smarty-method" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    <BookOpen className="w-4 h-4" />
                    Discover The Smarty Method
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* Subscription Plans */}
          <ScrollReveal>
            <Card className="mb-12 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Subscription Plans
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center max-w-3xl mx-auto">
                  SmartyGym offers flexible plans to fit your fitness journey, plus the option to purchase
                  individual workouts or programs if you want to give us a try.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {/* Gold Plan */}
                  <button
                    type="button"
                    onClick={() => handlePlanClick("gold")}
                    disabled={loadingPlan !== null}
                    className="text-left p-5 rounded-lg border-2 border-[#D4AF37] shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    aria-label={isPremium ? "Go to your dashboard" : "Subscribe to Gold Plan"}
                  >
                    <div className="text-center mb-3">
                      <h4 className="text-xl font-bold text-[#D4AF37] mb-2">Gold Plan</h4>
                      <Badge className="bg-[#D4AF37] text-white mb-3">MONTHLY</Badge>
                      <p className="text-2xl font-bold">€9.99<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                      <p className="text-xs text-[#D4AF37] font-semibold mt-2">🔄 Auto-renews monthly</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to all Smarty Workouts</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to all Smarty Programs</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to Smarty Ritual</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to Smarty Tools</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Flexible monthly billing</li>
                    </ul>
                    <div className="mt-4 text-center text-xs font-semibold text-[#D4AF37] flex items-center justify-center gap-1">
                      {loadingPlan === "gold" ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Starting checkout…</>
                      ) : isPremium ? (
                        "✓ Included in your plan"
                      ) : (
                        "Click to subscribe →"
                      )}
                    </div>
                  </button>

                  {/* Platinum Plan */}
                  <button
                    type="button"
                    onClick={() => handlePlanClick("platinum")}
                    disabled={loadingPlan !== null}
                    className="text-left p-5 rounded-lg border-2 border-[#A8A9AD] shadow-lg bg-gradient-to-br from-[#A8A9AD]/5 to-[#C0C0C0]/10 relative transition-all hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#A8A9AD] focus:ring-offset-2 cursor-pointer disabled:opacity-70 disabled:cursor-wait"
                    aria-label={isPremium ? "Go to your dashboard" : "Subscribe to Platinum Plan"}
                  >
                    <Badge className="absolute -top-2 right-2 bg-green-600 text-white px-3 py-1 text-xs shadow-md z-10">
                      BEST VALUE
                    </Badge>
                    <div className="text-center mb-3 pt-2">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-[#A8A9AD]" />
                        <h4 className="text-xl font-bold text-[#A8A9AD]">Platinum</h4>
                      </div>
                      <Badge className="bg-[#A8A9AD] text-white mb-3">YEARLY</Badge>
                      <p className="text-2xl font-bold">€89.99<span className="text-sm font-normal text-muted-foreground">/year</span></p>
                      <p className="text-sm text-green-600 font-bold mt-1">Save €29.89!</p>
                      <p className="text-xs text-muted-foreground">Just €7.50/month • 🔄 Auto-renews yearly</p>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to all Smarty Workouts</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to all Smarty Programs</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to Smarty Ritual</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Full access to Smarty Tools</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500 shrink-0" />Best value - save 25%</li>
                    </ul>
                    <div className="mt-4 text-center text-xs font-semibold text-[#A8A9AD] flex items-center justify-center gap-1">
                      {loadingPlan === "platinum" ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> Starting checkout…</>
                      ) : isPremium ? (
                        "✓ Included in your plan"
                      ) : (
                        "Click to subscribe →"
                      )}
                    </div>
                  </button>
                </div>

                {/* Standalone Purchase */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border text-center">
                  <h4 className="font-semibold mb-2">Not Ready for a Plan?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create a free SmartyGym account to browse and filter our free workouts and free training programs, or buy individual premium workouts and programs as standalone purchases — no paid plan required.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link to="/workout"><Button variant="outline" size="sm">Browse Workouts</Button></Link>
                    <Link to="/trainingprogram"><Button variant="outline" size="sm">Browse Programs</Button></Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          {/* CTA - Only visible to non-premium users */}
          {!isPremium && (
            <ScrollReveal>
              <Card className="border-2 border-primary bg-primary/5 text-center">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold">Ready to Start Your Journey?</h2>
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/joinpremium')}
                    className="mt-4"
                  >
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          )}

        </div>
      </div>
    </>
  );
};

export default About;
