import { useSearchParams, useLocation } from "react-router-dom";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirstSubscriptionPromoEligibility } from "@/hooks/useFirstSubscriptionPromoEligibility";

/**
 * Inline callout to show below pricing cards for first-time discount.
 * Shows for visitors and logged-in eligible users.
 * Hides if discount is already applied or user is ineligible.
 */
export const FirstTimeDiscountInlineCallout = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isEligible, isLoading, user } = useFirstSubscriptionPromoEligibility();

  // Don't show if discount is already applied via URL
  const isDiscountAlreadyApplied = searchParams.get('discount') === 'first35';

  // Show for visitors (user === null) OR logged-in eligible users
  const isVisitor = user === null;
  const shouldShow = isVisitor || isEligible;

  console.log('[FirstTimeDiscountInlineCallout] Render check:', {
    isLoading,
    isVisitor,
    isEligible,
    shouldShow,
    isDiscountAlreadyApplied,
    userId: user?.id || 'visitor'
  });

  // Don't show if still loading (but only for logged-in users - visitors show immediately)
  if (isLoading && !isVisitor) {
    console.log('[FirstTimeDiscountInlineCallout] Still loading for logged-in user, waiting...');
    return null;
  }

  // Don't show if discount already applied
  if (isDiscountAlreadyApplied) {
    console.log('[FirstTimeDiscountInlineCallout] Hidden: discount already applied');
    return null;
  }

  if (!shouldShow) {
    console.log('[FirstTimeDiscountInlineCallout] Hidden: not eligible');
    return null;
  }

  console.log('[FirstTimeDiscountInlineCallout] RENDERING CALLOUT!');

  const handleApplyDiscount = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('discount', 'first35');
    window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
  };

  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/30 rounded-xl text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Gift className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-primary">
          First-Time Subscriber?
        </h3>
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      <p className="text-muted-foreground mb-4 max-w-lg mx-auto">
        Get <span className="font-bold text-primary text-lg">35% off</span> your first billing cycle! 
        This exclusive offer is only for new subscribers.
        {isVisitor && " Log in or sign up at checkout to claim."}
      </p>
      <Button
        onClick={handleApplyDiscount}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
      >
        <Gift className="h-5 w-5 mr-2" />
        Apply 35% Discount Now
      </Button>
    </div>
  );
};
