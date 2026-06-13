import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, ArrowLeft, Home, User as UserIcon, LayoutDashboard, LogOut, Shield, Users, Info, Dumbbell, ListChecks, Sparkles, Wrench, BookOpen, Newspaper, HelpCircle, Mail, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SmartyCoachModal } from "@/components/smarty-coach/SmartyCoachModal";
import smartyCoachIcon from "@/assets/smarty-coach-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useToast } from "@/hooks/use-toast";

const HIDDEN_PATHS = ["/auth", "/reset-password", "/payment-success", "/payment-cancelled"];

/**
 * Persistent native-style bottom navigation bar — mobile only (< 768px).
 * Layout: Back · Smarty Coach · Forward.
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [coachOpen, setCoachOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const { data: unreadCount = 0 } = useUnreadMessages();
  const { isAdmin } = useAdminRole();
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setTimeout(() => loadProfile(session.user.id), 0);
      else { setAvatarUrl(null); setProfileName(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase.from("profiles").select("avatar_url, full_name").eq("user_id", uid).maybeSingle();
    if (data) { setAvatarUrl(data.avatar_url); setProfileName(data.full_name || null); }
  };

  const getInitials = () => {
    const name = (profileName || user?.user_metadata?.full_name || "").trim();
    if (name) {
      const parts = name.split(" ").filter(Boolean);
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
    }
    return user?.email?.[0].toUpperCase() || "U";
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const handleLogout = async () => {
    try {
      setUser(null);
      setAvatarUrl(null);
      await supabase.auth.signOut({ scope: 'global' });
      toast({ title: "Logged out", description: "You have been logged out successfully" });
      navigate("/");
      setTimeout(() => { window.scrollTo(0, 0); window.location.reload(); }, 100);
    } catch {
      toast({ title: "Error", description: "Failed to log out.", variant: "destructive" });
    }
  };

  const discoveryItems = [
    { label: "About SmartyGym", path: "/about", icon: Info, iconClass: "text-teal-500" },
    { label: "Smarty Workouts", path: "/workout", icon: Dumbbell, iconClass: "text-primary" },
    { label: "Smarty Programs", path: "/trainingprogram", icon: ListChecks, iconClass: "text-blue-500" },
    { label: "Smarty Ritual", path: "/daily-ritual", icon: Sparkles, iconClass: "text-purple-500" },
    { label: "Smarty Tools", path: "/tools", icon: Wrench, iconClass: "text-orange-500" },
    { label: "Smarty Blog", path: "/blog", icon: Newspaper, iconClass: "text-red-500" },
    { label: "Exercise Library", path: "/exerciselibrary", icon: BookOpen, iconClass: "text-emerald-500" },
    { label: "Community", path: "/community", icon: Users, iconClass: "text-cyan-500" },
    { label: "FAQ", path: "/faq", icon: HelpCircle, iconClass: "text-purple-500" },
    { label: "Contact", path: "/contact", icon: Mail, iconClass: "text-indigo-500" },
  ];

  if (!isMobile || HIDDEN_PATHS.includes(location.pathname)) return null;

  const itemClass = "flex h-full flex-1 items-center justify-center transition-all duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset text-foreground/80 hover:text-primary";

  return (
    <>
    <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background/95 backdrop-blur-md",
          "border-t border-primary/20",
          "shadow-[0_-4px_16px_-4px_hsl(var(--primary)/0.15)]"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Mobile navigation bar"
      >
        <div className="flex h-14 items-stretch">
          {/* Discovery */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Discovery" className={itemClass}>
                <Menu className="h-7 w-7" strokeWidth={2.25} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" hideClose className="left-4 top-1/2 bottom-auto flex h-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none -translate-y-1/2 flex-col overflow-hidden rounded-2xl border-2 border-primary/40 p-3 shadow-xl !animate-none transition-opacity duration-200 ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
              <SheetClose asChild>
                <button className="mb-1 inline-flex h-8 shrink-0 items-center gap-2 self-start rounded-full border-2 border-primary px-3 text-sm text-primary hover:bg-primary hover:text-primary-foreground">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              </SheetClose>
              <div className="mb-2 shrink-0">
                <h2 className="text-lg font-bold leading-tight text-foreground">Explore SmartyGym</h2>
              </div>
              <nav className="grid grid-cols-2 gap-2 overflow-y-auto">
                {discoveryItems.map(({ label, path, icon: Icon, iconClass }) => {
                  const active = location.pathname === path;
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => handleNav(path)}
                      className={`flex flex-col items-center justify-center rounded-2xl border-2 p-2 text-center font-semibold transition-all duration-200 ${active ? 'border-primary bg-primary/15 text-primary shadow-sm' : 'border-primary/25 bg-card text-foreground hover:border-primary hover:bg-primary/10'}`}
                    >
                      <span className={`mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ${iconClass}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="block text-xs leading-tight">{label}</span>
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Home */}
          <button
            type="button"
            onClick={() => { navigate("/"); setTimeout(() => window.scrollTo(0, 0), 0); }}
            aria-label="Home"
            className={itemClass}
          >
            <Home className="h-7 w-7" strokeWidth={2.25} />
          </button>

          {/* Smarty Coach — center, prominent */}
          <button
            type="button"
            onClick={() => setCoachOpen(true)}
            aria-label="Smarty Coach"
            className="flex h-full flex-1 items-center justify-center transition-all duration-150 active:scale-90 focus:outline-none"
          >
            <span className="inline-flex h-12 w-12 -mt-4 items-center justify-center rounded-full border-2 border-primary bg-background shadow-[0_4px_12px_-2px_hsl(var(--primary)/0.4)]">
              <img src={smartyCoachIcon} alt="" aria-hidden="true" className="h-9 w-9 rounded-full" width={36} height={36} />
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
            className={itemClass}
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-7 w-7" strokeWidth={2.25} />
            ) : (
              <Moon className="h-7 w-7" strokeWidth={2.25} />
            )}
          </button>

        </div>
    </nav>
    <SmartyCoachModal isOpen={coachOpen} onClose={() => setCoachOpen(false)} />
    </>
  );
};
