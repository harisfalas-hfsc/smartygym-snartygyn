import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  BookOpen,
  Building2,
  CalendarDays,
  Crown,
  Dumbbell,
  Flame,
  HelpCircle,
  Home,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  Newspaper,
  Shield,
  Sparkles,
  Users,
  Wrench,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  label: string;
  path?: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

const primaryTabs: NavItem[] = [
  { label: "Today", path: "/home", icon: Home, match: (path) => path === "/" || path === "/home" || path === "/start" },
  { label: "Workouts", path: "/workout", icon: Dumbbell, match: (path) => path.startsWith("/workout") || path.startsWith("/wod-archive") },
  { label: "Programs", path: "/trainingprogram", icon: CalendarDays, match: (path) => path.startsWith("/trainingprogram") },
  { label: "Tools", path: "/tools", icon: Wrench, match: (path) => path === "/tools" || path.includes("calculator") || path === "/workouttimer" },
];

const moreItems: NavItem[] = [
  { label: "Workout of the Day", path: "/workout/wod", icon: Flame },
  { label: "Smarty Ritual", path: "/daily-ritual", icon: Sparkles },
  { label: "Exercise Library", path: "/exerciselibrary", icon: BookOpen },
  { label: "Community", path: "/community", icon: Users },
  { label: "Blog", path: "/blog", icon: Newspaper },
  { label: "Smarty Plans", path: "/smarty-plans", icon: Crown },
  { label: "The Smarty Method", path: "/the-smarty-method", icon: Compass },
  { label: "Take a Tour", path: "/takeatour", icon: Compass },
  { label: "Corporate", path: "/corporate", icon: Building2 },
  { label: "FAQ", path: "/faq", icon: HelpCircle },
  { label: "Contact", path: "/contact", icon: Mail },
];

export const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAdminRole();
  const [moreOpen, setMoreOpen] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasUser(Boolean(session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasUser(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  const accountItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [];
    if (hasUser) items.push({ label: "Dashboard", path: "/userdashboard", icon: LayoutDashboard });
    if (isAdmin) items.push({ label: "Admin", path: "/admin", icon: Shield });
    return items;
  }, [hasUser, isAdmin]);

  const allMoreItems = [...accountItems, ...moreItems];
  const isMoreActive = allMoreItems.some((item) => item.path && location.pathname.startsWith(item.path));

  const goTo = (path: string) => {
    navigate(path);
    setMoreOpen(false);
    window.setTimeout(() => window.scrollTo(0, 0), 0);
  };

  return (
    <>
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[70] border-t border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg safe-area-bottom"
        aria-label="Mobile primary navigation"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-end gap-1 px-2 pt-2">
          {primaryTabs.map((item) => {
            const active = item.match?.(location.pathname) ?? location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => item.path && goTo(item.path)}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                <span className="leading-none">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-colors ${
              isMoreActive || moreOpen ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
            }`}
            aria-haspopup="dialog"
            aria-expanded={moreOpen}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="lg:hidden max-h-[78vh] overflow-y-auto rounded-t-2xl border-primary/25 px-4 pb-[calc(var(--sab)+1.25rem)] pt-5">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle className="text-xl">More from SmartyGym</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-2">
            {allMoreItems.map((item) => {
              const Icon = item.icon;
              const active = item.path ? location.pathname.startsWith(item.path) : false;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => item.path && goTo(item.path)}
                  className={`flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active ? "border-primary/50 bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/10"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};