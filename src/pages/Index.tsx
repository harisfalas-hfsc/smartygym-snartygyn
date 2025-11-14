import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import { BackToTop } from "@/components/BackToTop";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

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
  const handleLogout = async () => {
    try {
      // Sign out with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Force reload to clear all state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const services = [{
    id: "workout",
    icon: Dumbbell,
    title: "Workouts",
    description: "Access hundreds of professionally designed workouts for all levels"
  }, {
    id: "trainingprogram",
    icon: Calendar,
    title: "Training Programs",
    description: "Structured 6-8 week programs to achieve your specific goals"
  }, {
    id: "exerciselibrary",
    icon: BookOpen,
    title: "Exercise Library",
    description: "Browse comprehensive exercise database"
  }, {
    id: "1rmcalculator",
    icon: Calculator,
    title: "1RM Calculator",
    description: "Calculate your one-rep maximum"
  }, {
    id: "bmrcalculator",
    icon: Activity,
    title: "BMR Calculator",
    description: "Calculate your basal metabolic rate"
  }, {
    id: "macrocalculator",
    icon: Flame,
    title: "Macro Calculator",
    description: "Get personalized nutrition recommendations"
  }];
  const handleServiceSelect = (serviceId: string) => {
    const routes: {
      [key: string]: string;
    } = {
      "workout": "/workout",
      "trainingprogram": "/trainingprogram",
      "exerciselibrary": "/exerciselibrary",
      "1rmcalculator": "/1rmcalculator",
      "bmrcalculator": "/bmrcalculator",
      "macrocalculator": "/macrocalculator"
    };
    if (routes[serviceId]) {
      navigate(routes[serviceId]);
    }
  };
  const handleSubscribe = async (plan: 'gold' | 'platinum') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const priceIds = {
      gold: 'price_1SJ9q1IxQYg9inGKZzxxqPbD',
      platinum: 'price_1SJ9qGIxQYg9inGKFbgqVRjj'
    };
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: priceIds[plan]
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive"
      });
    }
  };
  return (
    <>
      <Helmet>
        <title>Online Gym Cyprus | SmartyGym by Haris Falas | Online Fitness & Personal Training</title>
        <meta name="description" content="#1 Online Gym in Cyprus - SmartyGym by Sports Scientist Haris Falas. Professional online fitness workouts, training programs & online personal training. AMRAP, TABATA, HIIT workouts. Your convenient gym anywhere, anytime. smartygym.com" />
        <meta name="keywords" content="gym, online gym, online fitness, gym Cyprus, online gym Cyprus, fitness gym online, Haris Falas, Haris Falas Cyprus, Cyprus fitness, Cyprus personal trainer, personal training, online personal training, Cyprus personal training, online workouts, workout training programs, training programs online, smartygym, smartygym.com, SmartyGym Cyprus, AMRAP workouts, TABATA training, HIIT workouts, circuit training, functional fitness, strength training, cardio workouts, metabolic training, home workouts, bodyweight training, no equipment workouts, fitness programs, workout programs, gym programs online, convenient fitness, flexible gym, anytime fitness, anywhere fitness, Cyprus gym, Cyprus online fitness, fitness in Cyprus, sports scientist Cyprus, strength conditioning coach, online fitness coach, virtual gym, digital gym, home gym programs, workout plans online, fitness app Cyprus, gym membership online, premium fitness, fitness subscription, gym Reimagined" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="Online Gym Cyprus | SmartyGym by Haris Falas | Online Fitness & Personal Training" />
        <meta property="og:description" content="#1 Online Gym Cyprus - Professional online fitness workouts, training programs & online personal training by Sports Scientist Haris Falas. Your convenient gym anywhere, anytime." />
        <meta property="og:image" content={smartyGymLogo} />
        <meta property="og:site_name" content="SmartyGym Cyprus - Online Gym & Fitness" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Online Gym Cyprus | SmartyGym by Haris Falas" />
        <meta property="twitter:description" content="#1 Online Gym Cyprus - Professional online fitness, workouts, training programs & online personal training by Sports Scientist Haris Falas at smartygym.com" />
        <meta property="twitter:image" content={smartyGymLogo} />
        
        <link rel="canonical" href="https://smartygym.com/" />
        
        {/* Structured Data - Organization & Gym */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["SportsActivityLocation", "HealthAndBeautyBusiness", "Organization"],
            "name": "SmartyGym Cyprus",
            "alternateName": ["Smarty Gym", "smartygym.com", "SmartyGym", "Online Gym Cyprus"],
            "url": "https://smartygym.com",
            "logo": smartyGymLogo,
            "image": smartyGymLogo,
            "description": "#1 Online Gym in Cyprus - Professional online fitness platform offering expert online workouts, structured training programs, and personalized online personal training by Sports Scientist Haris Falas. Convenient gym experience anywhere, anytime.",
            "slogan": "Your Gym Re-imagined. Anywhere, Anytime.",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CY",
              "addressLocality": "Cyprus",
              "addressRegion": "Cyprus"
            },
            "founder": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
              "description": "Cyprus fitness expert, personal trainer and sports scientist with 20+ years experience specializing in functional training, strength conditioning, and online fitness coaching"
            },
            "areaServed": [
              {"@type": "Country", "name": "Cyprus"},
              {"@type": "Place", "name": "Worldwide"}
            ],
            "availableLanguage": ["English", "Greek"],
            "priceRange": "€€",
            "knowsAbout": ["Online Fitness", "Personal Training", "Workout Programs", "Strength Training", "HIIT Training", "Functional Fitness", "Sports Science"],
            "offers": [
              {
                "@type": "Offer",
                "name": "Online Gym Membership - Gold Plan",
                "description": "Premium online gym membership with unlimited access to professional online fitness workouts and training programs",
                "price": "9.99",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "name": "Online Gym Membership - Platinum Plan",
                "description": "Annual online gym membership with unlimited access to all online fitness content",
                "price": "89.99",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "name": "Online Workouts",
                "description": "Professional online fitness workouts: AMRAP, TABATA, HIIT, circuit training, strength, cardio, metabolic conditioning"
              },
              {
                "@type": "Offer",
                "name": "Online Training Programs",
                "description": "Structured 6-8 week online training programs for specific fitness goals"
              },
              {
                "@type": "Offer",
                "name": "Online Personal Training Cyprus",
                "description": "Personalized online personal training by Cyprus Sports Scientist Haris Falas"
              }
            ]
          })}
        </script>
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SmartyGym Cyprus",
            "url": "https://smartygym.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://smartygym.com/workout?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 px-4 border-b border-border bg-background overflow-hidden">
          
          <div className="container mx-auto max-w-6xl relative z-10">
            <ScrollReveal>
              <Card 
                itemScope
                itemType="https://schema.org/Organization"
                className="border-2 border-primary bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30 backdrop-blur-sm"
                data-hero-section="true"
                data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, online gym Cyprus"
                aria-label="Smarty Gym Cyprus - Your online gym and fitness platform - smartygym.com"
              >
                <div className="p-8 sm:p-10 md:p-12 space-y-6 sm:space-y-8">
                  
                  {/* Main Headline */}
                  <div className="text-center space-y-2 sm:space-y-3">
                    <h1 
                      className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent"
                      itemProp="name"
                    >
                      Welcome to SmartyGym
                    </h1>
                    <p 
                      className="text-lg sm:text-xl text-muted-foreground font-medium"
                      itemProp="slogan"
                    >
                      Your Gym Re-imagined. Anywhere, Anytime.
                    </p>
                    <meta itemProp="url" content="https://smartygym.com" />
                    <meta itemProp="description" content="Smarty Gym Cyprus - #1 online gym and fitness platform by Haris Falas - smartygym.com" />
                    <meta itemProp="foundingLocation" content="Cyprus" />
                  </div>

                  {/* Three Core Messages: WHAT, WHY, HOW */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    
                    {/* WHAT */}
                    <div className="text-center space-y-3 p-4 rounded-lg bg-background/50 border border-primary/20">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Smartphone className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        Your Gym In Your Pocket
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Professional fitness platform with expert workouts, structured programs, and personalized coaching - accessible worldwide at smartygym.com.
                      </p>
                    </div>

                    {/* WHY */}
                    <div className="text-center space-y-3 p-4 rounded-lg bg-background/50 border border-primary/20">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <UserCheck className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        100% Human. 0% AI.
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Every workout personally designed by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-semibold">Haris Falas</a> with 20+ years of experience. Real expertise, not algorithms.
                      </p>
                    </div>

                    {/* HOW */}
                    <div className="text-center space-y-3 p-4 rounded-lg bg-background/50 border border-primary/20">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Dumbbell className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">
                        Train Anywhere, Anytime
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Access professional workouts on any device. Flexible training that fits YOUR schedule and YOUR goals—at home, gym, or traveling.
                      </p>
                    </div>
                  </div>

                  {/* Feature Highlights Grid */}
                  <div className="border-t border-primary/20 pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      
                      <div className="flex items-start gap-3">
                        <Dumbbell className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">100+ Expert Workouts</p>
                          <p className="text-xs text-muted-foreground">AMRAP, HIIT, Strength & more</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Training Programs</p>
                          <p className="text-xs text-muted-foreground">6-8 week structured plans</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <UserCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Personal Training</p>
                          <p className="text-xs text-muted-foreground">Custom plans by Haris Falas</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Wrench className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Smart Tools</p>
                          <p className="text-xs text-muted-foreground">BMR, Macro, 1RM calculators</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Video className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Exercise Library</p>
                          <p className="text-xs text-muted-foreground">Comprehensive video guide</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Community Support</p>
                          <p className="text-xs text-muted-foreground">Connect with members</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/workout")} 
                      className="w-full sm:w-auto min-w-[200px]"
                      aria-label="Start free workout with Smarty Gym"
                    >
                      Start Your Free Workout
                    </Button>
                    {!isPremium && (
                      <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => navigate("/premiumbenefits")}
                        className="w-full sm:w-auto min-w-[200px]"
                        aria-label="Join Smarty Gym premium membership"
                      >
                        View Premium Plans
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center mb-8 px-4">
            
            
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {services.map((service) => (
              <ScrollReveal key={service.id}>
                <ServiceCard 
                  icon={service.icon} 
                  title={service.title} 
                  description={service.description} 
                  onClick={() => handleServiceSelect(service.id)} 
                />
              </ScrollReveal>
            ))}
          </div>

          {/* CTA Section */}
          <ScrollReveal>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-soft text-center">
              <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 leading-tight">
                Ready to Start Your Fitness Journey?
              </h3>
              <p className="text-muted-foreground text-xs sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
                Join the community of fitness enthusiasts and get access to premium content
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Available worldwide – All prices in Euro (€)
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-yellow-600/20 border-2 border-yellow-600/40 rounded-lg p-4 sm:p-6 flex-1 w-full">
                  <div className="text-yellow-600 dark:text-yellow-400 font-bold text-sm sm:text-base md:text-xl mb-1 sm:mb-2">Gold Plan - All Included</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">€9.99</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4">per month</div>
                  <Button variant="default" className="w-full text-sm sm:text-base py-2 sm:py-3" onClick={() => handleSubscribe('gold')}>
                    Get Started
                  </Button>
                </div>
                <div className="bg-gradient-to-br from-slate-300/30 via-gray-200/20 to-slate-300/30 dark:from-slate-700/30 dark:via-slate-600/20 dark:to-slate-700/30 border-2 border-slate-400/50 dark:border-slate-500/50 rounded-lg p-4 sm:p-6 flex-1 w-full relative">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap z-10">
                    BEST VALUE
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-bold text-sm sm:text-base md:text-xl mb-1 sm:mb-2">Platinum Plan - All Included</div>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">€89.99</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 md:mb-4">per year</div>
                  <Button variant="default" className="w-full text-sm sm:text-base py-2 sm:py-3" onClick={() => handleSubscribe('platinum')}>
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>

    </div>
    </>
  );
};

export default Index;
