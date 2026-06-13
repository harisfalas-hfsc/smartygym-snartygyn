import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Compass, Users, Info, Dumbbell, ListChecks, Sparkles, Wrench, BookOpen, Newspaper, HelpCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const HIDDEN_PATHS = ["/auth", "/reset-password", "/payment-success", "/payment-cancelled"];

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [discoveryOpen, setDiscoveryOpen] = useState(false);

  const handleNav = (path: string) => {
    navigate(path);
    setDiscoveryOpen(false);
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const primaryItems = [
    { label: "Workouts", path: "/workout", icon: Dumbbell, iconClass: "text-primary" },
    { label: "Programs", path: "/trainingprogram", icon: ListChecks, iconClass: "text-blue-500" },
    { label: "Tools", path: "/tools", icon: Wrench, iconClass: "text-orange-500" },
    { label: "Blog", path: "/blog", icon: Newspaper, iconClass: "text-red-500" },
    { label: "Exercises", path: "/exerciselibrary", icon: BookOpen, iconClass: "text-emerald-500" },
  ];

  const discoveryItems = [
    { label: "About SmartyGym", path: "/about", icon: Info, iconClass: "text-teal-500" },
    { label: "Smarty Ritual", path: "/daily-ritual", icon: Sparkles, iconClass: "text-purple-500" },
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
      <div className="flex h-16 items-stretch justify-between gap-0.5 px-1">
        {primaryItems.map(({ label, path, icon: Icon, iconClass }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => handleNav(path)}
              aria-label={label}
              title={label}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 transition-all duration-150 active:scale-95",
                active ? "text-primary" : "text-foreground/75 hover:text-primary"
              )}
            >
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-primary/10", iconClass)}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </button>
          );
        })}
        <Sheet open={discoveryOpen} onOpenChange={setDiscoveryOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Discover more"
              title="Discover"
              className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1 text-foreground/75 transition-all duration-150 active:scale-95 hover:text-primary"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">Discover</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <SheetHeader>
              <SheetTitle>Discover</SheetTitle>
            </SheetHeader>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {discoveryItems.map(({ label, path, icon: Icon, iconClass }) => (
                <SheetClose asChild key={path}>
                  <button
                    type="button"
                    onClick={() => handleNav(path)}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card p-3 text-center transition-colors hover:border-primary/40"
                  >
                    <span className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-primary/10", iconClass)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium leading-tight">{label}</span>
                  </button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
    </>
  );
};
