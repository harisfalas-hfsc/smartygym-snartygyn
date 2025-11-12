import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";
import { PurchaseButton } from "@/components/PurchaseButton";

interface AccessGateProps {
  children: ReactNode;
  requireAuth?: boolean;
  requirePremium?: boolean;
  contentType?: "workout" | "program" | "feature";
  contentId?: string;
  contentName?: string;
  price?: number;
  stripePriceId?: string;
  stripeProductId?: string;
}

export const AccessGate = ({ 
  children, 
  requireAuth = false, 
  requirePremium = false,
  contentType = "feature",
  contentId,
  contentName,
  price,
  stripePriceId,
  stripeProductId
}: AccessGateProps) => {
  const { user, userTier, isLoading, hasPurchased } = useAccessControl();
  const navigate = useNavigate();

  // FREE CONTENT: Skip all checks if not premium required
  if (!requirePremium) {
    // Only check if auth is required
    if (requireAuth && !user && !isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full border-2 border-primary/30">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Login Required</h2>
              <p className="text-muted-foreground">
                Please log in or create an account to access {contentType === "workout" ? "workouts" : contentType === "program" ? "training programs" : "this content"}.
              </p>
              <div className="space-y-2 pt-4">
                <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Log In / Sign Up
                </Button>
                <Button 
                  onClick={() => navigate(-1)} 
                  variant="outline" 
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    // Free content - show immediately
    return <>{children}</>;
  }

  // PREMIUM CONTENT: Show loading only for premium checks
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Check if guest trying to access auth-required content
  if (requireAuth && userTier === "guest") {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full border-2 border-primary/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Lock className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Login Required</h2>
            <p className="text-muted-foreground">
              Please log in or create an account to access {contentType === "workout" ? "workouts" : contentType === "program" ? "training programs" : "this content"}.
            </p>
            <div className="space-y-2 pt-4">
              <Button onClick={() => navigate("/auth")} className="w-full" size="lg">
                <Lock className="w-4 h-4 mr-2" />
                Log In / Sign Up
              </Button>
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if subscriber trying to access premium content
  if (requirePremium && userTier === "subscriber") {
    // Check if user has purchased this specific content
    const hasPurchasedContent = contentId && hasPurchased(contentId, contentType);
    
    if (hasPurchasedContent) {
      // User has purchased this content individually - grant access
      return <>{children}</>;
    }
    
    // Check if this content is available for standalone purchase
    const isStandalonePurchase = price && price > 0 && stripePriceId && stripeProductId;
    
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full border-2 border-primary/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Crown className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Premium Content</h2>
            <p className="text-muted-foreground">
              This {contentType} is available to Gold and Platinum subscribers.
              {isStandalonePurchase && " You can also purchase it individually."}
            </p>
            <div className="space-y-2 pt-4">
              {isStandalonePurchase && contentId && contentName && contentType !== "feature" && (
                <PurchaseButton
                  contentId={contentId}
                  contentType={contentType as "workout" | "program"}
                  contentName={contentName}
                  price={price!}
                  stripePriceId={stripePriceId}
                  stripeProductId={stripeProductId}
                />
              )}
              <Button onClick={() => navigate("/premiumbenefits")} className="w-full" size="lg" variant={isStandalonePurchase ? "outline" : "default"}>
                <Crown className="w-4 h-4 mr-2" />
                View Premium Plans
              </Button>
              <Button 
                onClick={() => navigate(-1)} 
                variant="outline" 
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
