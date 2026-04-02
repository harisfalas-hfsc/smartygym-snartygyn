import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dumbbell, X } from "lucide-react";
import trialPopupBg from "@/assets/trial-popup-bg.jpg";

const STORAGE_KEY = "smarty_exit_popup_shown";
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

function wasShownRecently(): boolean {
  const lastShown = localStorage.getItem(STORAGE_KEY);
  if (!lastShown) return false;
  return Date.now() - parseInt(lastShown, 10) < THREE_HOURS_MS;
}

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const triggerPopup = useCallback(() => {
    if (session) return;
    if (wasShownRecently()) return;
    setShow(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, [session]);

  useEffect(() => {
    if (session) return;
    if (wasShownRecently()) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) triggerPopup();
    };

    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(triggerPopup, 30000);
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchstart", resetIdle, { passive: true });
    window.addEventListener("scroll", resetIdle, { passive: true });
    resetIdle();

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchstart", resetIdle);
      window.removeEventListener("scroll", resetIdle);
      clearTimeout(idleTimer);
    };
  }, [session, triggerPopup]);

  if (session) return null;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="p-0 border-0 overflow-hidden sm:max-w-lg max-w-[95vw] rounded-2xl bg-transparent shadow-2xl ring-1 ring-white/20 [&>button]:hidden">
        <div className="relative w-full">
          <img
            src={trialPopupBg}
            alt=""
            className="w-full h-auto object-cover rounded-2xl min-h-[420px] sm:min-h-[480px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/75 to-white/30 rounded-2xl" />

          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-white/60 hover:bg-white/80 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 rounded-2xl">
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider">
                🎁 Complimentary Workout
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(210,50%,15%)] leading-tight mb-3">
              Your Free Workout<br />Is Waiting
            </h2>

            <p className="text-sm sm:text-base text-[hsl(210,20%,25%)] leading-relaxed mb-1">
              Sign up now and receive a complimentary personalized workout directly in your dashboard — available right away.
            </p>
            <p className="text-sm sm:text-base text-[hsl(210,20%,25%)] leading-relaxed mb-4">
              Designed by our expert coach,{" "}
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  setShow(false);
                  navigate("/about");
                }}
                className="text-primary font-semibold underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                Haris Falas
              </a>
              .
            </p>

            <p className="text-xs sm:text-sm font-medium text-emerald-700 mb-4 flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600">✓</span>
              No credit card needed
            </p>

            <Button
              size="lg"
              className="w-full text-base sm:text-lg gap-2 h-12 sm:h-14 font-bold shadow-lg shadow-primary/30"
              onClick={() => {
                setShow(false);
                navigate("/auth?mode=signup&welcome_workout=true");
              }}
            >
              <Dumbbell className="w-5 h-5" />
              Get Your Complimentary Workout
            </Button>

            <button
              onClick={() => setShow(false)}
              className="mt-3 text-xs text-gray-500 hover:text-gray-700 transition-colors text-center"
            >
              No thanks, I'll pass
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
