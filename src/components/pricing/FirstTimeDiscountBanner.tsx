import { useSearchParams, useLocation } from "react-router-dom";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirstSubscriptionPromoEligibility } from "@/hooks/useFirstSubscriptionPromoEligibility";
import { useState } from "react";

export const FirstTimeDiscountBanner = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isEligible, isLoading } = useFirstSubscriptionPromoEligibility();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if discount is already applied via URL
  const isDiscountAlreadyApplied = searchParams.get('discount') === 'first35';

  // Don't show if loading, not eligible, already applied, or dismissed
  if (isLoading || !isEligible || isDiscountAlreadyApplied || isDismissed) {
    return null;
  }

  const handleClaimDiscount = () => {
    // Reload the page with the discount parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('discount', 'first35');
    window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
  };

  return (
    <div className="mb-6 relative bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 border-2 border-primary/40 rounded-xl p-4 sm:p-5 shadow-lg">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-primary/20 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-full">
            <Gift className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-primary text-lg">
                First-Time Offer Available!
              </h3>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Get <span className="font-bold text-primary">35% off</span> your first subscription
            </p>
          </div>
        </div>

        <Button
          onClick={handleClaimDiscount}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap"
        >
          <Gift className="h-4 w-4 mr-2" />
          Claim Discount
        </Button>
      </div>
    </div>
  );
};
