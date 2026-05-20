import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
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

export const SmartyCoachWelcomePopup = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
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
    setOpen(true);
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
      void tryShow(uid);
      // Record uid AFTER attempting to show, so the SIGNED_IN auth event that fires
      // moments later (when a stored session restores) is treated as the same user
      // and does NOT re-open the popup a second time in the same load.
      lastUserIdRef.current = uid;
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

  return (
    <SmartyCoachModal
      isOpen={open}
      onClose={() => setOpen(false)}
      initialPath="menu"
    />
  );
};

export default SmartyCoachWelcomePopup;