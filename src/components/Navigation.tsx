import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Settings, LogOut, LayoutDashboard, Crown, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
        checkSubscription();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
        checkSubscription();
      } else {
        setAvatarUrl(null);
        setSubscriptionInfo(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      setAvatarUrl(profile.avatar_url);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscriptionInfo(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const getUserInitials = () => {
    const name = user?.user_metadata?.full_name;
    if (name) {
      const parts = name.split(" ");
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const getPlanName = (productId: string | null) => {
    if (!productId) return null;
    // These are the product IDs from Stripe
    if (productId.includes("gold") || productId === "prod_SxiRoBlC4pPZkV") return "Gold";
    if (productId.includes("platinum") || productId === "prod_SxiRyLMu9u8NPC") return "Platinum";
    return "Premium";
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border py-2 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center gap-4">
          {/* Logo - Clickable to go home */}
          <div 
            className="flex items-center cursor-pointer flex-shrink-0"
            onClick={() => {
              navigate("/");
              setTimeout(() => window.scrollTo(0, 0), 0);
            }}
          >
            <img 
              src={smartyGymLogo} 
              alt="Smarty Gym - Home" 
              className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 flex-1 justify-center">
            <Button variant="ghost" size="sm" onClick={() => navigate("/about")}>About</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/takeatour")}>Take a Tour</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/workout")}>Workouts</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/trainingprogram")}>Programs</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tools")}>Tools</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/exerciselibrary")}>Exercise Library</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/community")}>Community</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/contact")}>Contact</Button>
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/about")} className="justify-start">
                  About
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/takeatour")} className="justify-start">
                  Take a Tour
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/workout")} className="justify-start">
                  Workouts
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/trainingprogram")} className="justify-start">
                  Programs
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/tools")} className="justify-start">
                  Tools
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/exerciselibrary")} className="justify-start">
                  Exercise Library
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/community")} className="justify-start">
                  Community
                </Button>
                <Button variant="ghost" size="lg" onClick={() => handleNavigate("/contact")} className="justify-start">
                  Contact
                </Button>
                <div className="border-t pt-4 mt-4">
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={() => handleNavigate("/premiumbenefits")}
                    className="w-full"
                  >
                    Join Premium
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate("/premiumbenefits")}
              className="hidden md:inline-flex"
            >
              Join Premium
            </Button>
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {subscriptionInfo && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-primary" />
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {subscriptionInfo.subscribed
                                ? `${getPlanName(subscriptionInfo.product_id)} Plan`
                                : "Free Plan"}
                            </p>
                            {subscriptionInfo.subscribed && subscriptionInfo.subscription_end && (
                              <p className="text-xs leading-none text-muted-foreground">
                                Until {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate("/userdashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>My Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profilesettings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-xs sm:text-sm"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="text-xs sm:text-sm"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
