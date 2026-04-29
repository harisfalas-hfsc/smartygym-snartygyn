import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Settings, LogOut, LayoutDashboard, Crown, Bell, Facebook, Instagram, Youtube, ShoppingBag, Info, Dumbbell, ListChecks, Wrench, BookOpen, Users, Newspaper, Mail, Sparkles, Building2, Shield, HelpCircle, Compass, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

import { SafeNotificationBadge } from "@/components/NotificationBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminRole } from "@/hooks/useAdminRole";

interface SubscriptionInfo {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
}

interface CorporateSubscriptionInfo {
  plan_type: string;
  status: string;
}

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [corporateSubscription, setCorporateSubscription] = useState<CorporateSubscriptionInfo | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadMessages();
  const isMobile = useIsMobile();
  const { isAdmin } = useAdminRole();
  const headerRef = useRef<HTMLElement>(null);

  // Dynamically set --app-header-h CSS variable based on actual header height
  useLayoutEffect(() => {
    let frame = 0;
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--app-header-h', `${height}px`);
      }
    };

    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateHeaderHeight);
    });
    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, []);

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
      .select("avatar_url, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setProfileName(profile.full_name || null);
    }

    // Check for corporate subscription
    const { data: corpSub } = await supabase
      .from('corporate_subscriptions')
      .select('plan_type, status')
      .eq('admin_user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (corpSub) {
      setCorporateSubscription(corpSub);
    } else {
      setCorporateSubscription(null);
    }
  };

  const getCorporatePlanName = (planType: string) => {
    const names: Record<string, string> = {
      'dynamic': 'Dynamic',
      'power': 'Power',
      'elite': 'Elite',
      'enterprise': 'Enterprise'
    };
    return names[planType.toLowerCase()] || planType;
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
    // Prefer profile name from DB, fall back to auth metadata, then email
    const name = (profileName || user?.user_metadata?.full_name || "").trim();
    if (name) {
      const parts = name.split(" ").filter(p => p.length > 0);
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
    setDesktopMenuOpen(false);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const handleProfileNavigate = (path: string) => {
    navigate(path);
    // Scroll to top after navigation
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const discoveryItems = [
    { label: "Smarty Workouts", path: "/workout", icon: Dumbbell, iconClass: "text-primary", track: undefined },
    { label: "Smarty Programs", path: "/trainingprogram", icon: ListChecks, iconClass: "text-blue-500", track: undefined },
    { label: "Smarty Ritual", path: "/daily-ritual", icon: Sparkles, iconClass: "text-purple-500", track: undefined },
    { label: "Smarty Tools", path: "/tools", icon: Wrench, iconClass: "text-orange-500", track: undefined },
    { label: "Exercise Library", path: "/exerciselibrary", icon: BookOpen, iconClass: "text-emerald-500", track: undefined },
    { label: "Community", path: "/community", icon: Users, iconClass: "text-cyan-500", track: undefined },
    { label: "Blog", path: "/blog", icon: Newspaper, iconClass: "text-red-500", track: undefined },
    { label: "Take a Tour", path: "/takeatour", icon: Info, iconClass: "text-teal-500", track: undefined },
    { label: "Smarty Plans", path: "/smarty-plans", icon: Crown, iconClass: "text-yellow-500", track: "view-plans-nav" },
    { label: "Smarty Corporate", path: "/corporate", icon: Building2, iconClass: "text-sky-500", track: undefined },
    { label: "FAQ", path: "/faq", icon: HelpCircle, iconClass: "text-purple-500", track: undefined },
    { label: "The Smarty Method", path: "/the-smarty-method", icon: BookOpen, iconClass: "text-amber-500", track: undefined },
    { label: "Contact", path: "/contact", icon: Mail, iconClass: "text-indigo-500", track: undefined },
  ];

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50 bg-background pt-2 pb-0.5 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex justify-between items-center gap-4">
          {/* LEFT SECTION - Hamburger Menu + Social Media Icons */}
          <div className="flex items-center gap-2">
            {/* Desktop Menu - original layout */}
            {!isMobile && (
              <Sheet open={desktopMenuOpen} onOpenChange={setDesktopMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 sm:h-16 sm:w-16 -ml-4">
                    <svg className="h-14 w-14 sm:h-12 sm:w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="4" x2="21" y2="4" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="20" x2="21" y2="20" />
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 overflow-y-auto max-h-screen">
                  <nav className="flex flex-col gap-2 mt-8 pb-8">
                    {discoveryItems.map(({ label, path, icon: Icon, iconClass, track }) => (
                      <Button
                        key={path}
                        variant="ghost"
                        onClick={() => handleNavigate(path)}
                        className={`justify-start font-semibold transition-all duration-200 ${location.pathname === path ? 'text-primary underline underline-offset-4 bg-primary/10' : 'text-foreground hover:bg-primary/10 hover:text-foreground'}`}
                        data-track-cta={track}
                      >
                        <Icon className={`mr-2 h-4 w-4 ${iconClass}`} />
                        {label}
                      </Button>
                    ))}
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          window.open('/admin', '_blank', 'noopener,noreferrer');
                          setDesktopMenuOpen(false);
                        }}
                        className="justify-start font-semibold transition-all duration-200 text-red-600 hover:bg-red-100/80 hover:text-red-700"
                      >
                        <Shield className="mr-2 h-4 w-4 text-red-600" />
                        Admin
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            )}

            {/* Mobile Discovery Menu */}
            {isMobile && <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="inline-flex lg:hidden h-12 min-w-0 gap-1.5 rounded-full px-2.5 -ml-2 text-primary">
                  <Compass className="h-6 w-6" />
                  <span className="text-[10px] font-semibold leading-none tracking-normal">Discovery</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="h-[100dvh] w-screen max-w-none overflow-y-auto border-r-0 p-4 pt-12">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-normal text-primary">Discovery</p>
                  <h2 className="mt-1 text-2xl font-bold leading-tight text-foreground">Explore SmartyGym</h2>
                </div>
                <nav className="grid grid-cols-2 gap-3 pb-8">
                  {discoveryItems.map(({ label, path, icon: Icon, iconClass, track }) => {
                    const active = location.pathname === path;
                    return (
                      <button
                        key={path}
                        type="button"
                        onClick={() => handleNavigate(path)}
                        data-track-cta={track}
                        className={`min-h-[112px] rounded-2xl border-2 p-3 text-center font-semibold transition-all duration-200 ${active ? 'border-primary bg-primary/15 text-primary shadow-sm' : 'border-primary/25 bg-card text-foreground hover:border-primary hover:bg-primary/10'}`}
                      >
                        <span className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ${iconClass}`}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="block text-sm leading-tight">{label}</span>
                      </button>
                    );
                  })}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open('/admin', '_blank', 'noopener,noreferrer');
                        setMobileMenuOpen(false);
                      }}
                      className="min-h-[112px] rounded-2xl border-2 border-destructive/25 bg-card p-3 text-center font-semibold text-destructive transition-all duration-200 hover:border-destructive hover:bg-destructive/10"
                    >
                      <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <Shield className="h-6 w-6" />
                      </span>
                      <span className="block text-sm leading-tight">Admin</span>
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>}

            {/* Social Media Icons */}
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="https://www.facebook.com/profile.php?id=61579302997368"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/thesmartygym/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@thesmartygym?lang=en"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
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
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* CENTER SECTION - Logo */}
          <div className="flex-1 flex justify-center max-w-[50%] sm:max-w-none">
            <Link
              to="/home"
              className="cursor-pointer flex-shrink-0"
            >
              <img
                src={smartyGymLogo}
                alt="SmartyGym"
                className="h-12 xs:h-14 sm:h-[68px] md:h-20 lg:h-24 w-auto object-contain dark:mix-blend-lighten"
              />
            </Link>
          </div>

           {/* Right Side - Auth */}
           <div className="flex items-center gap-2">
             <div><ThemeToggle /></div>
             {/* Admin Button - only visible to admins */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/admin', '_blank', 'noopener,noreferrer')}
                className="hidden sm:flex items-center gap-1.5 border-red-500/50 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            )}
            
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
                  <Button variant="ghost" className="relative h-11 w-11 rounded-full">
                    <Avatar className={`h-11 w-11 ${subscriptionInfo?.subscribed ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' : ''} ${corporateSubscription ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-background' : ''}`}>
                      <AvatarImage src={avatarUrl || undefined} alt="Profile" />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    {/* Premium Badge */}
                    {subscriptionInfo?.subscribed && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center">
                        <Crown className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                    {/* Corporate Admin Badge */}
                    {corporateSubscription && (
                      <div className={`absolute ${subscriptionInfo?.subscribed ? '-bottom-1' : '-top-1'} -right-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center`}>
                        <Building2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-w-[calc(100vw-2rem)] bg-popover" align="end" forceMount sideOffset={5}>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profileName || user.user_metadata?.full_name || "User"}
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
                          <Crown className={`h-4 w-4 ${subscriptionInfo.subscribed ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex flex-col space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium leading-none">
                                {subscriptionInfo.subscribed
                                  ? `${getPlanName(subscriptionInfo.product_id)} Plan`
                                  : "Free Plan"}
                              </p>
                              {subscriptionInfo.subscribed && (
                                <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-primary/20 to-sky-500/20 text-primary border-primary/30 px-1.5 py-0">
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

                  {/* Corporate Admin Section */}
                  {corporateSubscription && (
                    <>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium leading-none">
                                Corporate Admin
                              </p>
                              <Badge variant="outline" className="text-[10px] bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400 border-blue-500/30 px-1.5 py-0">
                                {getCorporatePlanName(corporateSubscription.plan_type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuItem 
                        onSelect={() => {
                          handleProfileNavigate("/corporate-admin");
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Team</span>
                      </DropdownMenuItem>
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
                  <button
                    className="p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label="Login or Sign Up"
                  >
                    <UserIcon className="h-5 w-5" />
                  </button>
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
