import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const PremiumPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Show popup after 25 seconds
    const timer = setTimeout(() => {
      // Check if user has seen popup in this session
      const hasSeenPopup = sessionStorage.getItem("smarty-gym-popup-seen");
      if (!hasSeenPopup) {
        setIsOpen(true);
        sessionStorage.setItem("smarty-gym-popup-seen", "true");
      }
    }, 25000);

    return () => clearTimeout(timer);
  }, []);

  const handleJoinPremium = () => {
    setIsOpen(false);
    navigate("/auth");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Enjoying your workout?</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Unlock 100+ programs and tools with Smarty Gym Premium.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleJoinPremium} size="lg" className="w-full">
            Join Premium
          </Button>
          <Button onClick={() => setIsOpen(false)} variant="outline" size="lg" className="w-full">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
