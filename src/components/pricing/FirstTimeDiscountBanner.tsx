import { useSearchParams, useLocation } from "react-router-dom";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFirstSubscriptionPromoEligibility } from "@/hooks/useFirstSubscriptionPromoEligibility";
import { useState } from "react";

export const FirstTimeDiscountBanner = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isEligible, isLoading, user } = useFirstSubscriptionPromoEligibility();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if discount is already applied via URL
  const isDiscountAlreadyApplied = searchParams.get('discount') === 'first35';

  // Show for visitors (user === null) OR logged-in eligible users
  const isVisitor = user === null;
  const shouldShow = isVisitor || isEligible;

  console.log('[FirstTimeDiscountBanner] Render check:', {
    isLoading,
    isVisitor,
    isEligible,
    shouldShow,
    isDiscountAlreadyApplied,
    isDismissed,
    userId: user?.id || 'visitor'
  });

  // Don't show if still loading (but only for logged-in users - visitors show immediately)
  if (isLoading && !isVisitor) {
    console.log('[FirstTimeDiscountBanner] Still loading for logged-in user, waiting...');
    return null;
  }

  // Don't show if discount already applied or dismissed
  if (isDiscountAlreadyApplied || isDismissed) {
    console.log('[FirstTimeDiscountBanner] Hidden: discount applied or dismissed');
    return null;
  }

  if (!shouldShow) {
    console.log('[FirstTimeDiscountBanner] Hidden: not eligible');
    return null;
  }

  console.log('[FirstTimeDiscountBanner] RENDERING BANNER!');

  const handleClaimDiscount = () => {
    // Reload the page with the discount parameter
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('discount', 'first35');
    window.location.href = `${location.pathname}?${newSearchParams.toString()}`;
  };

  return (
    <>
      {/* Hidden SEO Schema for First-Time Discount - invisible to users */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Offer",
          "name": "First-Time Subscriber 35% Discount",
          "description": "New SmartyGym subscribers get 35% off their first billing cycle on Gold (€6.49) or Platinum (€58.49) plans",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "SmartyGym",
            "url": "https://smartygym.com"
          },
          "eligibleCustomerType": "https://schema.org/NewCustomer",
          "validFrom": "2025-01-01",
          "validThrough": "2026-12-31"
        })
      }} />
      
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
                {isVisitor && <span className="text-xs"> (log in at checkout)</span>}
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
    </>
  );
};
