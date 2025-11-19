import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap, Check, Crown, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
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
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);

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
                "name": "Online Gym Membership - Gold Plan",
                "description": "Premium online gym membership with unlimited access to professional workouts and training programs",
                "price": "9.99",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
              {
                "@type": "Offer",
                "name": "Online Gym Membership - Platinum Plan",
                "description": "Premium annual membership with unlimited access to all fitness content",
                "price": "89.99",
                "priceCurrency": "EUR",
                "availability": "https://schema.org/InStock"
              },
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
                <div className="p-8 sm:p-10 md:p-12 space-y-8">
                  
                  {/* Top Section: Title + GET STARTED Button */}
                  <div className="text-center space-y-4">
                    <h1 
                      className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-primary via-amber-400 to-primary bg-clip-text text-transparent"
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
                    
                    <Dialog open={isGetStartedOpen} onOpenChange={setIsGetStartedOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="lg" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all"
                        >
                          GET STARTED
                          <ChevronDown className="ml-2 h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-center">
                            Explore SmartyGym Services
                          </DialogTitle>
                          <DialogDescription className="text-center">
                            Choose where you want to start your fitness journey
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                          
                          {/* Workouts Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/workout");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <Dumbbell className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">500+ Expert Workouts</h3>
                                <p className="text-sm text-muted-foreground">
                                  Pick your daily session: Strength, Cardio, Fat Burn, or whatever fits your mood
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Training Programs Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/trainingprogram");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <Calendar className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Training Programs</h3>
                                <p className="text-sm text-muted-foreground">
                                  Structured expert training programs to achieve your long-term goals
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Smart Tools Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/tools");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <Calculator className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Smart Tools</h3>
                                <p className="text-sm text-muted-foreground">
                                  BMR, Macro, 1RM calculators and training timers to optimize your workouts
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Exercise Library Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/exerciselibrary");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <Video className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Exercise Library</h3>
                                <p className="text-sm text-muted-foreground">
                                  Comprehensive video guide with proper form demonstrations for every exercise
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Blog & Expert Articles Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/blog");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <FileText className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Blog & Expert Articles</h3>
                                <p className="text-sm text-muted-foreground">
                                  Read expert tips, training guides, and fitness insights
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Expert Coach Guidance Card */}
                          <Card 
                            className="h-full border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => {
                              navigate("/contact");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                                <GraduationCap className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1">Expert Coach Guidance</h3>
                                <p className="text-sm text-muted-foreground">
                                  Connect with Sports Scientist Haris Falas - real human expertise, not AI-generated advice
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Premium Card */}
                          <Card 
                            className="h-full border-2 border-primary/50 hover:border-primary hover:shadow-lg transition-all cursor-pointer group bg-primary/5"
                            onClick={() => {
                              navigate("/joinpremium");
                              setIsGetStartedOpen(false);
                            }}
                          >
                            <CardContent className="h-full p-6 flex flex-col gap-3">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all">
                                <Crown className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                                  Join Premium
                                  <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">RECOMMENDED</span>
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Unlock all premium workouts, programs, and exclusive features
                                </p>
                              </div>
                            </CardContent>
                          </Card>

                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Middle Section: Phone (Left) + Three Cards (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch lg:items-stretch">
                    
                    {/* LEFT: Mobile Phone Illustration */}
                    <div className="order-1 lg:order-1 flex justify-center lg:justify-start items-stretch">
                      <div className="flex items-center h-full">
                        <MobilePhoneIllustration 
                          className="h-full max-h-[360px] w-auto"
                          imageUrl="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=800&fit=crop&crop=faces"
                        />
                      </div>
                    </div>

                    {/* RIGHT: Three Core Message Cards */}
                    <div className="order-2 lg:order-2 flex flex-col justify-between gap-4 h-full">
                      
                      {/* Card 1: Your Gym in Your Pocket */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
                        <CardContent className="h-full p-6 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">Your Gym In Your Pocket</h3>
                            <p className="text-sm text-muted-foreground">Train anywhere, anytime with expert guidance</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 2: 100% Human */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
                        <CardContent className="h-full p-6 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <UserCheck className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              <span className="text-red-600">100% Human.</span> 0% AI.
                            </h3>
                            <p className="text-sm text-muted-foreground">Every workout designed by Haris Falas</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Card 3: Train Anywhere */}
                      <Card className="flex-1 border-2 border-primary/30 hover:border-primary hover:shadow-lg transition-all cursor-pointer group">
                        <CardContent className="h-full p-6 flex items-center gap-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all flex-shrink-0">
                            <Dumbbell className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">Train Anywhere, Anytime</h3>
                            <p className="text-sm text-muted-foreground">Flexible training that fits YOUR schedule</p>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>




                  {/* Who Is Smarty Gym For? Section */}
                  <div className="pt-3">
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

                        {/* Pricing Plans */}
                        <div className="pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Gold Plan */}
            <Card className="relative border-2 border-amber-500 shadow-lg flex flex-col">
              <CardHeader className="text-center pb-2 sm:pb-4">
                <div className="mb-2 sm:mb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                    Gold Plan
                  </h2>
                </div>
                <Badge className="bg-amber-500 text-white mx-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                  MONTHLY
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-bold">€9.99</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground h-4 sm:h-5">per month</p>
                <div className="h-10 sm:h-14 flex flex-col justify-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    🔄 Auto-renews monthly
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                <div className="space-y-1.5 sm:space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all workouts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all training programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to training tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Flexible monthly billing</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Perfect for trying premium</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 mt-auto">
                  <Button 
                    className="w-full text-sm sm:text-lg py-4 sm:py-6" 
                    onClick={() => handleSubscribe('gold')}
                  >
                    <span className="sm:hidden">Get Monthly</span>
                    <span className="hidden sm:inline">Start Monthly Plan</span>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Auto-renews each month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Platinum Plan */}
            <Card className="relative border-2 border-primary shadow-lg flex flex-col bg-gradient-to-br from-primary/5 to-amber-500/5">
              <Badge className="absolute -top-2 right-2 sm:-top-3 sm:right-3 bg-green-600 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm shadow-md z-10">
                BEST VALUE
              </Badge>
              
              <CardHeader className="text-center pb-2 sm:pb-4 pt-4 sm:pt-6">
                <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold text-primary">Platinum</h2>
                </div>
                <Badge className="bg-primary text-primary-foreground mx-auto mb-3 sm:mb-4 text-xs sm:text-sm">
                  YEARLY
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-bold">€89.99</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground h-4 sm:h-5">per year</p>
                <div className="h-10 sm:h-14 flex flex-col justify-center">
                  <p className="text-sm sm:text-base text-green-600 font-bold">
                    Save €29.89!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Just €7.50/month • 🔄 Auto-renews yearly
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 flex-1 flex flex-col">
                <div className="space-y-1.5 sm:space-y-2 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all workouts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to all training programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm">Full access to training tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm"><strong>25% savings</strong> vs monthly</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Lock in rate for 12 months</span>
                  </div>
                  <div className="flex items-start gap-2 hidden sm:flex">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4 mt-auto">
                  <Button 
                    className="w-full text-sm sm:text-lg py-4 sm:py-6 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90" 
                    onClick={() => handleSubscribe('platinum')}
                  >
                    <span className="sm:hidden">Get Yearly</span>
                    <span className="hidden sm:inline">Start Yearly Plan</span>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Best value • Auto-renews each year
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                </div>
              </Card>
            </ScrollReveal>
          </div>
        </section>


    </div>
    </>
  );
};

export default Index;
