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
        <meta name="keywords" content="gym, online gym, online fitness, gym Cyprus, online gym Cyprus, fitness gym online, Haris Falas, Haris Falas Cyprus, Cyprus fitness, Cyprus personal trainer, personal training, online personal training, Cyprus personal training, online workouts, workout training programs, training programs online, smartygym, smartygym.com, SmartyGym Cyprus, AMRAP workouts, TABATA training, HIIT workouts, circuit training, functional fitness, strength training, cardio workouts, metabolic training, home workouts, bodyweight training, no equipment workouts, fitness programs, workout programs, gym programs online, convenient fitness, flexible gym, anytime fitness, anywhere fitness, Cyprus gym, Cyprus online fitness, fitness in Cyprus, sports scientist Cyprus, strength conditioning coach, online fitness coach, virtual gym, digital gym, home gym programs, workout plans online, fitness app Cyprus, gym membership online, premium fitness, fitness subscription" />
        
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
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HealthAndBeautyBusiness",
            "name": "SmartyGym Cyprus",
            "description": "#1 Online Gym in Cyprus by Sports Scientist Haris Falas",
            "url": "https://smartygym.com",
            "logo": smartyGymLogo,
            "image": smartyGymLogo,
            "priceRange": "€€",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CY",
              "addressLocality": "Cyprus"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "addressCountry": "CY"
            },
            "sameAs": [
              "https://www.instagram.com/smartygym",
              "https://www.facebook.com/smartygym",
              "https://www.youtube.com/@smartygym"
            ],
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "EUR",
              "lowPrice": "0",
              "highPrice": "29.99",
              "offerCount": "3"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
          <Card className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-yellow-50/50 via-background to-yellow-50/30 dark:from-yellow-950/20 dark:via-background dark:to-yellow-950/10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column - Content */}
                <div className="text-center lg:text-left space-y-6">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                    Your Personal AI Fitness Coach
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground">
                    Access expert-designed workouts, comprehensive training programs, and personalized fitness guidance — all in one place
                  </p>

                  {/* Feature Highlights Grid */}
                  <div className="grid grid-cols-2 gap-4 py-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">Daily Workouts</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">Training Programs</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">Exercise Library</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm sm:text-base">Fitness Tools</span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                    {!user ? (
                      <>
                        <Button 
                          size="lg" 
                          onClick={() => navigate("/auth")}
                          className="text-base sm:text-lg px-6 sm:px-8"
                        >
                          Start Free Trial
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline"
                          onClick={() => navigate("/about")}
                          className="text-base sm:text-lg px-6 sm:px-8"
                        >
                          Learn More
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        onClick={() => navigate("/dashboard")}
                        className="text-base sm:text-lg px-6 sm:px-8"
                      >
                        Go to Dashboard
                      </Button>
                    )}
                  </div>

                  {/* Who Is This For - Inline */}
                  <div className="mt-8 pt-8 border-t border-border/40">
                    <h3 className="text-xl font-semibold mb-4">Perfect For:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Busy Professionals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Fitness Enthusiasts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Health Seekers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Athletes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Travelers</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">Students</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Hero Image */}
                <div className="relative">
                  <img
                    src={workoutHeroImg}
                    alt="Professional fitness training"
                    className="w-full rounded-2xl shadow-2xl"
                  />
                </div>
            </div>
          </Card>
        </ScrollReveal>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Everything You Need to Succeed
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Access a complete suite of fitness tools and resources designed by professional coaches
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map((service) => (
                  <ServiceCard 
                    key={service.id}
                    {...service} 
                    onClick={() => handleServiceSelect(service.id)}
                  />
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Problem/Solution Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Transform Your Fitness Journey
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  No more guessing, no more wasted time — just proven methods that work
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <Card className="p-6 sm:p-8 border-2 border-destructive/20">
                  <h3 className="text-xl font-semibold mb-4 text-destructive">Without Structure</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-1">✗</span>
                      <span className="text-muted-foreground">Random workouts with no progression</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-1">✗</span>
                      <span className="text-muted-foreground">Inconsistent training schedule</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-1">✗</span>
                      <span className="text-muted-foreground">Lack of expert guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-destructive mt-1">✗</span>
                      <span className="text-muted-foreground">Limited results and motivation</span>
                    </li>
                  </ul>
                </Card>

                <Card className="p-6 sm:p-8 border-2 border-primary/20 bg-primary/5">
                  <h3 className="text-xl font-semibold mb-4 text-primary">With SmartyGym</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span>Structured programs with clear progression</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span>Consistent weekly training plans</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span>Expert coaching and guidance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span>Proven methods and real results</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Why It Works Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Why SmartyGym Works
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Built on proven science and years of coaching experience
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                <Card className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Expert Design</h3>
                  <p className="text-muted-foreground">
                    All programs created by Sports Scientist and Strength Coach Haris Falas
                  </p>
                </Card>

                <Card className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Progressive System</h3>
                  <p className="text-muted-foreground">
                    Structured progression plans that adapt to your fitness level
                  </p>
                </Card>

                <Card className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4">
                    <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Flexible Access</h3>
                  <p className="text-muted-foreground">
                    Train anywhere, anytime with workouts that fit your schedule
                  </p>
                </Card>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Sample Workout CTA */}
        <section className="py-12 sm:py-16 lg:py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <ScrollReveal>
              <Card className="p-8 sm:p-12 text-center bg-primary/5 border-2 border-primary/20">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Try a Free Workout Today
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  Experience the quality of our training programs with a complimentary workout
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/workout")}
                  className="text-base sm:text-lg px-6 sm:px-8"
                >
                  Browse Free Workouts
                </Button>
              </Card>
            </ScrollReveal>
          </div>
        </section>

        {/* Featured Programs Section */}
        {featuredPrograms && featuredPrograms.length > 0 && (
          <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
              <ScrollReveal>
                <div className="text-center mb-10 sm:mb-12">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                    Featured Training Programs
                  </h2>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Comprehensive programs designed to help you achieve your specific fitness goals
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {featuredPrograms.map((program) => (
                    <Card 
                      key={program.id} 
                      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/trainingprogram/${program.id}`)}
                    >
                      {program.image_url && (
                        <img
                          src={program.image_url}
                          alt={program.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{program.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {program.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {program.weeks} weeks • {program.days_per_week} days/week
                          </span>
                          {program.is_premium && (
                            <span className="text-primary font-semibold">Premium</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate("/trainingprogram")}
                    className="text-base sm:text-lg px-6 sm:px-8"
                  >
                    View All Programs
                  </Button>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        {/* Testimonials Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-10 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  What Our Members Say
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of satisfied members achieving their fitness goals
                </p>
              </div>
              <TestimonialsSlider />
            </ScrollReveal>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <ScrollReveal>
              <div className="text-center space-y-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Ready to Transform Your Fitness?
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Choose the plan that fits your goals and start your journey today
                </p>

                <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto pt-6">
                  {/* Gold Plan */}
                  <Card className="p-6 sm:p-8 border-2">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold">Gold Plan</h3>
                      <div className="text-3xl font-bold">€19.99<span className="text-lg text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>All Workouts</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>All Programs</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>Exercise Library</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>Fitness Tools</span>
                        </li>
                      </ul>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => handleSubscribe('gold')}
                        className="w-full"
                      >
                        Choose Gold
                      </Button>
                    </div>
                  </Card>

                  {/* Platinum Plan */}
                  <Card className="p-6 sm:p-8 border-2 border-primary bg-primary/5">
                    <div className="text-center space-y-4">
                      <div className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold mb-2">
                        Most Popular
                      </div>
                      <h3 className="text-2xl font-bold">Platinum Plan</h3>
                      <div className="text-3xl font-bold">€29.99<span className="text-lg text-muted-foreground">/month</span></div>
                      <ul className="space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="font-semibold">Everything in Gold</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>AI Training Plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>AI Diet Plans</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>Priority Support</span>
                        </li>
                      </ul>
                      <Button 
                        size="lg"
                        onClick={() => handleSubscribe('platinum')}
                        className="w-full"
                      >
                        Choose Platinum
                      </Button>
                    </div>
                  </Card>
                </div>

                <p className="text-sm text-muted-foreground pt-4">
                  Cancel anytime. No long-term commitment required.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <BackToTop />
      </div>
    </>
  );
};

export default Index;
