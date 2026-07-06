import { useLocation, useNavigate } from "react-router-dom";
import { Dumbbell, ListChecks, Wrench, BookOpen, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const HIDDEN_PATHS = ["/auth", "/reset-password", "/payment-success", "/payment-cancelled"];

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNav = (path: string) => {
    navigate(path);
    setTimeout(() => window.scrollTo(0, 0), 0);
  };

  const primaryItems = [
    { label: "Workouts", path: "/workout", icon: Dumbbell, iconClass: "text-primary" },
    { label: "Programs", path: "/trainingprogram", icon: ListChecks, iconClass: "text-blue-500" },
    { label: "Tools", path: "/tools", icon: Wrench, iconClass: "text-orange-500" },
    { label: "Blog", path: "/blog", icon: Newspaper, iconClass: "text-red-500" },
    { label: "Exercises", path: "/exerciselibrary", icon: BookOpen, iconClass: "text-emerald-500" },
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
      </div>
    </nav>
    </>
  );
};
