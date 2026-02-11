import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "smarty_welcome_banner_dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function FirstVisitBanner() {
  const [visible, setVisible] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) { setVisible(false); return; }

    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < DISMISS_DURATION_MS) {
      setVisible(false);
      return;
    }
    // Small delay so it doesn't clash with page load
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, [session]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md text-foreground shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-t border-border/40 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
        <p className="text-sm sm:text-base font-medium flex-1 text-muted-foreground">
          🏋️ Join 500+ fitness enthusiasts — Sign up free and unlock personalized workouts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate("/auth?mode=signup")}
          >
            Sign Up Free
          </Button>
          <button
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, Date.now().toString());
              setVisible(false);
            }}
            className="p-1 rounded-full hover:bg-muted transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
