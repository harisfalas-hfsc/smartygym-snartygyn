import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type UserTier = "guest" | "subscriber" | "premium";

interface AccessControlState {
  user: User | null;
  userTier: UserTier;
  isLoading: boolean;
  productId: string | null;
}

interface AccessControlContextType extends AccessControlState {
  canAccessContent: (contentType: string) => boolean;
  canInteract: (contentType: string) => boolean;
  refreshAccess: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
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
      const { data: dbData, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, current_period_end, stripe_subscription_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (dbError && dbError.code !== 'PGRST116') {
        console.error("Database subscription error:", dbError);
      }

      // User is premium if they have gold or platinum plan with active status
      const isSubscribed = dbData?.status === 'active' && 
                         (dbData?.plan_type === 'gold' || dbData?.plan_type === 'platinum');
      
      setState({
        user,
        userTier: isSubscribed ? "premium" : "subscriber",
        isLoading: false,
        productId: dbData?.plan_type || null,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState({
        user,
        userTier: "subscriber",
        isLoading: false,
        productId: null,
      });
    }
  };

  const canAccessContent = (contentType: string): boolean => {
    const { userTier } = state;

    if (userTier === "guest") {
      return contentType === "exercise-library" || contentType === "blog";
    }

    if (userTier === "subscriber") {
      return contentType === "free-workout" || 
             contentType === "free-program" || 
             contentType === "tool" || 
             contentType === "dashboard" ||
             contentType === "exercise-library" ||
             contentType === "blog";
    }

    return true;
  };

  const canInteract = (contentType: string): boolean => {
    const { userTier } = state;

    // Guests can't interact with anything
    if (userTier === "guest") return false;

    // Premium users can interact with ALL content (free and premium)
    if (userTier === "premium") return true;

    // Subscribers can only interact with free content
    if (userTier === "subscriber") {
      return contentType === "free-workout" || contentType === "free-program";
    }

    return false;
  };

  return (
    <AccessControlContext.Provider value={{
      ...state,
      canAccessContent,
      canInteract,
      refreshAccess: checkAccess,
    }}>
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (context === undefined) {
    throw new Error("useAccessControl must be used within AccessControlProvider");
  }
  return context;
};
