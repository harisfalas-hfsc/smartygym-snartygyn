import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, X } from "lucide-react";
import exitPopupBg from "@/assets/exit-popup-bg.jpg";

const REPEAT_DELAY_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_INITIAL_DELAY_MS = 10_000; // 10 seconds

export function FreeTrialPopup() {
  const [show, setShow] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isTakeATour = location.pathname === "/takeatour";
  const initialDelay = isTakeATour ? 0 : DEFAULT_INITIAL_DELAY_MS;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const showPopup = useCallback(() => {
    if (session) return;
    setShow(true);
  }, [session]);

  // Initial delay timer
  useEffect(() => {
    if (session || dismissed) return;

    const timer = setTimeout(showPopup, initialDelay);
    return () => clearTimeout(timer);
  }, [session, dismissed, showPopup, initialDelay]);

  // Repeat timer after dismiss
  useEffect(() => {
    if (!dismissed || session) return;

    const timer = setTimeout(() => {
      setDismissed(false); // reset to trigger initial effect
    }, REPEAT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [dismissed, session]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
  };

  if (session) return null;

  return (
    <Dialog open={show} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="p-0 border-0 overflow-hidden sm:max-w-lg max-w-[95vw] rounded-2xl bg-transparent shadow-2xl [&>button]:hidden">
        <div className="relative w-full">
          <img
            src={exitPopupBg}
            alt=""
            className="w-full h-auto object-cover rounded-2xl min-h-[420px] sm:min-h-[480px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 rounded-2xl" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 rounded-2xl">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5" /> 7-Day Free Trial
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
              Try Premium Free<br />for 7 Days
            </h2>

            <p className="text-sm sm:text-base text-white/90 leading-relaxed mb-4">
              Get unlimited access to all workouts, training programs, and premium tools. No charge for 7 days — cancel anytime.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <p className="text-xs sm:text-sm font-medium text-green-400 flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                Cancel anytime
              </p>
              <p className="text-xs sm:text-sm font-medium text-green-400 flex items-center gap-1.5">
                <span className="inline-block w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</span>
                No commitment
              </p>
            </div>

            <Button
              size="lg"
              className="w-full text-base sm:text-lg gap-2 h-12 sm:h-14 font-bold shadow-lg shadow-primary/30"
              onClick={() => {
                handleDismiss();
                navigate("/auth?mode=signup&trial=true");
              }}
            >
              <Crown className="w-5 h-5" />
              Start Your Free Trial
            </Button>

            <button
              onClick={handleDismiss}
              className="mt-3 text-xs text-white/50 hover:text-white/70 transition-colors text-center"
            >
              No thanks, I'll pass
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
