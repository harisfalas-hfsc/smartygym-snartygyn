import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap, Check, Crown, ChevronDown, ChevronRight, Move, Ban, Brain, CheckCircle2, Award, Shield, Compass, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import harisPhoto from "@/assets/haris-falas-coach.png";
import { MobilePhoneIllustration } from "@/components/MobilePhoneIllustration";

import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const [expandedFAQ, setExpandedFAQ] = useState<string>("");
  const [allExpanded, setAllExpanded] = useState(false);

  const handleExpandCollapseAll = () => {
    setAllExpanded(!allExpanded);
    setExpandedFAQ(allExpanded ? "" : "all");
  };

  const scrollToAccordionItem = (value: string) => {
    setTimeout(() => {
      const element = document.querySelector(`[data-accordion-value="${value}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const heroCards = [
    { 
      id: "workouts", 
      title: "500+ Expert Workouts", 
      icon: Dumbbell,
      route: "/workout"
    },
    { 
      id: "programs", 
      title: "Training Programs", 
      icon: Calendar,
      route: "/trainingprogram"
    },
    { 
      id: "tools", 
      title: "Smart Tools", 
      icon: Calculator,
      route: "/tools"
    },
    { 
      id: "exercises", 
      title: "Exercise Library", 
      icon: Video,
      route: "/exerciselibrary"
    },
    { 
      id: "blog", 
      title: "Blog & Expert Articles", 
      icon: FileText,
      route: "/blog"
    },
    { 
      id: "coach", 
      title: "Expert Coach Guidance", 
      icon: GraduationCap,
      route: "/contact"
    },
  ];

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
        <title>Online Gym Cyprus | SmartyGym by Haris Falas | Professional Online Fitness & Personal Training</title>
        <meta name="description" content="smartygym.com - Cyprus' leading online gym by Sports Scientist Haris Falas (BSc, CSCS). 100+ expert-designed workouts, structured training programs, professional fitness coaching. Train anywhere, anytime. Evidence-based online fitness training." />
        <meta name="keywords" content="online gym Cyprus, Haris Falas Cyprus, Haris Falas, smartygym, smartygym.com, online gym, online fitness Cyprus, online personal training Cyprus, virtual gym Cyprus, home workouts Cyprus, online workout programs, fitness coach Cyprus, strength training Cyprus, HIIT workouts Cyprus, functional training Cyprus, bodyweight workouts, gym workouts online, personal trainer online Cyprus, online fitness coaching, virtual personal training, Cyprus fitness, Limassol fitness, Nicosia fitness, Larnaca fitness, Paphos fitness, online training programs, workout plans online, fitness programs Cyprus, sports scientist Cyprus, CSCS coach Cyprus, strength and conditioning Cyprus, online gym membership, virtual gym membership Cyprus, workout videos online, fitness videos Cyprus, exercise programs online, metabolic training, cardio workouts online, strength programs, mobility training, fat loss workouts, muscle building programs, performance training, functional fitness, AMRAP workouts, TABATA training, circuit training, interval training, bodyweight training, no equipment workouts, home gym workouts, online fitness platform, digital fitness, remote coaching, virtual training sessions" />
        
        <meta name="semantic-keywords" content="online-fitness, home-workouts, virtual-training, digital-gym, remote-coaching, bodyweight-training, functional-fitness, strength-conditioning" />
        <meta name="workout-formats" content="AMRAP, TABATA, HIIT, circuit-training, interval-training, metabolic-conditioning, functional-training, strength-training" />
        <meta name="training-categories" content="strength, cardio, metabolic, mobility, power, challenge, calorie-burning, core-stability" />
        <meta name="equipment-types" content="bodyweight, no-equipment, kettlebell, dumbbells, resistance-bands, minimal-equipment" />
        <meta name="expertise-areas" content="sports-science, strength-conditioning, functional-fitness, performance-training, evidence-based-training" />
        
        <meta property="schema:name" content="SmartyGym" />
        <meta property="schema:founder" content="Haris Falas" />
        <meta property="schema:location" content="Cyprus" />
        <meta property="schema:serviceType" content="Online Fitness Training" />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartygym.com/" />
        <meta property="og:title" content="Online Gym Cyprus | SmartyGym by Haris Falas | Professional Fitness Training" />
        <meta property="og:description" content="Cyprus' premier online gym - Expert-designed workouts by Sports Scientist Haris Falas. 100+ workouts, structured programs, professional coaching at smartygym.com" />
        <meta property="og:image" content={smartyGymLogo} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="SmartyGym" />
        <meta property="og:locale" content="en_GB" />
        <meta property="og:locale:alternate" content="en_US" />
        
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@smartygym" />
        <meta property="twitter:title" content="Online Gym Cyprus | SmartyGym by Haris Falas" />
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
            "name": "SmartyGym Cyprus",
            "alternateName": ["Smarty Gym", "smartygym.com", "SmartyGym", "Online Gym Cyprus"],
            "url": "https://smartygym.com",
            "logo": smartyGymLogo,
            "image": smartyGymLogo,
            "description": "Cyprus' premier online gym offering professional fitness training by Sports Scientist Haris Falas. Evidence-based workout programs, structured training plans, and personalized coaching. Train anywhere, anytime with expert guidance.",
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
              "description": "BSc Sports Science, Certified Strength and Conditioning Specialist (CSCS), EXOS Performance Specialist. 20+ years experience in functional training, strength conditioning, and online fitness coaching."
            },
            "areaServed": [
              {"@type": "Country", "name": "Cyprus"},
              {"@type": "Place", "name": "Worldwide"}
            ],
            "sameAs": [
              "https://www.instagram.com/smartygymcy/",
              "https://www.youtube.com/@TheSmartyGym",
              "https://www.facebook.com/smartygym"
            ],
            "availableLanguage": ["English", "Greek"],
            "priceRange": "€€",
            "knowsAbout": ["Online Fitness", "Personal Training", "Workout Programs", "Strength Training", "HIIT Training", "Functional Fitness", "Sports Science", "Metabolic Conditioning", "Cardio Training", "Mobility Training"],
            "offers": [
              {
                "@type": "Offer",
                "name": "Online Workouts",
                "description": "Professional online workouts: AMRAP, TABATA, HIIT, circuit training, strength, cardio, metabolic"
              },
              {
                "@type": "Offer",
                "name": "Online Training Programs",
                "description": "Structured long-term training programs for specific fitness goals"
              },
              {
                "@type": "Offer",
                "name": "Online Personal Training Cyprus",
                "description": "Personalized online personal training by Sports Scientist Haris Falas"
              }
            ]
          })}
        </script>
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SmartyGym Cyprus",
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
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "item": {
                  "@type": "Service",
                  "name": "Online Workouts",
                  "description": "100+ expert-designed workout sessions",
                  "url": "https://smartygym.com/workout"
                }
              },
              {
                "@type": "ListItem",
                "position": 2,
                "item": {
                  "@type": "Service",
                  "name": "Training Programs",
                  "description": "Structured multi-week training programs",
                  "url": "https://smartygym.com/trainingprogram"
                }
              },
              {
                "@type": "ListItem",
                "position": 3,
                "item": {
                  "@type": "Service",
                  "name": "Personal Training",
                  "description": "1-on-1 personalized training programs",
                  "url": "https://smartygym.com/personaltraining"
                }
              },
              {
                "@type": "ListItem",
                "position": 4,
                "item": {
                  "@type": "Service",
                  "name": "Fitness Tools",
                  "description": "Professional fitness calculators",
                  "url": "https://smartygym.com/tools"
                }
              }
            ]
          })}
        </script>
        
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
              }
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-background overflow-x-hidden">
        
        
        {/* Hero Section */}
        <section className="relative py-8 sm:py-12 px-4 border-b border-border bg-background overflow-hidden">
          
          <div className="container mx-auto max-w-6xl relative z-10 overflow-x-hidden">
            <ScrollReveal>
              <Card 
                itemScope
                itemType="https://schema.org/Organization"
                className="border-2 border-primary bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30 backdrop-blur-sm"
                data-hero-section="true"
                data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, online gym Cyprus"
                aria-label="Smarty Gym Cyprus - Your online gym and fitness platform - smartygym.com"
              >
                <div className="p-8 sm:p-10 md:p-12 space-y-4">
                  
                  {/* Top Section: Title */}
            <div className="text-center space-y-2 mb-6">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground animate-fade-in"
                itemProp="name"
              >
                Welcome to <span className="text-primary">SmartyGym</span>
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

                  {/* Middle Section: Phone (Left) + Three Cards (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch lg:items-stretch">
                    
                    {/* LEFT: Mobile Phone Illustration */}
                    <div className="order-1 lg:order-1 flex justify-center lg:justify-start items-stretch">
                      <div className="flex items-center h-full">
            <MobilePhoneIllustration
              variant="tablet"
              className="h-full max-h-[480px] w-auto"
            >
              {/* 3 rows × 2 columns grid of "Get Started" cards */}
              <div className="grid grid-rows-3 grid-cols-2 gap-2 h-full w-full p-2">
                {heroCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Card
                      key={card.id}
                      className="border-2 border-primary/30 hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group flex items-center justify-center hover:bg-primary/5"
                      onClick={() => navigate(card.route)}
                    >
                      <div className="flex flex-col items-center justify-center gap-1 p-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xs font-bold text-center leading-tight">
                          {card.title}
                        </h3>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </MobilePhoneIllustration>
                      </div>
                    </div>

                    {/* RIGHT: Three Core Message Cards */}
                    <div className="order-2 lg:order-2 flex flex-col justify-between gap-2 h-full max-h-[480px]">
                      
                       {/* Card 1: Your Gym in Your Pocket */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-primary/5">
                <CardContent className="h-full p-5 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <Smartphone className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">Your Gym In Your Pocket</h3>
                            <p className="text-xs text-muted-foreground leading-normal">
                              Professional fitness platform with expert workouts, structured programs, and personalized coaching - accessible worldwide at smartygym.com.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: 100% Human */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-primary/5">
                <CardContent className="h-full p-5 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <UserCheck className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">
                              <span className="text-red-600">100% Human.</span> 0% AI.
                            </h3>
                            <p className="text-xs text-muted-foreground leading-normal">
                              Every workout personally designed by Sports Scientist Haris Falas with 20+ years of experience. Real expertise, not algorithms.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Train Anywhere */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-primary/5">
                        <CardContent className="h-full p-5 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <Plane className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">Train Anywhere, Anytime</h3>
                            <p className="text-xs text-muted-foreground leading-normal">
                              Access professional workouts on any device. Flexible training that fits YOUR schedule and YOUR goals—at home, gym, or traveling.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>




                  {/* Who Is Smarty Gym For? Section */}
                  <div className="pt-1">
                    <Card className="border border-primary/30 bg-background/80">
                      <div className="p-6 sm:p-8 space-y-4">
                        <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground">
                          Who Is Smarty Gym For?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Busy adults</span> juggling work and fitness
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Parents</span> who need flexible workout times
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Beginners</span> starting their fitness journey
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Intermediate lifters</span> looking for structured progression
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Travelers</span> who need workouts anywhere
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3">
                            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Gym-goers</span> who want expert guidance from <a href="/coach-profile" className="text-primary hover:underline font-semibold">Haris Falas</a>
                            </p>
                          </div>
                          <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-1" />
                            <p className="text-muted-foreground">
                              <span className="font-semibold text-foreground">Anyone</span> seeking professional coaching without personal training costs
                            </p>
                          </div>
                        </div>

                      </div>
                    </Card>
                  </div>

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
                            SmartyGym workouts and programs are built to fit YOUR life.
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
                          <article 
                            className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                            itemScope
                            itemType="https://schema.org/Thing"
                            data-feature="smarty-gym-expertise"
                            data-keywords="smarty gym, online gym, online fitness, smartygym.com, Haris Falas Cyprus, sports scientist"
                            role="article"
                            aria-label="Real expertise - SmartyGym Cyprus online fitness - smartygym.com by Haris Falas"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-sm mb-1" itemProp="name">Real Expertise</p>
                              <p className="text-xs text-muted-foreground" itemProp="description">Sports science degree & years of coaching</p>
                            </div>
                          </article>
                          <article 
                            className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                            itemScope
                            itemType="https://schema.org/Thing"
                            data-feature="smarty-gym-personal-touch"
                            data-keywords="online personal training Cyprus, smartygym, Haris Falas, online fitness, real coaching"
                            role="article"
                            aria-label="Personal touch - SmartyGym Cyprus online training - smartygym.com with real client feedback"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" aria-hidden="true" />
                            <div>
                              <p className="font-semibold text-sm mb-1" itemProp="name">Personal Touch</p>
                              <p className="text-xs text-muted-foreground" itemProp="description">Every program refined through real client feedback</p>
                            </div>
                          </article>
                          <article 
                            className="flex items-start gap-3 p-4 bg-background/50 rounded-lg border border-primary/20"
                            itemScope
                            itemType="https://schema.org/Thing"
                            data-feature="smarty-gym-no-ai"
                            data-keywords="human-designed workouts, no AI fitness, smartygym.com, online gym Cyprus, real coaching"
                            role="article"
                            aria-label="Not a robot - SmartyGym Cyprus online gym - human-designed at smartygym.com"
                          >
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

        {/* Mission Statement with Cards */}
        <section className="mb-16">
          {/* Your Gym Anywhere Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20 mb-8">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold flex-1">
                  Your Gym Reimagined Anywhere, Anytime
                </h3>
                <Button
                  onClick={() => navigate("/joinpremium", { state: { from: location.pathname } })}
                  className="ml-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  Join Now
                </Button>
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                <p className="text-base font-semibold text-center">
                  We are not here to replace your gym. We are here to back you up when life gets in the way.
                </p>
                <p className="text-base text-muted-foreground text-center leading-relaxed">
                  Whether you're traveling, on holiday, can't make it to the gym, or your gym is closed — 
                  SmartyGym is your backup plan. Or, if you prefer training from home entirely, we've got you covered. 
                  Expert workouts, professional programs, and practical tools — all designed by real coaches, not algorithms.
                </p>
                <p className="text-base font-semibold text-center text-primary">
                  Wherever you are, your gym comes with you.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Built for Real Life</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Flexible, effective training designed for busy professionals who want results without hours at the gym.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Science-Based Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  Rooted in proven exercise science, biomechanics, and progressive overload. No gimmicks, just results.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Accessible to Everyone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-muted-foreground">
                  For beginners and athletes alike. Train at home, in the gym, or on the go with programs for every level.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">The SmartyGym Promise</h3>
              <div className="max-w-3xl mx-auto space-y-4">
                <p className="text-base leading-relaxed text-center">
                  Every workout and program at SmartyGym is crafted with one goal: to help you reach YOUR fitness goals, 
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
            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

            <Card className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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
        <section className="mb-16">
          <Card className="border-2 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:w-1/3 relative">
                  <img
                    src={harisPhoto}
                    alt="Haris Falas - Head Coach & Founder of SmartyGym | Sports Scientist | smartygym.com Cyprus Fitness Expert"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="md:w-2/3 p-8 md:p-12">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">A Message from Your Head Coach</h2>
                  <div className="space-y-4 text-base leading-relaxed">
                    <p>
                      I'm <strong>Haris Falas</strong>, the founder and head coach behind every workout and program at <strong>smartygym.com</strong>.
                    </p>
                    <p>
                      I started SmartyGym because I saw too many people struggling with cookie-cutter plans, trendy gimmicks, 
                      or programs that didn't fit their lifestyle. I wanted to create something different — something real, flexible, 
                      and backed by science.
                    </p>
                    <p>
                      As a Sports Scientist and Strength & Conditioning Coach, I've spent over 20 years designing programs for 
                      elite athletes and everyday people alike. I've learned one key truth: <strong>the best program is the one 
                      you can actually stick to</strong>.
                    </p>
                    <p>
                      That's why every workout at SmartyGym is designed with you in mind — clear, effective, and adaptable to 
                      wherever you are, whatever you have. No fluff, no AI-generated shortcuts, just real coaching for real results.
                    </p>
                    <p className="font-semibold text-primary">
                      Train smart. Train anywhere. Welcome to SmartyGym.
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="font-semibold">Haris Falas</p>
                    <p className="text-sm text-muted-foreground">Sports Scientist & Head Coach</p>
                    <p className="text-sm text-muted-foreground italic">Founder of SmartyGym</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl">Frequently Asked Questions</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExpandCollapseAll}
                  className="text-sm"
                >
                  {allExpanded ? "Collapse All" : "Expand All"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion 
                type="single" 
                collapsible 
                className="w-full" 
                value={expandedFAQ === "all" ? undefined : expandedFAQ}
                onValueChange={(value) => {
                  setExpandedFAQ(value);
                  setAllExpanded(false);
                  if (value) scrollToAccordionItem(value);
                }}
              >
                <AccordionItem value="item-1" data-accordion-value="item-1">
                  <AccordionTrigger className="text-left">Who is Haris Falas?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Haris Falas is a certified Sports Scientist and Strength & Conditioning Coach with over 20 years of 
                    professional experience. He has worked with elite athletes and professional football teams in the 
                    Cypriot First Division. As the founder of HFSC and SmartyGym, he personally designs every workout and 
                    program based on evidence-based training principles and real coaching experience. All workouts and 
                    programs are personally created by Haris — not AI-generated.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" data-accordion-value="item-2">
                  <AccordionTrigger className="text-left">What makes SmartyGym different from other fitness platforms?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    SmartyGym combines expert coaching with real flexibility. Every workout and program is personally designed 
                    by Haris Falas, a certified Sports Scientist — not generated by AI or algorithms. You get structured, 
                    evidence-based training that actually fits into your life, whether you're at home, traveling, or in the gym. 
                    Plus, with tools like the 1RM Calculator and direct coach access, you get everything you need in one place.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" data-accordion-value="item-3">
                  <AccordionTrigger className="text-left">How do I choose between a workout and a training program?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    <strong>Choose a workout if:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>You want a single session to do today</li>
                      <li>You prefer flexibility and variety in your training</li>
                      <li>You're looking for a specific type of workout (strength, cardio, mobility, etc.)</li>
                      <li>You're seeking a quick sweat or daily movement session to kickstart or complete your day.</li>
                      <li>You have limited time or an unpredictable schedule</li>
                      <li>You're supplementing another training plan</li>
                    </ul>
                    <br />
                    <strong>Choose a training program if:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>You have a specific goal like building muscle, losing weight, or improving endurance</li>
                      <li>You want structured progression and accountability</li>
                      <li>You can commit to 4-8 weeks of consistent training</li>
                      <li>You prefer having your training planned out with clear weekly schedules</li>
                      <li>You want to see measurable results through systematic training</li>
                    </ul>
                    <br />
                    <strong>Pro tip:</strong> Many members use both — following a program for their main goal while adding individual 
                    workouts for extra sessions or when they want to focus on something specific!
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" data-accordion-value="item-4">
                  <AccordionTrigger className="text-left">Do I need equipment to use SmartyGym?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    No! We offer both bodyweight workouts that require no equipment and equipment-based programs.
                    You can filter workouts based on what you have available — whether that's nothing, 
                    resistance bands, dumbbells, or full gym access. Train anywhere with whatever you have.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" data-accordion-value="item-5">
                  <AccordionTrigger className="text-left">How long are the workouts?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Our workouts range from quick 10-minute sessions to comprehensive 60-minute full workouts.
                    You can filter by duration to find what fits your schedule — whether you have just 10 minutes or a full hour to train.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" data-accordion-value="item-6">
                  <AccordionTrigger className="text-left">Can beginners use SmartyGym?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Absolutely! We have workouts and programs specifically designed for all fitness levels, including beginners.
                    Each workout includes clear instructions, difficulty ratings, and modifications to match your current fitness level. 
                    Start where you are and progress at your own pace with safe, effective programming.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" data-accordion-value="item-7">
                  <AccordionTrigger className="text-left">Why should I go premium?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Premium membership unlocks unlimited access to all workouts and training programs, full dashboard access with progress tracking,
                    complete workout and program history, ability to favorite and rate all content, and direct WhatsApp support from the coaching team. 
                    Free subscribers can access selected free workouts, programs, calculators, and the exercise library, but Premium gives you the full 
                    SmartyGym experience with structured training programs for long-term goals and personalized support. Choose monthly (€9.99/month) or save 25% with yearly (€89.99/year, only €7.50/month).
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" data-accordion-value="item-8">
                  <AccordionTrigger className="text-left">What's the difference between free and premium access?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    <strong>Visitors (no login)</strong> can view the exercise library and blog. <strong>Free subscribers</strong> get access to selected free workouts and programs,
                    full calculators (1RM, BMR, Macro), and limited dashboard features. <strong>Premium members</strong> get unlimited access to all workouts and training programs, 
                    complete dashboard with progress tracking, workout/program history, favorites, ratings, and direct WhatsApp support.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9" data-accordion-value="item-9">
                  <AccordionTrigger className="text-left">Can I cancel my premium membership anytime?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Yes! You can cancel your premium membership at any time with no penalties or cancellation fees. 
                    If you cancel, you'll retain premium access until the end of your current billing period. After that, 
                    your account will automatically revert to free access, giving you continued use of selected free workouts, 
                    programs, calculators, and the exercise library.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10" data-accordion-value="item-10">
                  <AccordionTrigger className="text-left">How do I access my workouts and programs?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Once you sign up (free or premium), you can access all your workouts and programs through your dashboard. 
                    Simply log in, browse the workout or program library, and click on what you want to do. Each workout includes 
                    clear instructions and can be saved to your favorites for quick access later.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-11" data-accordion-value="item-11">
                  <AccordionTrigger className="text-left">Can I get personalized training plans?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    Yes! If you're looking for a fully personalized training program designed specifically for your goals, lifestyle, 
                    and available equipment, you can request a custom program through our Personal Training service. This includes 
                    a detailed assessment, one-on-one consultation with Haris Falas, and a tailor-made program built just for you. 
                    Contact us to learn more.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-12" data-accordion-value="item-12">
                  <AccordionTrigger className="text-left">Do you offer nutrition guidance or meal plans?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    While we don't offer full meal plans, many of our programs include general nutrition tips and strategies to support 
                    your training goals (like fat loss, muscle gain, or endurance). We also provide calculators to help you determine 
                    your daily calorie needs and macronutrient targets, giving you the foundation to build your own nutrition plan.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-13" data-accordion-value="item-13">
                  <AccordionTrigger className="text-left">Can I subscribe to receive email updates?</AccordionTrigger>
                  <AccordionContent className="py-2 leading-relaxed">
                    No, we intentionally do not offer email subscriptions or newsletters. We believe in keeping your inbox clutter-free 
                    and respecting your time. All important updates, new content releases, and announcements are communicated directly 
                    within your SmartyGym dashboard when you log in. This ensures you only receive the information you need, when you 
                    need it, without the noise of promotional emails. You can also follow us on social media for additional updates and 
                    fitness tips if you'd like to stay connected.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of people who train smarter, not harder. Get started with free workouts today, 
                or unlock everything with premium access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/workout")}
                  className="w-full sm:w-auto bg-background text-primary border-2 border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all"
                >
                  Try Free Workouts
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/trainingprogram")}
                  className="w-full sm:w-auto bg-background text-primary border-2 border-primary hover:bg-primary/5 shadow-lg hover:shadow-xl transition-all"
                >
                  Try Free Training Programs
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/joinpremium", { state: { from: location.pathname } })}
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                >
                  Join Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

    </div>
    </>
  );
};

export default Index;
