import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Utensils, Calculator, Activity, Flame, User, LogOut, Instagram, Facebook } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
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
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="py-8 px-4 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1"></div>
            <div className="flex gap-2">
              {user ? (
                <>
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/auth")}>
                    Login
                  </Button>
                  <Button onClick={() => navigate("/auth")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <img src={smartyGymLogo} alt="Smarty Gym" className="h-24 md:h-32 w-auto" />
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your Smart Gym in Your Pocket
              </h1>
              <p className="text-muted-foreground text-lg">Tailor Made workouts, Training Programs, Nutrition Plans and Tools</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              I Want To...
            </h2>
            <p className="text-muted-foreground">Choose a service to get started with your personalized fitness journey</p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.map(service => <ServiceCard key={service.id} icon={service.icon} title={service.title} description={service.description} onClick={() => handleServiceSelect(service.id)} />)}
          </div>

          {/* CTA Section */}
          <div className="bg-card border border-border rounded-xl p-8 shadow-soft text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Fitness?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to unlock all features and get access to unlimited personalized
              workouts, training programs, and diet plans designed by AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-muted rounded-lg p-6 flex-1 max-w-xs">
                <div className="text-primary font-bold text-xl mb-2">GOLD</div>
                <div className="text-3xl font-bold mb-2">€9.99</div>
                <div className="text-sm text-muted-foreground mb-4">per month</div>
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </div>
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 flex-1 max-w-xs relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
                <div className="text-primary font-bold text-xl mb-2">PLATINUM</div>
                <div className="text-3xl font-bold mb-2">€89.99</div>
                <div className="text-sm text-muted-foreground mb-4">per year</div>
                <Button variant="default" className="w-full">
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
              <a
                href="https://www.instagram.com/thesmartygym/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61579302997368"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@thesmartygym?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
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