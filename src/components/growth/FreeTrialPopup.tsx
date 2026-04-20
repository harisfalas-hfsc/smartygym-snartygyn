import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, X } from "lucide-react";
import popupImg from "@/assets/popup-free-trial-bright.jpg";

const REPEAT_DELAY_MS = 5 * 60 * 1000;
const DEFAULT_INITIAL_DELAY_MS = 10_000;

export function FreeTrialPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasSubscriptionHistory, setHasSubscriptionHistory] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userTier, isLoading } = useAccessControl();

  const isTakeATour = location.pathname === "/takeatour";
  const initialDelay = isTakeATour ? 0 : DEFAULT_INITIAL_DELAY_MS;

  useEffect(() => {
    if (!user || userTier !== "subscriber") {
      setHasSubscriptionHistory(null);
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();
      setHasSubscriptionHistory(!!data);
    };
    check();
  }, [user, userTier]);

  const shouldShowPopup = useCallback((): boolean => {
    if (isLoading) return false;
    if (!user) return true;
    if (userTier === "premium") return false;
    if (userTier === "subscriber" && hasSubscriptionHistory === false) return true;
    return false;
  }, [user, userTier, isLoading, hasSubscriptionHistory]);

  const triggerPopup = useCallback(() => {
    if (shouldShowPopup()) setShow(true);
  }, [shouldShowPopup]);

  useEffect(() => {
    if (dismissed || isLoading) return;
    if (!shouldShowPopup()) return;
    const timer = setTimeout(triggerPopup, initialDelay);
    return () => clearTimeout(timer);
  }, [dismissed, triggerPopup, initialDelay, isLoading, shouldShowPopup]);

  useEffect(() => {
    if (!dismissed) return;
    const timer = setTimeout(() => setDismissed(false), REPEAT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [dismissed]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  if (!isLoading && user && (userTier === "premium" || hasSubscriptionHistory === true)) {
    return null;
  }

  const handleCTA = () => {
    handleDismiss();
    if (user) {
      navigate("/smarty-plans");
    } else {
      navigate("/auth?mode=signup&trial=true");
    }
  };

  return (
    <Dialog open={show} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="p-0 border-0 overflow-hidden sm:max-w-lg max-w-[95vw] rounded-2xl bg-card border-2 border-primary/40 shadow-2xl [&>button]:hidden">
        <div className="flex flex-col">
          {/* Bright image section */}
          <div className="relative h-[200px] overflow-hidden">
            <img
              src={popupImg}
              alt="Premium fitness experience"
              className="w-full h-full object-cover"
              loading="eager"
            />
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content section */}
          <div className="flex flex-col p-5 sm:p-6">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> 3-Day Free Trial
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
              Try Premium Free<br />for 3 Days
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
              Get unlimited access to all workouts, training programs, and premium tools. No charge for 3 days — cancel anytime.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-xs sm:text-sm font-medium text-emerald-500 flex items-center gap-1.5">
                <span className="inline-flex w-4 h-4 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-500">✓</span>
                Cancel anytime
              </p>
              <p className="text-xs sm:text-sm font-medium text-emerald-500 flex items-center gap-1.5">
                <span className="inline-flex w-4 h-4 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-500">✓</span>
                No commitment
              </p>
            </div>

            <Button
              size="lg"
              className="w-full text-base sm:text-lg gap-2 h-12 sm:h-14 font-bold shadow-lg shadow-primary/30"
              onClick={handleCTA}
              data-track-cta="free-trial-popup"
            >
              <Crown className="w-5 h-5" />
              Start Your Free Trial
            </Button>

            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              No thanks, I'll pass
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
