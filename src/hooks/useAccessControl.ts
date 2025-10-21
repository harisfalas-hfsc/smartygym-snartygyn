import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type UserTier = "guest" | "subscriber" | "premium";

interface AccessControlState {
  user: User | null;
  userTier: UserTier;
  isLoading: boolean;
  productId: string | null;
}

export const useAccessControl = () => {
  const [state, setState] = useState<AccessControlState>({
    user: null,
    userTier: "guest",
    isLoading: true,
    productId: null,
  });

  useEffect(() => {
    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await checkSubscription(session.user);
        } else {
          setState({
            user: null,
            userTier: "guest",
            isLoading: false,
            productId: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setState({
          user: null,
          userTier: "guest",
          isLoading: false,
          productId: null,
        });
        return;
      }

      await checkSubscription(session.user);
    } catch (error) {
      console.error("Error checking access:", error);
      setState({
        user: null,
        userTier: "guest",
        isLoading: false,
        productId: null,
      });
    }
  };

  const checkSubscription = async (user: User) => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      const isSubscribed = data?.subscribed || false;
      const productId = data?.product_id || null;

      setState({
        user,
        userTier: isSubscribed ? "premium" : "subscriber",
        isLoading: false,
        productId,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      // If check fails, default to subscriber (logged in but no premium)
      setState({
        user,
        userTier: "subscriber",
        isLoading: false,
        productId: null,
      });
    }
  };

  const canAccessContent = (contentType: "free-workout" | "premium-workout" | "free-program" | "premium-program" | "tool" | "dashboard" | "exercise-library" | "community"): boolean => {
    const { userTier } = state;

    // Tools are free for everyone
    if (contentType === "tool") return true;

    // Guests can't access anything except tools
    if (userTier === "guest") return false;

    // Subscribers can access free content
    if (userTier === "subscriber") {
      return contentType === "free-workout" || contentType === "free-program";
    }

    // Premium members can access everything
    return true;
  };

  return {
    ...state,
    canAccessContent,
    refreshAccess: checkAccess,
  };
};
