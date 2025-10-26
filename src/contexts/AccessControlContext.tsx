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
    let timeoutId: NodeJS.Timeout;
    let mounted = true;
    
    const init = async () => {
      // Set timeout for loading check with better UX
      timeoutId = setTimeout(() => {
        if (mounted) {
          setState(prev => {
            if (prev.isLoading) {
              console.warn("Access control check timed out after 5s - defaulting to guest");
              return { 
                user: null,
                userTier: "guest",
                isLoading: false,
                productId: null
              };
            }
            return prev;
          });
        }
      }, 5000);
      
      await checkAccess();
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
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
      setState(prev => ({ ...prev, isLoading: true }));
      
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

    // Public content accessible to all
    if (contentType === "exercise-library" || contentType === "blog") {
      return true;
    }

    // Guests can only access public content
    if (userTier === "guest") {
      return false;
    }

    // Subscribers can access free content, tools, and dashboard
    if (userTier === "subscriber") {
      return contentType === "free-workout" || 
             contentType === "free-program" || 
             contentType === "tool" || 
             contentType === "calculator" ||
             contentType === "dashboard";
    }

    // Premium users can access everything
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
