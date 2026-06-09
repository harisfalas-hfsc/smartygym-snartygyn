import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAccessControl } from "@/hooks/useAccessControl";
import { useNavigate } from "react-router-dom";
import { isIOSNative } from "@/utils/platform";

interface PurchaseButtonProps {
  contentId: string;
  contentType: "workout" | "program";
  contentName: string;
  price: number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
}

export const PurchaseButton = ({
  contentId,
  contentType,
  contentName,
  price,
  stripeProductId,
  stripePriceId,
}: PurchaseButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, hasPurchased, userTier } = useAccessControl();
  const navigate = useNavigate();

  // Check if already purchased
  const alreadyPurchased = hasPurchased(contentId, contentType);
  
  // NEW: Check if user is premium (cannot purchase)
  const isPremium = userTier === "premium";

  // Apple Guideline 3.1.1: hide external payment CTAs in the iOS native app
  if (isIOSNative()) {
    return null;
  }

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase content.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-individual-purchase-checkout",
        {
          body: {
            contentId,
            contentType,
            contentName,
            price,
            stripeProductId,
            stripePriceId,
            cancelPath: window.location.pathname + window.location.search,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Error",
        description: "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 🚨 CRITICAL: Premium users cannot purchase standalone content
  if (isPremium) {
    return (
      <Button disabled className="w-full" variant="outline">
        ✓ Included in Your Premium Plan
      </Button>
    );
  }

  if (alreadyPurchased) {
    return (
      <Button disabled className="w-full">
        Already Purchased
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={isProcessing}
      className="w-full"
      size="lg"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase for €{price.toFixed(2)}
        </>
      )}
    </Button>
  );
};
