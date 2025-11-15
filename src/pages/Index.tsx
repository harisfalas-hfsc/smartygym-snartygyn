import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import workoutHeroImg from "@/assets/workout-hero.jpg";
import { BackToTop } from "@/components/BackToTop";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TestimonialsSlider } from "@/components/TestimonialsSlider";
import { useAllPrograms } from "@/hooks/useProgramData";
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
  const { data: programs } = useAllPrograms();

  // Featured programs for Section 7
  const featuredPrograms = useMemo(() => {
    if (!programs) return [];
    
    const weightLoss = programs.find(p => p.category?.toLowerCase().includes('weight'));
    const strength = programs.find(p => p.category?.toLowerCase().includes('strength'));
    const mobility = programs.find(p => p.category?.toLowerCase().includes('mobility'));
    
    const featured = [weightLoss, strength, mobility].filter(Boolean);
    return featured.length === 3 ? featured : programs.slice(0, 3);
  }, [programs]);

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
    description: "Structured training programs to achieve your long-term specific goals"
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
                "description": "Structured long-term training programs for specific fitness goals"
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
        
        {/* SECTION 1: Hero - Full Screen */}
        <section className="relative min-h-screen flex items-center py-12 sm:py-16 px-4 bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30">
          <div className="container mx-auto max-w-7xl">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="text-center lg:text-left space-y-6">
                  <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground leading-tight">
                    Your Gym Reimagined. Anytime. Anywhere.
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                    Science-based workouts and training programs created by Sports Scientist and Strength Coach Haris Falas. Train at home, outdoors, in your gym or on the go with expert guidance.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/premiumbenefits")}
                      className="w-full sm:w-auto text-base"
                    >
                      Start Training
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => navigate("/premiumbenefits")}
                      className="w-full sm:w-auto text-base"
                    >
                      Plans
                    </Button>
                  </div>
                </div>

                {/* Right Column - Smartphone Mockup */}
                <div className="flex justify-center lg:justify-end">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-sm sm:max-w-none">
                    <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-foreground/10">
                      <img 
                        src={workoutHeroImg} 
                        alt="Workout of the Day"
                        className="w-full aspect-[9/16] object-cover"
                      />
                    </div>
                    <div className="hidden sm:block rounded-2xl overflow-hidden shadow-2xl border-4 border-foreground/10">
                      <img 
                        src={workoutHeroImg} 
                        alt="Program Preview"
                        className="w-full aspect-[9/16] object-cover"
                      />
                    </div>
                    <div className="hidden sm:block rounded-2xl overflow-hidden shadow-2xl border-4 border-foreground/10">
                      <img 
                        src={workoutHeroImg} 
                        alt="Timer Screenshot"
                        className="w-full aspect-[9/16] object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      {/* Main Content */}
      <main className="space-y-16 py-16">
        
        {/* SECTION 2: Value Proposition */}
        <section className="px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                What You Get Inside SmartyGym
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="p-6 sm:p-8 text-center border-2 hover:border-primary/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Daily Workouts</h3>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    Fresh, structured training sessions updated weekly.
                  </p>
                </Card>
                <Card className="p-6 sm:p-8 text-center border-2 hover:border-primary/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Training Programs</h3>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    4–8 week goal-based plans for fat loss, strength, toning, and mobility.
                  </p>
                </Card>
                <Card className="p-6 sm:p-8 text-center border-2 hover:border-primary/50 transition-colors">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <Wrench className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Fitness Tools</h3>
                  <p className="text-muted-foreground text-base sm:text-lg">
                    Timers, calculators, trackers, and guided coaching videos.
                  </p>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 3: Problem/Solution */}
        <section className="px-4 bg-muted/30 py-16">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left - Image */}
                <div className="order-2 lg:order-1">
                  <img 
                    src={workoutHeroImg} 
                    alt="Person training"
                    className="w-full aspect-video object-cover rounded-xl shadow-lg"
                  />
                </div>
                
                {/* Right - Text */}
                <div className="order-1 lg:order-2 space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Training Should Fit Your Life. Not the Other Way Around.
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Whether you're busy, traveling, or simply prefer training from home, SmartyGym gives you clear structure, expert coaching, and easy-to-follow workouts — without needing a gym membership.
                  </p>
                  <div className="space-y-3">
                    {[
                      "Train at home or gym",
                      "Minimal equipment options",
                      "Structured weekly plan",
                      "Professional coaching guidance",
                      "New content weekly"
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-base sm:text-lg">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/workout")}
                    className="mt-6"
                  >
                    Explore Workouts
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 4: Why It Works */}
        <section className="px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                Why SmartyGym Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="p-6 sm:p-8 border-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Expert Coaching</h3>
                    <p className="text-muted-foreground">
                      All workouts and programs are designed by Sports Scientist and Strength Coach Haris Falas.
                    </p>
                  </div>
                </Card>
                <Card className="p-6 sm:p-8 border-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10">
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Simple Structure</h3>
                    <p className="text-muted-foreground">
                      Follow clear training plans with progression, technique cues, and weekly updates.
                    </p>
                  </div>
                </Card>
                <Card className="p-6 sm:p-8 border-2">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10">
                      <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Total Flexibility</h3>
                    <p className="text-muted-foreground">
                      Train anywhere — at home, outdoors, or while traveling. No excuses.
                    </p>
                  </div>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 5: Who It's For */}
        <section className="px-4 bg-muted/30 py-16">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <Card className="border-2 border-primary/30 bg-background/80">
                <div className="p-6 sm:p-8 md:p-10 space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
                    Perfect For
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-sm sm:text-base">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Busy professionals</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Parents</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Beginners</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Intermediate lifters</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Plane className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Travelers</span>
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Dumbbell className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">Anyone who wants structure without paying for a personal trainer</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 6: Sample Workout */}
        <section className="px-4">
          <div className="container mx-auto max-w-4xl">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30">
                <div className="p-8 sm:p-10 md:p-12 text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20">
                    <Dumbbell className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Try a Free Workout
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Experience exactly how SmartyGym feels with a complete sample workout from our library.
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => navigate("/workout")}
                    className="w-full sm:w-auto text-base"
                  >
                    Start Free Workout
                  </Button>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 7: Featured Training Programs */}
        <section className="px-4 bg-muted/30 py-16">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                Start With a Program
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredPrograms.map((program) => (
                  <Card 
                    key={program.id}
                    className="overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/trainingprogram/${program.category}/${program.id}`)}
                  >
                    {program.image_url && (
                      <img 
                        src={program.image_url} 
                        alt={program.name}
                        className="w-full aspect-video object-cover"
                      />
                    )}
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-semibold line-clamp-2">
                        {program.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {program.weeks && <span>• {program.weeks} Weeks</span>}
                        {program.difficulty && <span>• {program.difficulty}</span>}
                        {program.equipment && <span>• {program.equipment}</span>}
                      </div>
                      {program.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {program.description}
                        </p>
                      )}
                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/trainingprogram/${program.category}/${program.id}`);
                        }}
                      >
                        Start Program
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 8: Testimonials */}
        <section className="px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
                Real People. Real Results.
              </h2>
              <TestimonialsSlider />
              {/* TODO: Replace with real testimonials when available */}
            </ScrollReveal>
          </div>
        </section>

        {/* SECTION 9: Final CTA */}
        <section className="px-4">
          <div className="container mx-auto max-w-4xl">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30 border-2 border-primary">
                <div className="p-8 sm:p-10 md:p-12 text-center space-y-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    Begin Your Fitness Journey Today
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join from only €9.99 per month. Cancel anytime. New workouts and programs added weekly.
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => navigate("/premiumbenefits")}
                    className="w-full sm:w-auto text-base px-8 py-6"
                  >
                    Start Training
                  </Button>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

      </main>

    </div>
    </>
  );
};

export default Index;
