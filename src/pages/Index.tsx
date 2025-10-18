import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dumbbell, Calendar, Utensils, Calculator, Activity, Flame, User, LogOut, Instagram, Facebook, Users, Youtube } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
const Index = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
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
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
  };
  const services = [{
    id: "workout",
    icon: Dumbbell,
    title: "Workout",
    description: "Get a standalone workout plan tailored to your goals"
  }, {
    id: "training-program",
    icon: Calendar,
    title: "Training Program",
    description: "4-8 week comprehensive training programs"
  }, {
    id: "diet-plan",
    icon: Utensils,
    title: "Diet Plan",
    description: "Personalized nutrition plans for your goals"
  }, {
    id: "1rm-calculator",
    icon: Calculator,
    title: "1RM Calculator",
    description: "Calculate your one-rep maximum"
  }, {
    id: "bmr-calculator",
    icon: Activity,
    title: "BMR Calculator",
    description: "Calculate your basal metabolic rate"
  }, {
    id: "calorie-calculator",
    icon: Flame,
    title: "Calorie Calculator",
    description: "Track your daily calorie consumption"
  }];
  const handleServiceSelect = (serviceId: string) => {
    const routes: {
      [key: string]: string;
    } = {
      "workout": "/workout",
      "training-program": "/training-program",
      "diet-plan": "/diet-plan",
      "1rm-calculator": "/1rm-calculator",
      "bmr-calculator": "/bmr-calculator",
      "calorie-calculator": "/calorie-calculator"
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
  return <div className="min-h-screen bg-background">
      {/* Sticky Header with Logo */}
      <header className="sticky top-0 z-50 bg-background border-b border-border py-3 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center">
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => navigate("/community")} className="text-xs sm:text-sm">
                <Users className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Community</span>
              </Button>
              {user ? <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="text-xs sm:text-sm hidden sm:flex">
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card z-50">
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </> : <>
                  <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="text-xs sm:text-sm">
                    Login
                  </Button>
                  <Button size="sm" onClick={() => navigate("/auth")} className="text-xs sm:text-sm">
                    Sign Up
                  </Button>
                  <ThemeToggle />
                </>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-6 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Card in same grid as service cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="md:col-span-1 lg:col-start-2 lg:col-span-1">
              <Card className="p-6 bg-card border-border shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-gold">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center justify-center">
                    <img src={smartyGymLogo} alt="Smarty Gym" className="h-32 w-auto" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Your gym, reimagined.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Anytime. Anywhere.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      All in your pocket.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="https://www.facebook.com/profile.php?id=61579302997368" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="h-4 w-4 sm:h-6 sm:w-6" />
              </a>
              <a href="https://www.instagram.com/thesmartygym/" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4 sm:h-6 sm:w-6" />
              </a>
              <a href="https://www.tiktok.com/@thesmartygym?lang=en" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="TikTok">
                <svg className="h-4 w-4 sm:h-6 sm:w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@TheSmartyGym" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-3 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="YouTube">
                <Youtube className="h-4 w-4 sm:h-6 sm:w-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6 sm:mb-12 px-4">
            
            
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
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
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border mt-12">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6">
            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com/profile.php?id=61579302997368" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/thesmartygym/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@thesmartygym?lang=en" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="TikTok">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@TheSmartyGym" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            {/* Copyright */}
            <p className="text-center text-sm text-muted-foreground">
              © 2025 Smarty Gym. Your intelligent fitness companion.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;