import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { User as UserIcon, Settings, LogOut, LayoutDashboard, Crown, Menu, Bell, Facebook, Instagram, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { SafeNotificationBadge } from "@/components/NotificationBadge";

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
  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadMessages();

  // Listen for messages being read to update badge immediately
  useEffect(() => {
    const handleMessagesRead = () => {
      refetchUnread();
    };
    
    window.addEventListener('messages-read', handleMessagesRead);
    return () => window.removeEventListener('messages-read', handleMessagesRead);
  }, [refetchUnread]);

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
        // Defer Supabase calls to prevent deadlock
        setTimeout(() => {
          loadUserData(session.user.id);
          checkSubscription();
        }, 0);
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
      // Read subscription directly from database for faster access
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbData, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, current_period_end, stripe_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError && dbError.code !== 'PGRST116') {
        console.error("Database subscription error:", dbError);
        return;
      }

      const isSubscribed = dbData?.status === 'active' && 
                         (dbData?.plan_type === 'gold' || dbData?.plan_type === 'platinum');

      setSubscriptionInfo({
        subscribed: isSubscribed,
        product_id: dbData?.plan_type || null,
        subscription_end: dbData?.current_period_end || null
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear all local state first
      setUser(null);
      setAvatarUrl(null);
      setSubscriptionInfo(null);
      
      // Sign out with global scope to clear all sessions
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out completely. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      // Navigate to home and force page reload to clear all state
      navigate("/");
      setTimeout(() => {
        window.scrollTo(0, 0);
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
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
    // productId is the plan_type from database ('gold', 'platinum', or 'free')
    const planType = productId.toLowerCase();
    if (planType === "gold") return "Gold";
    if (planType === "platinum") return "Platinum";
    if (planType === "free") return null; // Don't show "Free" as a plan name
    return "Premium";
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const handleProfileNavigate = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border py-1 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-center gap-4">
          {/* LEFT SECTION - Hamburger Menu + Social Media Icons */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <nav className="flex flex-col gap-2 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/about")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/about' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    About
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/workout")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/workout' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Workouts
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/trainingprogram")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/trainingprogram' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Programs
                  </Button>
                  {/* TEMPORARILY DISABLED - Personal Training
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/personal-training")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/personal-training' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Personal Training
                  </Button>
                  */}
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/tools")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/tools' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Tools
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/exerciselibrary")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/exerciselibrary' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Exercise Library
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/community")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/community' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Community
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/blog")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/blog' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Blog
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigate("/contact")}
                    className={`justify-start font-semibold transition-all duration-200 ${location.pathname === '/contact' ? 'text-primary underline underline-offset-4 bg-yellow-100/50' : 'text-foreground hover:bg-yellow-100/80 hover:text-foreground'}`}
                  >
                    Contact
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Social Media Icons */}
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=61579302997368"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/thesmartygym/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@thesmartygym?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@TheSmartyGym"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* CENTER SECTION - Logo */}
          <div className="flex-1 flex justify-center">
            <div
              onClick={() => handleNavigate("/")}
              className="cursor-pointer flex-shrink-0"
            >
              <img
                src={smartyGymLogo}
                alt="SmartyGym"
                className="h-20 sm:h-24 md:h-28 lg:h-32 w-auto object-contain"
              />
            </div>
          </div>

          {/* Right Side - Auth */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {user && unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  navigate("/userdashboard?tab=messages");
                  setTimeout(() => window.scrollTo(0, 0), 0);
                }}
              >
                <Bell className="h-5 w-5" />
                <SafeNotificationBadge count={unreadCount} />
              </Button>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className={`h-10 w-10 ${subscriptionInfo?.subscribed ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' : ''}`}>
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    {subscriptionInfo?.subscribed && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)] bg-popover" align="end" forceMount sideOffset={5}>
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
                          <Crown className={`h-4 w-4 ${subscriptionInfo.subscribed ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                          <div className="flex flex-col space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium leading-none">
                                {subscriptionInfo.subscribed
                                  ? `${getPlanName(subscriptionInfo.product_id)} Plan`
                                  : "Free Plan"}
                              </p>
                              {subscriptionInfo.subscribed && (
                                <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 px-1.5 py-0">
                                  Premium
                                </Badge>
                              )}
                            </div>
                            {subscriptionInfo.subscribed && subscriptionInfo.subscription_end && (
                              <p className="text-xs leading-none text-muted-foreground">
                                Until {new Date(subscriptionInfo.subscription_end).toLocaleDateString()}
                              </p>
                            )}
                            {subscriptionInfo.subscribed && !subscriptionInfo.subscription_end && (
                              <p className="text-xs leading-none text-muted-foreground">
                                Active subscription
                              </p>
                            )}
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem 
                    onSelect={() => {
                      handleProfileNavigate("/userdashboard");
                    }}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={() => {
                      handleLogout();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="text-xs sm:text-sm">
                    Login / Sign Up
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 max-w-[calc(100vw-2rem)] bg-background" align="end">
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      navigate("/auth?mode=login");
                      setTimeout(() => window.scrollTo(0, 0), 0);
                    }}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onSelect={(e) => {
                      e.preventDefault();
                      navigate("/auth?mode=signup");
                      setTimeout(() => window.scrollTo(0, 0), 0);
                    }}
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Sign Up</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
