import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Crown, Sparkles, Check, X } from "lucide-react";

interface FirstSubscriptionPromoModalProps {
  open: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export const FirstSubscriptionPromoModal = ({ open, onClose }: FirstSubscriptionPromoModalProps) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
  };

  const handleClaimDiscount = () => {
    onClose(false);
    navigate('/joinpremium?discount=first35');
  };

  // Original prices
  const goldOriginal = 9.99;
  const platinumOriginal = 89.99;
  
  // Discounted prices (35% off)
  const goldDiscounted = (goldOriginal * 0.65).toFixed(2);
  const platinumDiscounted = (platinumOriginal * 0.65).toFixed(2);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-4 sm:p-6 pb-4 rounded-t-lg">
          {/* Custom close button */}
          <button 
            onClick={handleClose}
            className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-lg animate-pulse" />
                <div className="relative bg-primary/10 p-3 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Welcome Gift: 35% Off!
              </span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground text-sm mt-2">
            First-time subscriber? Claim your exclusive discount on any plan!
          </p>
        </div>

        {/* Plan cards */}
        <div className="p-6 space-y-4">
          {/* Gold Plan */}
          <div className="relative border-2 border-[#D4AF37] rounded-lg p-4 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#D4AF37]/10 rounded-full">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#D4AF37]">Gold Plan</h3>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground line-through">€{goldOriginal}</p>
                <p className="text-xl font-bold text-[#D4AF37]">€{goldDiscounted}</p>
                <p className="text-xs text-muted-foreground">/month</p>
              </div>
            </div>
          </div>

          {/* Platinum Plan */}
          <div className="relative border-2 border-[#A8A9AD] rounded-lg p-4 bg-gradient-to-r from-[#A8A9AD]/5 to-transparent">
            <div className="absolute -top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              BEST VALUE
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A8A9AD]/10 rounded-full">
                  <Crown className="h-5 w-5 text-[#A8A9AD]" />
                </div>
                <div>
                  <h3 className="font-bold text-[#A8A9AD]">Platinum Plan</h3>
                  <p className="text-xs text-muted-foreground">Yearly</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground line-through">€{platinumOriginal}</p>
                <p className="text-xl font-bold text-[#A8A9AD]">€{platinumDiscounted}</p>
                <p className="text-xs text-muted-foreground">/year</p>
              </div>
            </div>
          </div>

          {/* Benefits reminder */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground mb-2">What you'll unlock:</p>
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500 shrink-0" />
              <span className="text-xs">Unlimited workouts & programs</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500 shrink-0" />
              <span className="text-xs">Daily Smarty Rituals & Check-ins</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500 shrink-0" />
              <span className="text-xs">All fitness calculators & tools</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleClaimDiscount}
              className="w-full py-6 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Gift className="mr-2 h-5 w-5" />
              Claim Your 35% Discount
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Maybe Later
            </Button>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Checkbox
              id="dontShowPromo"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dontShowPromo"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Don't show this again today
            </label>
          </div>

          {/* Discount note */}
          <p className="text-center text-xs text-muted-foreground">
            * 35% discount applies to your first billing cycle
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
