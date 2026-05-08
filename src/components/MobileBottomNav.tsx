import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { useNavigationHistory } from "@/contexts/NavigationHistoryContext";
import { SmartyCoachModal } from "@/components/smarty-coach";
import smartyCoachIcon from "@/assets/smarty-coach-icon.png";
import { cn } from "@/lib/utils";

const HIDDEN_PATHS = ["/auth", "/reset-password", "/payment-success", "/payment-cancelled"];

/**
 * Persistent native-style bottom navigation bar — mobile only (< 768px).
 * Layout: Back · Smarty Coach · Home · Forward.
 * Forward mirrors browser/native swipe-forward via NavigationHistoryContext's forwardStack.
 */
export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { goBack, canGoBack, goForward, canGoForward } = useNavigationHistory();
  const [coachOpen, setCoachOpen] = useState(false);

  if (HIDDEN_PATHS.includes(location.pathname)) return null;

  const isHome = location.pathname === "/" || location.pathname === "/home";

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
          "lg:hidden fixed bottom-0 left-0 right-0 z-50",
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

          <Item onClick={() => setCoachOpen(true)} label="Smarty Coach">
            <img
              src={smartyCoachIcon}
              alt=""
              className="h-9 w-9 rounded-full drop-shadow"
              loading="lazy"
            />
          </Item>

          <Item onClick={() => navigate("/")} label="Home" active={isHome}>
            <Home className="h-7 w-7" strokeWidth={2.25} />
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
