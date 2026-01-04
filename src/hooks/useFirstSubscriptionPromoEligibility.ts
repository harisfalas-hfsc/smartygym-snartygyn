import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface EligibilityResult {
  isEligible: boolean;
  isLoading: boolean;
  user: User | null;
  isVisitor: boolean;
}

/**
 * Hook to check if user is eligible for the first-time subscription discount.
 * A user is eligible if:
 * 1. They are a visitor (not logged in) - we assume they might be eligible
 * 2. They are logged in AND have NEVER had a plan subscription (stripe_subscription_id is null)
 * 3. Their current plan_type is 'free' or null, or they have no subscription record
 * 
 * Returns:
 * - isEligible: true if eligible (visitors are treated as eligible)
 * - isLoading: true while checking
 * - user: the current user or null if visitor
 * - isVisitor: true if not logged in
 */
export const useFirstSubscriptionPromoEligibility = (): EligibilityResult => {
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  console.log('[PromoEligibility] Hook render:', { isEligible, isLoading, user: user?.id || 'visitor', isVisitor: user === null });

  useEffect(() => {
    const checkEligibility = async () => {
      console.log('[PromoEligibility] Starting eligibility check...');
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          // Visitor (not logged in) - treat as eligible for marketing purposes
          // They'll need to log in to actually use the discount
          setIsEligible(true);
          setIsLoading(false);
          console.log('[PromoEligibility] Visitor - treating as eligible');
          return;
        }

        // Check if user has ever had a plan subscription
        // If stripe_subscription_id exists, they've subscribed before
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('stripe_subscription_id, plan_type, status')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking subscription eligibility:', error);
          setIsEligible(false);
          setIsLoading(false);
          return;
        }

        // User is eligible if:
        // 1. No subscription record exists, OR
        // 2. They have a record but stripe_subscription_id is null AND (plan_type is 'free' or null)
        let eligible = false;
        if (!data) {
          // No subscription record - they're eligible
          eligible = true;
          console.log('[PromoEligibility] No subscription record - eligible');
        } else if (data.stripe_subscription_id === null && (data.plan_type === 'free' || data.plan_type === null)) {
          // Has record but never subscribed to a paid plan
          eligible = true;
          console.log('[PromoEligibility] Free/null plan, no stripe subscription - eligible');
        } else if (data.plan_type === 'gold' || data.plan_type === 'platinum') {
          // Already has an active paid plan subscription
          eligible = false;
          console.log('[PromoEligibility] Has active subscription - not eligible', { plan: data.plan_type });
        } else if (data.stripe_subscription_id !== null) {
          // Has had a subscription before (stripe_subscription_id exists)
          eligible = false;
          console.log('[PromoEligibility] Has previous subscription - not eligible', { stripe_id: data.stripe_subscription_id });
        } else {
          // Edge case: treat as eligible
          eligible = true;
          console.log('[PromoEligibility] Edge case - treating as eligible');
        }

        setIsEligible(eligible);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in eligibility check:', err);
        setIsEligible(false);
        setIsLoading(false);
      }
    };

    checkEligibility();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkEligibility();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isEligible, isLoading, user, isVisitor: user === null };
};
