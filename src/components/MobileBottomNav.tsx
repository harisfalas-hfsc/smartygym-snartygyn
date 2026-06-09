import { useLocation } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCw, Sun, Moon } from "lucide-react";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { SmartyCoachModal } from "@/components/smarty-coach/SmartyCoachModal";
import smartyCoachIcon from "@/assets/smarty-coach-icon.png";

const HIDDEN_PATHS = ["/auth", "/reset-password", "/payment-success", "/payment-cancelled"];

/**
 * Persistent native-style bottom navigation bar — mobile only (< 768px).
 * Layout: Back · Refresh · Theme · Forward.
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { goBack, canGoBack, goForward, canGoForward } = useNavigationHistory();
  const { resolvedTheme, setTheme } = useTheme();
  const [coachOpen, setCoachOpen] = useState(false);

  if (!isMobile || HIDDEN_PATHS.includes(location.pathname)) return null;

  const Item = ({
    onClick,
    disabled,
    label,
    children,
    active,
  }: {
    onClick: () => void;
    disabled?: boolean;
    label: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-full flex-1 items-center justify-center",
        "transition-all duration-150 active:scale-90",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset",
        disabled
          ? "text-muted-foreground/40"
          : active
          ? "text-primary"
          : "text-foreground/80 hover:text-primary"
      )}
    >
      {children}
    </button>
  );

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
          <Item onClick={goBack} disabled={!canGoBack} label="Back">
            <ChevronLeft className="h-7 w-7" strokeWidth={2.25} />
          </Item>

          <Item onClick={() => window.location.reload()} label="Refresh">
            <RotateCw className="h-6 w-6" strokeWidth={2.25} />
          </Item>

          <button
            type="button"
            onClick={() => setCoachOpen(true)}
            aria-label="Smarty Coach"
            className={cn(
              "flex h-full flex-1 items-center justify-center",
              "transition-all duration-150 active:scale-90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
            )}
          >
            <span className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border shadow-sm",
              resolvedTheme === "dark"
                ? "border-primary/30 bg-background"
                : "border-primary/50 bg-[#0f172a]"
            )}>
              <img
                src={smartyCoachIcon}
                alt=""
                aria-hidden="true"
                className="h-7 w-7 rounded-full"
                width={28}
                height={28}
              />
            </span>
          </button>

          <Item
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            <div className="relative flex h-6 w-6 items-center justify-center">
              <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" strokeWidth={2.25} />
              <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" strokeWidth={2.25} />
            </div>
          </Item>

          <Item onClick={goForward} disabled={!canGoForward} label="Forward">
            <ChevronRight className="h-7 w-7" strokeWidth={2.25} />
          </Item>
        </div>
    </nav>
    <SmartyCoachModal isOpen={coachOpen} onClose={() => setCoachOpen(false)} />
    </>
  );
};
