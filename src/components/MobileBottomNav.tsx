import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Compass, ArrowLeft, Users, Info, Dumbbell, ListChecks, Sparkles, Wrench, BookOpen, Newspaper, HelpCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-sm border-2 border-primary/60", iconClass)}>
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
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                <Compass className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium leading-none">Discover</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" hideClose className="left-4 top-1/2 bottom-auto flex h-auto max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none -translate-y-1/2 flex-col overflow-hidden rounded-2xl border-2 border-primary/40 p-3 shadow-xl !animate-none transition-opacity duration-200 ease-out data-[state=closed]:opacity-0 data-[state=open]:opacity-100">
            <SheetClose asChild>
              <Button variant="ghost" className="mb-1 h-8 shrink-0 gap-2 self-start rounded-full border-2 border-primary px-3 text-sm text-primary hover:bg-primary hover:text-primary-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
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
      </div>
    </nav>
    </>
  );
};
