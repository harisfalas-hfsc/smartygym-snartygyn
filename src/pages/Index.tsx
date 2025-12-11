import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap, Check, Crown, ChevronDown, ChevronRight, Move, Ban, Brain, CheckCircle2, Award, Shield, Compass, Sparkles, Info, User, HelpCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import harisPhoto from "@/assets/haris-falas-coach.png";
import { MobilePhoneIllustration } from "@/components/MobilePhoneIllustration";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HeroThreeColumns } from "@/components/HeroThreeColumns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const {
    userTier
  } = useAccessControl();
  const isPremium = userTier === "premium";
  const isMobile = useIsMobile();

  // Carousel state for mobile navigation dots
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-cycling state for tablet hero cards
  const [highlightedCardIndex, setHighlightedCardIndex] = useState(0);
  const [isHoveringTablet, setIsHoveringTablet] = useState(false);
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    onSelect();
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Auto-cycle through tablet hero cards every 2.5 seconds
  useEffect(() => {
    if (isHoveringTablet) return; // Pause when hovering

    const interval = setInterval(() => {
      setHighlightedCardIndex(prev => (prev + 1) % 6);
    }, 2500);
    return () => clearInterval(interval);
  }, [isHoveringTablet]);
  const heroCards = [{
    id: "workouts",
    title: "Smarty Workouts",
    description: "500+ expert-designed workout routines for every fitness level and goal",
    buttonText: "Browse Workouts",
    icon: Dumbbell,
    route: "/workout"
  }, {
    id: "programs",
    title: "Smarty Programs",
    description: "Structured multi-week programs designed to transform your fitness journey",
    buttonText: "View Programs",
    icon: Calendar,
    route: "/trainingprogram"
  }, {
    id: "ritual",
    title: "Smarty Ritual",
    description: "Your daily movement ritual for optimal performance - Morning, Midday, and Evening phases",
    buttonText: "View Ritual",
    icon: Sparkles,
    route: "/daily-ritual"
  }, {
    id: "tools",
    title: "Smarty Tools",
    description: "Professional fitness calculators and tracking tools to optimize your training",
    buttonText: "Explore Tools",
    icon: Calculator,
    route: "/tools"
  }, {
    id: "blog",
    title: "Blog & Expert Articles",
    description: "Evidence-based fitness articles and expert insights from professional coaches",
    buttonText: "Read Articles",
    icon: FileText,
    route: "/blog"
  }, {
    id: "exerciselibrary",
    title: "Exercise Library",
    description: "Comprehensive video library with proper form demonstrations and technique guides",
    buttonText: "Browse Library",
    icon: Video,
    route: "/exerciselibrary"
  }];
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    try {
      // Sign out with global scope to clear all sessions
      const {
        error
      } = await supabase.auth.signOut({
        scope: 'global'
      });
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
        description: "You have been logged out successfully"
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
    title: "Smarty Workouts",
    description: "Access hundreds of professionally designed workouts for all levels"
  }, {
    id: "trainingprogram",
    icon: Calendar,
    title: "Smarty Programs",
    description: "Structured training programs to achieve your long-term specific goals"
  }, {
    id: "exerciselibrary",
    icon: BookOpen,
    title: "Exercise Library",
    description: "Browse comprehensive exercise database"
  }, {
    id: "1rmcalculator",
    icon: Calculator,
    title: "Smarty 1RM Calculator",
    description: "Calculate your one-rep maximum"
  }, {
    id: "bmrcalculator",
    icon: Activity,
    title: "Smarty BMR Calculator",
    description: "Calculate your basal metabolic rate"
  }, {
    id: "macrocalculator",
    icon: Flame,
    title: "Smarty Macro Calculator",
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
  return <>
      <Helmet>
        <title>SmartyGym | Online Gym | 500+ Workouts Training Programs | Haris Falas HFSC | smartygym.com</title>
        <meta name="description" content="SmartyGym #1 online gym smartygym.com. 500+ expert workouts training programs by Sports Scientist Haris Falas HFSC. AMRAP TABATA HIIT strength cardio home workouts. Train anywhere anytime. 100% human zero AI." />
        <meta name="keywords" content="smartygym, smarty gym, online gym, online fitness, personal trainer, HFSC, HFSC Performance, Haris Falas, Sports Scientist, AMRAP workouts, TABATA training, HIIT workouts, strength training, cardio workouts, functional training, home workouts, bodyweight workouts, online training programs, workout programs online, fitness calculators, smartygym.com" />
        
        <meta name="semantic-keywords" content="online-fitness, home-workouts, virtual-training, digital-gym, remote-coaching, bodyweight-training, functional-fitness, strength-conditioning" />
        <meta name="workout-formats" content="AMRAP, TABATA, HIIT, circuit-training, interval-training, metabolic-conditioning, functional-training, strength-training" />
        <meta name="training-categories" content="strength, cardio, metabolic, mobility, power, challenge, calorie-burning, core-stability" />
        <meta name="equipment-types" content="bodyweight, no-equipment, kettlebell, dumbbells, resistance-bands, minimal-equipment" />
        <meta name="expertise-areas" content="sports-science, strength-conditioning, functional-fitness, performance-training, evidence-based-training" />
        
        <meta property="schema:name" content="SmartyGym" />
        <meta property="schema:founder" content="Haris Falas" />
        <meta property="schema:serviceType" content="Online Fitness Training" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="Online Gym | SmartyGym by Haris Falas | Professional Fitness Training" />
        <meta property="og:description" content="Premier online gym - Expert-designed workouts by Sports Scientist Haris Falas. 100+ workouts, structured programs, professional coaching at smartygym.com" />
        <meta property="og:image" content={smartyGymLogo} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="SmartyGym" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:locale:alternate" content="en_US" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@smartygym" />
        <meta property="twitter:title" content="Online Gym | SmartyGym by Haris Falas" />
        <meta property="twitter:description" content="Professional online fitness training by Sports Scientist Haris Falas at smartygym.com - Train anywhere, anytime" />
        <meta property="twitter:image" content={smartyGymLogo} />
        
        <link rel="alternate" hrefLang="en-gb" href="https://smartygym.com" />
        <link rel="alternate" hrefLang="en" href="https://smartygym.com" />
        <link rel="alternate" hrefLang="x-default" href="https://smartygym.com" />
        
        <link rel="preconnect" href="https://smartygym.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        
        <link rel="canonical" href="https://smartygym.com/" />
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["SportsActivityLocation", "HealthAndBeautyBusiness", "Organization"],
          "name": "SmartyGym",
          "alternateName": ["Smarty Gym", "smartygym.com", "SmartyGym Online Gym"],
          "url": "https://smartygym.com",
          "logo": smartyGymLogo,
          "image": smartyGymLogo,
          "description": "Premier online gym offering professional fitness training by Sports Scientist Haris Falas. Evidence-based workout programs, structured training plans, and personalized coaching. Train anywhere, anytime with expert guidance.",
          "slogan": "Your Gym Re-imagined. Anywhere, Anytime.",
          "founder": {
            "@type": "Person",
            "name": "Haris Falas",
            "jobTitle": "Sports Scientist & Strength and Conditioning Coach",
            "description": "BSc Sports Science, Certified Strength and Conditioning Specialist (CSCS), EXOS Performance Specialist. 20+ years experience in functional training, strength conditioning, and online fitness coaching."
          },
          "areaServed": {
            "@type": "Place",
            "name": "Worldwide"
          },
          "sameAs": ["https://www.instagram.com/smartygymcy/", "https://www.youtube.com/@TheSmartyGym", "https://www.facebook.com/smartygym"],
          "availableLanguage": ["English"],
          "priceRange": "€€",
          "knowsAbout": ["Online Fitness", "Personal Training", "Workout Programs", "Strength Training", "HIIT Training", "Functional Fitness", "Sports Science", "Metabolic Conditioning", "Cardio Training", "Mobility Training"],
          "offers": [{
            "@type": "Offer",
            "name": "Online Workouts",
            "description": "Professional online workouts: AMRAP, TABATA, HIIT, circuit training, strength, cardio, metabolic"
          }, {
            "@type": "Offer",
            "name": "Online Training Programs",
            "description": "Structured long-term training programs for specific fitness goals"
          }, {
            "@type": "Offer",
            "name": "Online Personal Training",
            "description": "Personalized online personal training by Sports Scientist Haris Falas"
          }]
        })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SmartyGym",
          "url": "https://smartygym.com",
          "description": "Professional online fitness training platform",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://smartygym.com/workout?search={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "SmartyGym Services",
          "description": "Complete online fitness services",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "item": {
              "@type": "Service",
              "name": "Online Workouts",
              "description": "100+ expert-designed workout sessions",
              "url": "https://smartygym.com/workout"
            }
          }, {
            "@type": "ListItem",
            "position": 2,
            "item": {
              "@type": "Service",
              "name": "Training Programs",
              "description": "Structured multi-week training programs",
              "url": "https://smartygym.com/trainingprogram"
            }
          }, {
            "@type": "ListItem",
            "position": 3,
            "item": {
              "@type": "Service",
              "name": "Personal Training",
              "description": "1-on-1 personalized training programs",
              "url": "https://smartygym.com/personaltraining"
            }
          }, {
            "@type": "ListItem",
            "position": 4,
            "item": {
              "@type": "Service",
              "name": "Fitness Tools",
              "description": "Professional fitness calculators",
              "url": "https://smartygym.com/tools"
            }
          }]
        })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://smartygym.com"
          }]
        })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        
        {isMobile ? <section className="pt-2 pb-2 px-4">
            {/* Mobile Carousel Headline */}
            <div className="text-center mb-6">
              <h2 className="text-2xl mb-2">
                <span className="font-normal text-foreground">Welcome to </span>
                <span className="font-bold text-primary">SmartyGym</span>
              </h2>
              <p className="text-base text-muted-foreground">
                Your gym Re-imagined. Anywhere. Anytime.
              </p>
              <p className="text-sm text-primary italic mt-3 px-2">
                Where Science Meets Convenience. Where Real Coaches guide Real people.
              </p>
            </div>

            <Carousel className="w-full px-2" opts={{
          align: "start",
          loop: true
        }} setApi={setCarouselApi}>
              <CarouselContent className="-ml-4">
                {heroCards.map(card => {
              const Icon = card.icon;
              return <CarouselItem key={card.id} className="pl-4 basis-[90%]">
                      <Card onClick={() => navigate(card.route)} className="h-[160px] border-[3px] border-primary/40 hover:border-primary hover:scale-[1.02] hover:shadow-xl hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                        <CardContent className="h-full flex flex-row items-center p-4 gap-4">
                          
                          {/* Icon */}
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 flex-shrink-0">
                            <Icon className="w-7 h-7 text-primary" />
                          </div>
                          
                          {/* Text Content */}
                          <div className="flex-1 flex flex-col justify-center gap-1.5">
                            <h3 className="text-base font-bold text-foreground leading-tight">
                              {card.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                              {card.description}
                            </p>
                          </div>
                          
                          {/* Visual indicator that card is clickable */}
                          <ChevronRight className="w-5 h-5 text-primary/50 flex-shrink-0" />
                          
                        </CardContent>
                      </Card>
                    </CarouselItem>;
            })}
              </CarouselContent>
              
              {/* Arrows positioned OUTSIDE cards */}
              <CarouselPrevious className="hidden -left-12 bg-background border-2 border-primary shadow-lg" />
              <CarouselNext className="hidden -right-12 bg-background border-2 border-primary shadow-lg" />
            </Carousel>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {heroCards.map((_, index) => <button key={index} onClick={() => carouselApi?.scrollTo(index)} className={cn("w-2.5 h-2.5 rounded-full border-2 transition-all duration-300", currentSlide === index ? "border-primary bg-transparent scale-125" : "border-primary/40 bg-transparent hover:border-primary/60")} aria-label={`Go to slide ${index + 1}`} />)}
            </div>

        {/* Quick Access Menu */}
        <div className="mt-8 space-y-3">
              <div onClick={() => navigate('/about')} className="flex items-center gap-2.5 py-1.5 px-4 bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-base font-medium">About SmartyGym</span>
            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </div>
          
          <div onClick={() => navigate('/coach-profile')} className="flex items-center gap-2.5 py-1.5 px-4 bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md">
            <User className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-base font-medium">Coach <span className="text-primary font-semibold">Haris Falas</span></span>
            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </div>
          
              <div onClick={() => navigate('/faq')} className="flex items-center gap-2.5 py-1.5 px-4 bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md">
            <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-base font-medium">FAQ</span>
            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </div>
          
              <div onClick={() => navigate('/shop')} className="flex items-center gap-2.5 py-1.5 px-4 bg-primary/5 border-2 border-border rounded-lg hover:border-primary transition-all cursor-pointer hover:shadow-md">
            <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0" />
            <span className="text-base font-medium">Shop</span>
            <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground" />
          </div>
        </div>

        {/* Mobile Only: Who Is SmartyGym For? */}
        <div className="mt-8 mb-2 px-4">
          <h2 className="text-2xl font-bold text-center mb-6">
            Who Is <span className="text-primary">SmartyGym</span> For?
          </h2>
          
        <div className="space-y-4">
          {/* Busy adults */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Busy adults</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Quick, effective workouts that fit your schedule</p>
          </div>
          
          {/* Parents */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Parents</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Train at home while kids play nearby</p>
          </div>
          
          {/* Beginners */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Beginners</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Start your fitness journey with guided programs</p>
          </div>
          
          {/* Intermediate lifters */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Intermediate lifters</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Push past plateaus with structured plans</p>
          </div>
          
          {/* Travelers */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Plane className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Travelers</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Stay consistent wherever you go</p>
          </div>
          
          {/* Gym-goers */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-6 h-6 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Gym-goers</span>
            </div>
            <p className="text-xs text-muted-foreground ml-9">Enhance your gym routine with expert guidance</p>
          </div>
        </div>
        </div>
          </section> : <>
            {/* Desktop: Hero Section */}
            <section className="relative py-8 sm:py-12 border-b border-border bg-background overflow-hidden my-0">
          
          <div className="container mx-auto max-w-6xl px-4 relative z-10 overflow-x-hidden">
            <ScrollReveal>
              <Card itemScope itemType="https://schema.org/Organization" data-hero-section="true" data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas, global online gym" aria-label="SmartyGym - Your online gym and fitness platform - smartygym.com" className="border-2 border-primary bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30 backdrop-blur-sm my-0 mb-0 mt-0">
                <div className="p-8 sm:p-10 md:p-12 space-y-4">
                  
                  {/* Top Section: Title */}
            <div className="text-center mb-6">
              <div className="inline-block p-6 sm:p-8 bg-background/70 rounded-xl border-2 border-primary/40">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground animate-fade-in" itemProp="name">
                  Welcome to <span className="text-primary">SmartyGym</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium mt-3" itemProp="slogan">
                  Your Gym Re-imagined. Anywhere, Anytime.
                </p>
                <meta itemProp="url" content="https://smartygym.com" />
                <meta itemProp="description" content="SmartyGym - #1 online gym and fitness platform by Haris Falas - smartygym.com" />
              </div>
            </div>

          {/* Tagline/Slogan Card */}
          <div className="flex justify-center mt-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full">
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
              <p className="text-base sm:text-lg font-semibold text-primary italic text-center">
                Where Science Meets Convenience. Where Real Coaches guide Real people.
              </p>
              <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
            </div>
          </div>

                  {/* Three Column Layout: Explore | Who is SmartyGym For? | Credentials */}
                  <HeroThreeColumns />

                  {/* 100% Human. 0% AI Section */}
                  <div className="pt-6">
                    <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-accent/10 overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full -ml-12 -mb-12" aria-hidden="true"></div>
                      
                      <CardContent className="p-8 md:p-12 relative">
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <UserCheck className="w-8 h-8 text-primary" />
                          </div>
                          <Ban className="w-12 h-12 text-destructive" />
                          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <Brain className="w-8 h-8 text-destructive" />
                          </div>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center">
                          100% Human. 0% AI.
                        </h2>
                        
                        <div className="max-w-3xl mx-auto space-y-4 text-center mb-8">
                          <p className="text-lg font-semibold text-foreground">
                            <span className="text-primary font-semibold">SmartyGym</span> workouts and programs are built to fit YOUR life.
                          </p>
                          <p className="text-base leading-relaxed text-muted-foreground">
                            That's why they work — safe and efficient design by <a href="/coach-profile" className="text-primary hover:underline font-medium"><strong>Haris Falas</strong></a>, crafted by hand with care to deliver effective results at <strong>smartygym.com</strong>, <strong className="text-foreground">NOT by AI</strong>.
                          </p>
                          <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border-2 border-primary/30 mt-6">
                            <p className="text-lg font-bold text-primary mb-2">
                              Every workout and training program is science-based and personally created by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>.
                            </p>
                            <p className="text-base text-muted-foreground">
                              Never by AI. Never by algorithms. Always by a real human expert who understands YOUR needs. Training designed by humans, for humans.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                          <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-expertise" data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, sports scientist" role="article" aria-label="Real expertise - SmartyGym Cyprus online fitness - smartygym.com by Haris Falas">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-sm mb-1" itemProp="name">Real Expertise</p>
                              <p className="text-xs text-muted-foreground" itemProp="description">Sports science degree & years of coaching</p>
                            </div>
                          </article>
                          <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-personal-touch" data-keywords="online personal training Cyprus, smartygym, Haris Falas, online fitness, real coaching" role="article" aria-label="Personal touch - SmartyGym Cyprus online training - smartygym.com with real client feedback">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-sm mb-1" itemProp="name">Personal Touch</p>
                              <p className="text-xs text-muted-foreground" itemProp="description">Every program refined through real client feedback</p>
                            </div>
                          </article>
                          <article className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20" itemScope itemType="https://schema.org/Thing" data-feature="smarty-gym-no-ai" data-keywords="human-designed workouts, no AI fitness, smartygym.com, online gym Cyprus, real coaching" role="article" aria-label="Not a robot - SmartyGym Cyprus online gym - human-designed at smartygym.com">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-sm mb-1" itemProp="name">Not a Robot</p>
                              <p className="text-xs text-muted-foreground" itemProp="description">Human-designed workouts backed by science, not AI</p>
                            </div>
                          </article>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        <div className="container mx-auto max-w-6xl px-4">
          {/* Mission Statement with Cards */}
          <section className="mb-16">
            {/* Your Gym Anywhere Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-8">
              <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold flex-1">
                  Your Gym Re-imagined Anywhere, Anytime
                </h3>
                {!isPremium && <Button onClick={() => navigate("/joinpremium", {
                    state: {
                      from: location.pathname
                    }
                  })} className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                    Join Now
                  </Button>}
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                <p className="text-base font-semibold text-center">
                  We are not here to replace your gym. We are here to back you up when life gets in the way.
                </p>
                <p className="text-base text-muted-foreground text-center leading-relaxed">
                  Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — 
                  SmartyGym is your backup plan. Or, if you prefer training from home entirely, we've got you covered. 
                  Or, if you go to your gym but want to follow a professional, science-based workout or training program designed by{' '}
                  <a href="/coach-profile" onClick={e => {
                      e.preventDefault();
                      navigate('/coach-profile');
                    }} className="text-primary hover:underline font-medium cursor-pointer">
                    Haris Falas
                  </a>, we provide that expert guidance.
                  Expert workouts, professional programs, and practical tools — all designed by real coaches, not algorithms.
                </p>
                <p className="text-base font-semibold text-center text-primary">
                  Wherever you are, your gym comes with you.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Built for Real Life</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Flexible, effective training designed for busy professionals who want real results     
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Scientific Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Rooted in proven exercise science, biomechanics, and progressive overload. No gimmicks, just results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Accessible to All </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  For beginners and athletes alike. Train at home, in the gym, or on the go with programs for every level.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Safe & Effective</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Programs designed to build strength, mobility, and conditioning while reducing injury risk.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* The SmartyGym Promise */}
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold mb-6 text-center">The SmartyGym Promise</h3>
              <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-base leading-relaxed text-center">
                Every workout and training program at <span className="text-primary font-semibold">SmartyGym</span> is crafted with one goal: to help you reach YOUR fitness goals, 
                whatever they may be. Whether you're building muscle, losing weight, improving endurance, or simply staying active, 
                we provide the structure, guidance, and flexibility you need to succeed — on your terms, in your time, wherever you are.
              </p>
                <p className="text-base font-semibold text-center text-primary">
                  Real coaching. Real results. Anywhere you train.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Core Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Evidence-Based</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Every program is backed by sports science, biomechanics, and proven training principles — not trends or guesswork.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Structure & Clarity</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Clear workout plans, step-by-step guidance, and structured progression so you always know what to do and why.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Human Connection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Real coaching, personalized support, and direct access to expert guidance — not chatbots or automated responses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-border text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Results-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Our programs are designed to deliver measurable results — strength gains, fat loss, endurance, or whatever your goal is.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Message from Head Coach */}
        {/* Message from Head Coach */}
        <section className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20" aria-hidden="true"></div>
            
            <CardHeader className="relative">
              <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30">
                <img src={harisPhoto} alt="Haris Falas - Personal Coach" className="w-full h-full object-cover" />
              </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl">Message from Haris Falas</CardTitle>
                  <p className="text-muted-foreground">Your Personal Coach & Program Designer</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 relative">
              <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-primary/20">
                <p className="text-lg font-bold mb-1">
                  <a href="/coach-profile" className="text-primary hover:underline">Haris Falas</a>
                </p>
                <p className="text-sm text-muted-foreground">Sports Scientist and Strength & Conditioning Coach</p>
              </div>
              
              <p className="text-base leading-relaxed">
                For more than twenty years I've coached athletes, teams, and everyday people — beginners, busy professionals, and gym-goers who simply want to train with purpose. If there's one thing I've learned, it's that people don't struggle because they're lazy. They struggle because they walk into their training without a clear plan, without structure, and without guidance they can trust.
              </p>

              <p className="text-base leading-relaxed">
                That's exactly why I created SmartyGym.
              </p>

              <p className="text-base leading-relaxed">
                My vision is to give people the kind of coaching that makes everything simpler: structured programs, smart progressions, expert guidance, and clear workouts you can follow with confidence — whether you train at home, outdoors, or inside a gym. SmartyGym is here to support your fitness journey, not replace any part of it. If you train in a gym, you'll have a plan. If you train at home, you'll have a structure. If you're busy or traveling, you'll still know exactly what to do.
              </p>

              <p className="text-base leading-relaxed">
                I built this platform for people who want real training, not random exercises. For those who want to feel stronger, move better, improve performance, and see results — with a system that removes confusion and brings clarity every step of the way.
              </p>
              
              <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                <p className="text-base leading-relaxed font-medium">
                  Every single program you see here? I designed it myself. No AI. No automation. No copy-paste templates. 
                  Just years of education, experience, and a genuine commitment to YOUR success.
                </p>
              </div>
              
              <p className="text-base leading-relaxed">
                This project isn't just another fitness idea. It's the result of decades of experience, passion for coaching, and a deep belief that everyone deserves access to smart, effective training, no matter their level or lifestyle.
              </p>

              <p className="text-base leading-relaxed">
                Thank you for trusting me with your fitness. I'm here to guide you, support you, and help you improve — one session at a time.
              </p>

              <p className="text-base leading-relaxed font-medium">
                Every day is a game day.
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="h-px flex-grow bg-border"></div>
                <p className="font-bold text-primary">
                  <a href="/coach-profile" className="hover:underline">Haris Falas</a>
                </p>
                <div className="h-px flex-grow bg-border"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">Founder, SmartyGym</p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section id="faq-section" className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center md:text-left">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <Accordion type="single" collapsible className="w-full">
                  
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-left">What is SmartyGym?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      SmartyGym is an online fitness platform providing functional, science-based workouts and training programs
                      designed by certified coaches. Whether you're training at home, in the gym, or on the go, SmartyGym 
                      is your backup when life gets in the way — or your complete fitness solution if you prefer training from home. 
                      We make quality fitness accessible anywhere, anytime.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-left">Who is Haris Falas?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> is a certified Sports Scientist
                      and Strength & Conditioning Coach with over 20 years of professional experience. He has worked with elite athletes and professional 
                      football teams in the Cypriot First Division. As the founder of HFSC and 
                      SmartyGym, <strong>Haris personally designs every single workout and program</strong> — never by AI, always with evidence-based
                      training principles and real coaching experience.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-left">What makes SmartyGym different?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <strong>We're 100% human, 0% AI.</strong> Every workout is personally designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>,
                      a qualified Sports Scientist and S&C Coach — never by algorithms or AI. You get real expertise from a real coach with 20+ years 
                      of experience, real support, and direct access to the person who created your program. We focus on sustainable, functional training 
                      that fits into your real life — not quick fixes or unrealistic promises.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3a">
                    <AccordionTrigger className="text-left">What's the difference between a workout and training program?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      A <strong>workout</strong> is a standalone training session designed for a specific goal — whether that's calorie burning, 
                      strength building, cardio conditioning, mobility work, or power development. It's perfect when you want a single, 
                      focused session or when you're mixing and matching your own training plan.<br /><br />
                      
                      A <strong>training program</strong> is a complete, structured plan that spans multiple weeks (e.g., 4, 6, or 12 weeks). 
                      It includes progressive training phases, periodization, recovery strategies, and a clear roadmap toward a specific goal 
                      (like building strength, losing fat, or improving performance). Programs are ideal if you want a full training cycle 
                      with built-in progression and accountability.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger className="text-left">What kind of workouts do you offer?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      We offer a wide variety of training styles to match your goals and preferences: Strength Training, Hypertrophy (Muscle Building), 
                      Metabolic Conditioning, HIIT, Cardio, Mobility & Flexibility, Functional Training, Endurance, Core & Stability, Power & Explosiveness, 
                      and Sport-Specific workouts. All workouts are categorized by difficulty level (beginner, intermediate, advanced), duration, and equipment requirements.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger className="text-left">Do I need gym equipment?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Not necessarily. We offer a wide variety of workouts and programs designed for different equipment scenarios: <strong>bodyweight only</strong>, 
                      <strong>minimal equipment</strong> (resistance bands, dumbbells), and <strong>full gym access</strong>. You can filter content based on what you have available. 
                      Whether you're training at home, in a hotel room, or at a fully equipped gym, there's something for you.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger className="text-left">Who is SmartyGym for?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      SmartyGym is for <strong>everyone</strong> — whether you're a complete beginner taking your first steps into fitness, 
                      or an experienced athlete looking for structured, science-based training. Our platform is designed to meet you where you are 
                      and guide you forward with safe, effective programming. If you value expert coaching, flexibility, and real results, SmartyGym is for you.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7">
                    <AccordionTrigger className="text-left">Can I really get results training from home?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Absolutely. Results come from consistency, proper programming, and progressive overload — not from expensive equipment or gym memberships. 
                      Our home-based workouts are designed using the same science-based principles as gym-based training. Whether you're using bodyweight, 
                      resistance bands, or a pair of dumbbells, you can build strength, lose fat, improve fitness, and reach your goals with the right guidance.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7a">
                    <AccordionTrigger className="text-left">What is Smarty Ritual?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <strong>Smarty Ritual</strong> is your all-day game plan for movement, recovery, and performance. 
                      Each day, Premium members receive a fresh ritual with three expertly designed phases:<br /><br />
                      
                      <strong>🌅 Morning Ritual (~8:00 AM):</strong> Wake up your body with joint unlock movements, light activation exercises, 
                      and a nutrition tip to start your day strong.<br /><br />
                      
                      <strong>☀️ Midday Ritual (~1:00 PM):</strong> Reset and recharge with desk-friendly micro movements, 
                      breathing exercises, and a quick energy boost.<br /><br />
                      
                      <strong>🌙 Evening Ritual (~5:00 PM):</strong> Unwind with decompression stretches, stress release techniques, 
                      and pre-bed guidance for quality sleep.<br /><br />
                      
                      Every ritual is personally designed by <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a> and delivered fresh each morning at 7:00 AM. You can even add the ritual phases to your calendar with one click. 
                      Smarty Ritual is exclusively available for <a href="/joinpremium" className="text-primary hover:underline font-medium">Premium members</a>.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-7b">
                    <AccordionTrigger className="text-left">What is Smarty Check-ins?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      <strong>Smarty Check-ins</strong> is a daily self-assessment feature that helps you track your overall wellness and stay accountable to your fitness journey.<br /><br />
                      
                      <strong>🌅 Morning Check-in (6:00 AM - 9:00 AM):</strong> Rate your sleep quality, energy levels, motivation, 
                      and readiness to train — setting the tone for your day.<br /><br />
                      
                      <strong>🌙 Night Check-in (6:00 PM - 9:00 PM):</strong> Reflect on your nutrition, hydration, activity level, 
                      stress, and overall day before winding down.<br /><br />
                      
                      Each check-in generates a <strong>Daily Smarty Score</strong> (0-100) that tracks your progress over time. 
                      Build streaks, earn badges, view your history in graphs, and export your data for deeper analysis. 
                      Your scores also appear on the LogBook calendar with color-coded indicators so you can spot patterns at a glance.<br /><br />
                      
                      Smarty Check-ins is available in your <a href="/userdashboard?tab=checkins" className="text-primary hover:underline font-medium">Dashboard</a> and helps you understand the connection between your daily habits and your fitness results.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8">
                    <AccordionTrigger className="text-left">Is there a free trial?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Yes! We offer <strong>free access</strong> to selected workouts, tools, and resources so you can explore the platform before committing. 
                      Additionally, you can <strong>purchase selected premium workouts or training programs as standalone items</strong> — 
                      this lets you experience our coaching philosophy and training quality before committing to a full subscription.
                      Premium subscriptions (Gold and Platinum) unlock our full library of workouts, training programs, and advanced features. 
                      Check out our <a href="/premium-comparison" className="text-primary hover:underline font-medium">pricing plans</a> to see what's included.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-8a">
                    <AccordionTrigger className="text-left">What is a standalone purchase?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      A <strong>standalone purchase</strong> allows you to buy individual premium workouts or training programs without committing to a subscription. 
                      This is perfect for trying our training methodology and coaching style before deciding to upgrade.<br /><br />
                      
                      <strong>How to purchase:</strong><br />
                      1. <strong>Create a free account</strong> — sign up to access the platform.<br />
                      2. <strong>Browse</strong> our workouts or training programs.<br />
                      3. <strong>Click "Buy Now"</strong> on any standalone-enabled content (marked with a price).<br />
                      4. <strong>Complete payment</strong> securely via Stripe.<br />
                      5. <strong>Access immediately</strong> — your purchased content is unlocked right away.<br /><br />
                      
                      <strong>What you get:</strong> Full dashboard access for your purchased content, including logbook tracking, 
                      the ability to rate and review, mark as complete, add to favorites, and access to all our calculator tools. 
                      It's a great way to try before you commit to a full plan!
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-9">
                    <AccordionTrigger className="text-left">How do I get started?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      Getting started is simple:<br />
                      1. <strong>Browse</strong> our free workouts and tools to get a feel for the platform.<br />
                      2. <strong>Sign up</strong> for a free account to save your progress and track your training.<br />
                      3. <strong>Upgrade</strong> to a premium plan if you want full access to all workouts, training programs, and exclusive content.<br />
                      4. <strong>Start training</strong> — pick a workout or program and get moving!<br /><br />
                      
                      If you need guidance, check out our <a href="/taketour" className="text-primary hover:underline font-medium">Take a Tour</a> page 
                      or <a href="/contact" className="text-primary hover:underline font-medium">contact us</a> directly.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-10">
                    <AccordionTrigger className="text-left">How can I contact you?</AccordionTrigger>
                    <AccordionContent className="py-2 leading-relaxed">
                      We're here to help! You can reach us through our <a href="/contact" className="text-primary hover:underline font-medium">Contact page</a>, 
                      where you can send a message or get direct access to coach <a href="/coach-profile" className="text-primary hover:underline font-medium">Haris Falas</a>. 
                      We typically respond within 24 hours. You can also follow us on social media for updates, tips, and community support.
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-6 text-center space-y-6">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of people who are training smarter with SmartyGym.
              </p>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Work with a real coach who designed every program personally — not an AI.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" onClick={() => navigate("/workout")} className="gap-2">
                  <Target className="h-5 w-5" />
                  Browse Workouts
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/trainingprogram")} className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Explore Programs
                </Button>
                {!isPremium && <Button size="lg" variant="outline" onClick={() => navigate("/premiumbenefits")} className="gap-2">
                    <UserCheck className="h-5 w-5" />
                    Join Premium
                  </Button>}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
          </>}

    </div>
    </>;
};
export default Index;