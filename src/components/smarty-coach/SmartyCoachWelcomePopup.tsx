import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Brain, Flame, Activity, Target, Wrench, BookOpen, Sparkles, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SmartyCoachModal } from "./SmartyCoachModal";

const INITIAL_DELAY_MS = 1500;
const NEVER_KEY = "smarty-welcome-never";
const SESSION_ANON_KEY = "smarty-welcome-shown-anon";
const sessionUserKey = (id: string) => `smarty-welcome-shown-user-${id}`;

const BLOCKED_ROUTE_PREFIXES = [
  "/auth",
  "/reset-password",
  "/admin",
  "/payment",
  "/checkout",
  "/unsubscribe",
  "/newsletter-thank-you",
  "/corporate-admin",
];

type CoachPath = 'workout' | 'program' | 'knowledge';

interface OptionCardProps {
  emoji: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  accent?: 'primary' | 'amber' | 'emerald' | 'violet' | 'rose' | 'sky';
}

const accentClasses: Record<NonNullable<OptionCardProps['accent']>, string> = {
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  violet: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  sky: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
};

const OptionCard = ({ emoji, title, description, Icon, onClick, accent = 'primary' }: OptionCardProps) => (
  <button
    onClick={onClick}
    className={cn(
      "group relative w-full text-left rounded-2xl border-2 border-border bg-card p-4 sm:p-5",
      "transition-all duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10",
      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    )}
  >
    <div className="flex items-center gap-3 sm:gap-4">
      <div className={cn("w-12 h-12 min-w-[3rem] rounded-xl flex items-center justify-center text-2xl", accentClasses[accent])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-foreground text-sm sm:text-base leading-tight">
          <span className="mr-1.5">{emoji}</span>{title}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
    </div>
  </button>
);

export const SmartyCoachWelcomePopup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const [coachPath, setCoachPath] = useState<CoachPath>('workout');
  const lastUserIdRef = useRef<string | null>(null);

  const isBlockedRoute = BLOCKED_ROUTE_PREFIXES.some(p => location.pathname.startsWith(p));

  const tryShow = useCallback(async (forUserId: string | null) => {
    try {
      if (localStorage.getItem(NEVER_KEY) === "1") return;
    } catch {}
    const key = forUserId ? sessionUserKey(forUserId) : SESSION_ANON_KEY;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}
    setShow(true);
    try { sessionStorage.setItem(key, "1"); } catch {}
  }, []);

  // Initial landing trigger
  useEffect(() => {
    if (isBlockedRoute) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;
      lastUserIdRef.current = uid;
      void tryShow(uid);
    }, INITIAL_DELAY_MS);
    return () => { cancelled = true; window.clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-trigger right after a sign-in within the same session
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      if (event === 'SIGNED_IN' && uid && uid !== lastUserIdRef.current) {
        lastUserIdRef.current = uid;
        if (!isBlockedRoute) void tryShow(uid);
      }
      if (event === 'SIGNED_OUT') {
        lastUserIdRef.current = null;
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [isBlockedRoute, tryShow]);

  const close = () => setShow(false);

  const handleNavigate = (path: string) => {
    close();
    navigate(path);
  };

  const handleCoachPath = (path: CoachPath) => {
    setCoachPath(path);
    setShow(false);
    // Small delay so the welcome dialog can unmount cleanly before the coach modal mounts
    window.setTimeout(() => setCoachOpen(true), 150);
  };

  const handleNeverShow = () => {
    try { localStorage.setItem(NEVER_KEY, "1"); } catch {}
    close();
  };

  return (
    <>
      <Dialog open={show} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent
          className={cn(
            "p-0 border-0 overflow-hidden",
            "w-[95vw] max-w-lg md:max-w-2xl",
            "max-h-[90vh] overflow-y-auto",
            "rounded-2xl bg-card border-2 border-primary/30 shadow-2xl shadow-primary/20",
            "[&>button]:hidden"
          )}
        >
          {/* Header band with gradient */}
          <div className="relative px-5 sm:px-7 pt-7 pb-5 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 animate-in zoom-in-50 duration-500">
                  <Brain className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
                  Hi <span className="inline-block animate-in slide-in-from-bottom-1 duration-500">👋</span> I'm your Smarty Coach
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  How can I help you today?
                </p>
              </div>
            </div>
          </div>

          {/* Options grid */}
          <div className="px-5 sm:px-7 pb-5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <OptionCard
                emoji="🔥"
                title="Workout of the Day"
                description="Check today's bodyweight & equipment WOD"
                Icon={Flame}
                accent="amber"
                onClick={() => handleNavigate('/workout/wod')}
              />
              <OptionCard
                emoji="💪"
                title="Start a Workout"
                description="Find the perfect workout for right now"
                Icon={Activity}
                accent="primary"
                onClick={() => handleCoachPath('workout')}
              />
              <OptionCard
                emoji="🎯"
                title="Start a Program"
                description="Get a structured multi-week training plan"
                Icon={Target}
                accent="emerald"
                onClick={() => handleCoachPath('program')}
              />
              <OptionCard
                emoji="🛠️"
                title="Use a Tool"
                description="Track weight, body composition, calories & more"
                Icon={Wrench}
                accent="sky"
                onClick={() => handleNavigate('/tools')}
              />
              <OptionCard
                emoji="📚"
                title="Upgrade My Knowledge"
                description="Discover articles on fitness, nutrition & wellness"
                Icon={BookOpen}
                accent="violet"
                onClick={() => handleCoachPath('knowledge')}
              />
              <OptionCard
                emoji="✨"
                title="Learn More About Smarty Gym"
                description="Discover the method, the coach, the philosophy"
                Icon={Sparkles}
                accent="rose"
                onClick={() => handleNavigate('/about-smartygym')}
              />
            </div>

            <div className="flex items-center justify-between mt-5 pt-3 border-t border-border">
              <Button variant="ghost" size="sm" onClick={close} className="text-muted-foreground">
                Maybe later
              </Button>
              <button
                onClick={handleNeverShow}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Don't show again
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SmartyCoachModal
        isOpen={coachOpen}
        onClose={() => setCoachOpen(false)}
        initialPath={coachPath}
      />
    </>
  );
};

export default SmartyCoachWelcomePopup;