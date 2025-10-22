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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);

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
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
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
        <title>Smarty Gym - Your Fitness Reimagined Anywhere, Anytime | Online Gym by Haris Falas</title>
        <meta name="description" content="Smarty Gym - Train anywhere, anytime with human-designed functional fitness programs by certified sports scientist Haris Falas. Convenient online gym reimagined for smart, effective training. No AI, just real expertise.Smarty Gym (smartygym.com) - Cyprus online fitness platform by Haris Falas. Convenient, flexible gym reimagined for anywhere, anytime training. Human-designed workouts, training programs & fitness tools." />
        <meta name="keywords" content="smartygym, smarty gym, smartygym.com, Haris Falas, gym reimagined, fitness reimagined, convenient fitness, flexible gym, online fitness Cyprus, anywhere anytime fitness, functional training, strength training online" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="Smarty Gym - Your Fitness Reimagined Anywhere, Anytime" />
        <meta property="og:description" content="Convenient & flexible online fitness by Haris Falas. Gym reimagined for the modern lifestyle - train anywhere, anytime with human-designed programs." />
        <meta property="og:image" content={smartyGymLogo} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Smarty Gym - Fitness Reimagined" />
        <meta property="twitter:description" content="Convenient & flexible gym by Haris Falas. Train anywhere, anytime with smartygym.com" />
        
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
              Smarty Gym
            </h1>
            <p className="text-sm sm:text-base text-center text-muted-foreground mb-3 sm:mb-4">
              Your Gym Reimagined, Anywhere, Anytime
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Train smarter with science-based workouts designed by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>, Sports Scientist & Strength and Conditioning Coach. 
            Free workouts available, no login required.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center pt-2">
              <Button size="lg" onClick={() => navigate("/workout")} aria-label="Start free workout with Smarty Gym">
                Start Free Workout
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} aria-label="Join Smarty Gym premium membership">
                Join Premium
              </Button>
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center">
              <div className="bg-muted rounded-lg p-4 sm:p-6 flex-1 w-full sm:max-w-xs">
                <div className="text-primary font-bold text-base sm:text-xl mb-1 sm:mb-2">GOLD</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">€9.99</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">per month</div>
                <Button variant="default" className="w-full text-sm sm:text-base" onClick={() => handleSubscribe('gold')}>
                  Get Started
                </Button>
              </div>
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 sm:p-6 flex-1 w-full sm:max-w-xs relative">
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                  BEST VALUE
                </div>
                <div className="text-primary font-bold text-base sm:text-xl mb-1 sm:mb-2">PLATINUM</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">€89.99</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">per year</div>
                <Button variant="default" className="w-full text-sm sm:text-base" onClick={() => handleSubscribe('platinum')}>
                  Get Started
                </Button>
              </div>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30 rounded-lg p-4 sm:p-6 flex-1 w-full sm:max-w-xs">
                <div className="text-primary font-bold text-base sm:text-xl mb-1 sm:mb-2">PERSONAL TRAINING</div>
                <div className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">€119</div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">one-time payment</div>
                <Button variant="default" className="w-full text-sm sm:text-base" onClick={() => navigate('/personal-training')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <section className="py-8">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-center mb-6">What Our Community Says</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "Smarty Gym has transformed how I approach fitness. The workouts are challenging but doable, and I love that I can do them anywhere!"
                  </p>
                  <p className="font-semibold text-sm">— Alex M., London</p>
                </Card>
                <Card className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 italic">
                    "Finally, a fitness platform that actually understands real people's needs. No gimmicks, just solid training."
                  </p>
                  <p className="font-semibold text-sm">— Maria S., Berlin</p>
                </Card>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4 font-semibold">
                  Trusted by hundreds of athletes and everyday movers worldwide
                </p>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => navigate("/community")}
                  aria-label="See more customer reviews"
                >
                  See More Reviews
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>

    </div>
    </>
  );
};

export default Index;
