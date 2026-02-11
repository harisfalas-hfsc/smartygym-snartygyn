import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Dumbbell } from "lucide-react";

const STORAGE_KEY = "smarty_exit_popup_shown";

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
    if (session) return; // logged in
    if (localStorage.getItem(STORAGE_KEY)) return; // already shown
    setShow(true);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }, [session]);

  useEffect(() => {
    if (session) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Desktop: mouse leave toward top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5) triggerPopup();
    };

    // Mobile: idle timer (30s)
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
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Wait! Get a FREE Workout
          </DialogTitle>
          <DialogDescription className="text-base">
            Sign up now and receive a <strong>complimentary personalized workout</strong> — designed by our expert coach just for you. No credit card needed!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            size="lg"
            className="w-full text-lg gap-2"
            onClick={() => {
              setShow(false);
              navigate("/auth?mode=signup&welcome_workout=true");
            }}
          >
            <Dumbbell className="w-5 h-5" />
            Sign Up Free
          </Button>
          <button
            onClick={() => setShow(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll pass
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
