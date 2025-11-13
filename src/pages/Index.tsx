import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import { BackToTop } from "@/components/BackToTop";
import { useAccessControl } from "@/hooks/useAccessControl";
import { PageTitleCard } from "@/components/PageTitleCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { DecorativeDivider } from "@/components/DecorativeDivider";
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
        <meta name="keywords" content="online gym, online fitness, gym Cyprus, online gym Cyprus, fitness gym online, Haris Falas, Haris Falas Cyprus, Cyprus fitness, Cyprus personal trainer, personal training, online personal training, Cyprus personal training, online workouts, workout training programs, training programs online, smartygym, smartygym.com, SmartyGym Cyprus, AMRAP workouts, TABATA training, HIIT workouts, circuit training, functional fitness, strength training, cardio workouts, metabolic training, home workouts, bodyweight training, no equipment workouts, fitness programs, workout programs, gym programs online, convenient fitness, flexible gym, anytime fitness, anywhere fitness, Cyprus gym, online fitness platform, fitness in Cyprus, sports scientist Cyprus, strength conditioning coach, online fitness coach, virtual gym, digital gym, home gym programs, workout plans online, fitness app Cyprus, gym membership online, premium fitness, fitness subscription, gym Reimagined" />
        
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
        <section className="relative py-8 sm:py-12 px-4 border-b border-border bg-gradient-to-br from-background to-muted/30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-4xl space-y-3 sm:space-y-4 relative z-10">
            <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-primary/10 mb-6 sm:mb-8">
              <div className="p-4 sm:p-6 text-center relative">
                <TooltipProvider>
                  {/* Left Side Icons - Hidden on mobile to prevent overlap */}
                  <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 flex-row gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Dumbbell 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/workout")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Workouts</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Target 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/trainingprogram")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Programs</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <UserCheck 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/personal-training")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Personal Training</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Right Side Icons - Hidden on mobile to prevent overlap */}
                  <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 flex-row gap-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Wrench 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/tools")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tools</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Video 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/exerciselibrary")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exercise Library</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <FileText 
                          className="w-7 h-7 text-primary cursor-pointer transition-all duration-200 hover:scale-110 hover:text-primary/80" 
                          onClick={() => navigate("/blog")}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Blog</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
                
                {/* Title and Subtitle */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(var(--primary),0.3)] px-4 sm:px-12">
                  Smarty Gym
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 px-4 sm:px-12">
                  Your Gym Re-imagined. Anywhere, Anytime
                </p>
                
                {/* Decorative Divider */}
                <DecorativeDivider className="mt-3 px-4 sm:px-12" />
              </div>
            </Card>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Welcome to Cyprus' premier online gym - <strong>smartygym.com</strong>. Expert online fitness workouts, structured training programs, and personalized online personal training designed by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a> - Sports Scientist & Strength Conditioning Coach with 20+ years experience. 
            Your convenient gym anywhere, anytime. Free online workouts available.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <Button size="lg" onClick={() => navigate("/workout")} aria-label="Start free workout with Smarty Gym">
                Get Started
              </Button>
              {!isPremium && (
                <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} aria-label="Join Smarty Gym premium membership">
                  Subscribe Now
                </Button>
              )}
            </div>
          </div>
        </section>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Decorative Divider */}
          <DecorativeDivider className="mb-12" />
          
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

          {/* Decorative Divider */}
          <DecorativeDivider className="my-12" />

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
