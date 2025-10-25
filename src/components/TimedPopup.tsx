import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";

export const TimedPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { userTier } = useAccessControl();
  const isPremium = userTier === "premium";

  useEffect(() => {
    // Don't show popup to premium users
    if (isPremium) return;
    
    // Show popup after 27 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 27000);

    return () => clearTimeout(timer);
  }, [isPremium]);

  const handleJoinPremium = () => {
    setIsOpen(false);
    navigate("/premiumbenefits");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader>
          <DialogTitle className="text-xl">Enjoying your free workouts?</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get full access to all programs, tools, and exclusive content with Smarty Gym Premium.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleJoinPremium} size="lg" className="w-full">
            Join Premium
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="ghost" size="sm">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
