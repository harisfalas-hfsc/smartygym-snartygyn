import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { BackToTop } from "@/components/BackToTop";
import { useAccessControl } from "@/hooks/useAccessControl";

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
    description: "Standalone sessions designed to challenge, motivate, and make you sweat"
  }, {
    id: "trainingprogram",
    icon: Calendar,
    title: "Training Programs",
    description: "Structured 6-8 week programs designed by Sports Scientist Haris Falas"
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
        <title>SmartyGym Cyprus | Online Fitness | AMRAP TABATA HIIT | smartygym.com</title>
        <meta name="description" content="SmartyGym - Your gym Reimagined. AMRAP, TABATA, HIIT workouts by Sports Scientist Haris Falas. Train anywhere, anytime with convenient online fitness at smartygym.com" />
        <meta name="keywords" content="smartygym, online fitness, smartygym.com, SmartyGym Cyprus, online fitness Cyprus, Haris Falas fitness, AMRAP workouts, TABATA training, HIIT workouts, circuit training, for time workouts, bodyweight training, no equipment workouts, functional fitness, strength training online, cardio workouts, metabolic conditioning, mobility training, power workouts, challenge workouts, convenient fitness, flexible training, sports scientist Cyprus, home workouts, online gym, gym anywhere anytime" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="SmartyGym | Online Fitness - Train Anywhere, Anytime" />
        <meta property="og:description" content="SmartyGym - Your gym Reimagined. Train anywhere, anytime at smartygym.com with science-based programs by Haris Falas." />
        <meta property="og:image" content={smartyGymLogo} />
        <meta property="og:site_name" content="Smarty Gym" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="SmartyGym | Online Fitness" />
        <meta property="twitter:description" content="SmartyGym - Your gym Reimagined. Train anywhere, anytime by Haris Falas at smartygym.com" />
        
        <link rel="canonical" href="https://smartygym.com/" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsActivityLocation",
            "name": "Smarty Gym",
            "alternateName": "smartygym.com",
            "url": "https://smartygym.com",
            "logo": smartyGymLogo,
            "description": "Cyprus online fitness platform offering human-designed workout programs by Sports Scientist Haris Falas",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CY",
              "addressLocality": "Cyprus"
            },
            "founder": {
              "@type": "Person",
              "name": "Haris Falas",
              "jobTitle": "Sports Scientist & Strength and Conditioning Coach"
            },
            "areaServed": ["Cyprus", "International"],
            "availableLanguage": ["English"]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 px-4 border-b border-border bg-gradient-to-br from-background to-muted/30">
          <div className="container mx-auto max-w-4xl text-center space-y-3 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4">
              SmartyGym
            </h1>
            <p className="text-lg sm:text-xl text-center text-muted-foreground mb-6">
              Your Gym Reimagined. Anywhere, Anytime.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Science-based workouts designed by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>, Sports Scientist & Strength and Conditioning Coach. 
            Free workouts available, no login required at smartygym.com
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <Button size="lg" onClick={() => navigate("/workout")} aria-label="Start free workout with Smarty Gym">
                Start Free Workout
              </Button>
              {!isPremium && (
                <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} aria-label="Join Smarty Gym premium membership">
                  Join Premium
                </Button>
              )}
            </div>
          </div>
        </section>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 px-4">
            
            
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {services.map(service => <ServiceCard key={service.id} icon={service.icon} title={service.title} description={service.description} onClick={() => handleServiceSelect(service.id)} />)}
          </div>

          {/* CTA Section */}
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-soft text-center">
            <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-4 leading-tight">
              Ready to Transform Your Fitness?
            </h3>
            <p className="text-muted-foreground text-xs sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed">
              Subscribe to unlock all features and get access to unlimited personalized
              workouts, training programs, and diet plans designed by expert fitness coaches.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Available worldwide – All prices in Euro (€)
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-yellow-500/20 via-amber-500/15 to-yellow-600/20 border-2 border-yellow-600/40 rounded-lg p-4 sm:p-6 flex-1 w-full">
                <div className="text-yellow-600 dark:text-yellow-400 font-bold text-base sm:text-xl mb-1 sm:mb-2">GOLD</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">€9.99</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">per month</div>
                <Button variant="default" className="w-full text-sm sm:text-base" onClick={() => handleSubscribe('gold')}>
                  Get Started
                </Button>
              </div>
              <div className="bg-gradient-to-br from-slate-300/30 via-gray-200/20 to-slate-300/30 dark:from-slate-700/30 dark:via-slate-600/20 dark:to-slate-700/30 border-2 border-slate-400/50 dark:border-slate-500/50 rounded-lg p-4 sm:p-6 flex-1 w-full relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                  BEST VALUE
                </div>
                <div className="text-slate-700 dark:text-slate-300 font-bold text-base sm:text-xl mb-1 sm:mb-2">PLATINUM</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">€89.99</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">per year</div>
                <Button variant="default" className="w-full text-sm sm:text-base" onClick={() => handleSubscribe('platinum')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
    </>
  );
};

export default Index;
