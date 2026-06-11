import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminRole = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkAdminRole = async (userId: string | null) => {
      if (!userId) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        if (cancelled) return;
        setIsAdmin(!error && !!data);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Initial session check (restores from storage in APK/PWA)
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdminRole(session?.user?.id ?? null);
    });

    // React to subsequent auth changes (sign-in, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdminRole(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
};
