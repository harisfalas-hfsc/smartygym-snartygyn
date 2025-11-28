import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export type UserTier = "guest" | "subscriber" | "premium";

interface AccessControlState {
  user: User | null;
  userTier: UserTier;
  isLoading: boolean;
  productId: string | null;
  purchasedContent: Set<string>;
}

interface AccessControlContextType extends AccessControlState {
  canAccessContent: (contentType: string, contentId?: string) => boolean;
  canInteract: (contentType: string, contentId?: string) => boolean;
  hasPurchased: (contentId: string, contentType: string) => boolean;
  refreshAccess: () => Promise<void>;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

export const AccessControlProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AccessControlState>({
    user: null,
    userTier: "guest",
    isLoading: true,
    productId: null,
    purchasedContent: new Set(),
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
                productId: null,
                purchasedContent: new Set(),
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
      (_event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          // Defer Supabase calls to prevent deadlock
          setTimeout(() => {
            if (mounted) {
              checkSubscription(session.user);
            }
          }, 0);
        } else {
          setState({
            user: null,
            userTier: "guest",
            isLoading: false,
            productId: null,
            purchasedContent: new Set(),
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
          purchasedContent: new Set(),
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
        purchasedContent: new Set(),
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

      // Fetch purchased content (only valid, non-deleted content)
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('content_id, content_type')
        .eq('user_id', user.id)
        .eq('content_deleted', false);

      const purchasedContent = new Set(
        purchases?.map(p => `${p.content_type}:${p.content_id}`) || []
      );

      // User is premium if they have gold or platinum plan with active status
      const isSubscribed = dbData?.status === 'active' && 
                         (dbData?.plan_type === 'gold' || dbData?.plan_type === 'platinum');
      
      setState({
        user,
        userTier: isSubscribed ? "premium" : "subscriber",
        isLoading: false,
        productId: dbData?.plan_type || null,
        purchasedContent,
      });
    } catch (error) {
      console.error("Error checking subscription:", error);
      setState({
        user,
        userTier: "subscriber",
        isLoading: false,
        productId: null,
        purchasedContent: new Set(),
      });
    }
  };

  const canAccessContent = (contentType: string, contentId?: string): boolean => {
    const { userTier, purchasedContent } = state;

    // Public content accessible to all
    if (contentType === "exercise-library" || contentType === "blog" || contentType === "article") {
      return true;
    }

    // Guests can only access public content
    if (userTier === "guest") {
      return false;
    }

    // Check if content was individually purchased
    if (contentId && purchasedContent.has(`${contentType}:${contentId}`)) {
      return true;
    }

    // Premium users can access everything
    if (userTier === "premium") {
      return true;
    }

    // Subscribers can access free content, tools, and dashboard
    // NOTE: For workouts and programs, database verification happens at the component level
    // via AccessGate which checks the actual is_premium flag from the database
    if (userTier === "subscriber") {
      return contentType === "tool" || 
             contentType === "calculator" ||
             contentType === "dashboard" ||
             contentType === "workout" ||
             contentType === "program";
    }

    return false;
  };

  const hasPurchased = (contentId: string, contentType: string): boolean => {
    return state.purchasedContent.has(`${contentType}:${contentId}`);
  };

  const canInteract = (contentType: string, contentId?: string): boolean => {
    const { userTier, purchasedContent } = state;

    // Guests can't interact with anything
    if (userTier === "guest") return false;

    // Premium users can interact with ALL content (free and premium)
    if (userTier === "premium") return true;

    // Check if user purchased this specific content
    if (contentId && purchasedContent.has(`${contentType}:${contentId}`)) {
      return true;
    }

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
      hasPurchased,
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
