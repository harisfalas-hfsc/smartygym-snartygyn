import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface EligibilityResult {
  isEligible: boolean;
  isLoading: boolean;
  user: User | null;
}

/**
 * Hook to check if user is eligible for the first-time subscription discount.
 * A user is eligible if:
 * 1. They are logged in
 * 2. They have NEVER had a plan subscription (stripe_subscription_id is null)
 * 3. Their current plan_type is 'free' or they have no subscription record
 */
export const useFirstSubscriptionPromoEligibility = (): EligibilityResult => {
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          // Not logged in - not eligible for the popup (they need to be logged in first)
          setIsEligible(false);
          setIsLoading(false);
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
        // 2. They have a record but stripe_subscription_id is null AND plan_type is 'free'
        if (!data) {
          // No subscription record - they're eligible
          setIsEligible(true);
        } else if (data.stripe_subscription_id === null && data.plan_type === 'free') {
          // Has record but never subscribed to a plan
          setIsEligible(true);
        } else if (data.plan_type === 'gold' || data.plan_type === 'platinum') {
          // Already has an active plan subscription
          setIsEligible(false);
        } else {
          // Has had a subscription before (stripe_subscription_id is not null)
          setIsEligible(false);
        }

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

  return { isEligible, isLoading, user };
};
