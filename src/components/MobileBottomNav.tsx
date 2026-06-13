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
      <div className="flex h-12 items-center justify-between gap-0.5 px-1">
        {discoveryItems.map(({ label, path, icon: Icon, iconClass }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => handleNav(path)}
              aria-label={label}
              title={label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-lg py-1 transition-all duration-150 active:scale-95",
                active ? "text-primary" : "text-foreground/75 hover:text-primary"
              )}
            >
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-primary/10", iconClass)}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
    <SmartyCoachModal isOpen={coachOpen} onClose={() => setCoachOpen(false)} />
    </>
  );
};
