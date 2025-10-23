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
        // Clear cache on logout
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('subscription_')) {
            sessionStorage.removeItem(key);
          }
        });
        
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
      // First, try to get from session storage for instant access
      const cachedData = sessionStorage.getItem(`subscription_${user.id}`);
      if (cachedData) {
        const cached = JSON.parse(cachedData);
        const cacheAge = Date.now() - cached.timestamp;
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          setState({
            user,
            userTier: cached.isSubscribed ? "premium" : "subscriber",
            isLoading: false,
            productId: cached.productId,
          });
          return;
        }
      }

      // Check database first (much faster than Stripe API)
      const { data: dbData, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('plan_type, status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!dbError && dbData) {
        const isSubscribed = dbData.status === 'active' && 
                           (dbData.plan_type === 'gold' || dbData.plan_type === 'platinum');
        
        // Check if subscription end date is in the future
        const isValid = !dbData.current_period_end || 
                       new Date(dbData.current_period_end) > new Date();

        if (isValid) {
          const tierData = {
            user,
            userTier: (isSubscribed ? "premium" : "subscriber") as UserTier,
            isLoading: false,
            productId: dbData.plan_type,
          };
          
          setState(tierData);
          
          // Cache in session storage
          sessionStorage.setItem(`subscription_${user.id}`, JSON.stringify({
            isSubscribed,
            productId: dbData.plan_type,
            timestamp: Date.now()
          }));
          
          return;
        }
      }

      // Only call Stripe API if database check failed or data is stale
      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) throw error;

      const isSubscribed = data?.subscribed || false;
      const productId = data?.product_id || data?.plan_type || null;

      const tierData = {
        user,
        userTier: (isSubscribed ? "premium" : "subscriber") as UserTier,
        isLoading: false,
        productId,
      };

      setState(tierData);
      
      // Cache the result
      sessionStorage.setItem(`subscription_${user.id}`, JSON.stringify({
        isSubscribed,
        productId,
        timestamp: Date.now()
      }));
      
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
             contentType === "community" ||
             contentType === "exercise-library" ||
             contentType === "blog";
    }

    return true;
  };

  const canInteract = (contentType: string): boolean => {
    const { userTier } = state;

    if (userTier === "guest") return false;

    if (userTier === "subscriber") {
      return contentType === "free-workout" || contentType === "free-program";
    }

    return true;
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
