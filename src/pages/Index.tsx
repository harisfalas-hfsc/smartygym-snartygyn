import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, BookOpen, Calculator, Activity, Flame, Instagram, Facebook, Youtube, UserCheck, Wrench, Video, FileText, Smartphone, Users, Target, Heart, Zap, Plane, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import smartyGymIcon from "@/assets/smarty-gym-icon.png";
import { BackToTop } from "@/components/BackToTop";
import { useAccessControl } from "@/hooks/useAccessControl";
import { ScrollReveal } from "@/components/ScrollReveal";
import { NotificationPromptBanner } from "@/components/NotificationPromptBanner";
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
      
      <div className="min-h-screen bg-background">
        <BackToTop />
        
        {/* Notification Prompt Banner */}
        {user && <NotificationPromptBanner />}
        
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
                        <span className="text-red-600">100% Human.</span> 0% AI.
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Every workout and training program personally designed by Sports Scientist <a href="/coach-profile" className="text-primary hover:underline font-semibold">Haris Falas</a> with 20+ years of experience. Real expertise, not algorithms.
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
                          <p className="font-semibold text-sm text-foreground">500+ Expert Workouts</p>
                          <p className="text-xs text-muted-foreground">Pick your daily session: Strength, Cardio, Fat Burn, or whatever fits your mood</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Training Programs</p>
                          <p className="text-xs text-muted-foreground">Structured expert training programs to achieve your long-term goals</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Expert Coach Guidance</p>
                          <p className="text-xs text-muted-foreground">Connect with Sports Scientist Haris Falas - real human expertise, not AI-generated advice</p>
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
                        <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">Fitness Community</p>
                          <p className="text-xs text-muted-foreground">Join and connect with like-minded members on their fitness journey</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Who Is Smarty Gym For? Section */}
                  <div className="border-t border-primary/20 pt-6">
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

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                    <Button 
                      size="lg" 
                      onClick={() => navigate("/premiumbenefits")} 
                      className="w-full sm:w-auto min-w-[200px]"
                      aria-label="Get started with Smarty Gym"
                    >
                      Get Started
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
