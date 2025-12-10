import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, ClipboardCheck, Sun, Moon, Sunrise, Activity, TrendingUp, X } from "lucide-react";

interface RitualCheckinsAnnouncementModalProps {
  open: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export const RitualCheckinsAnnouncementModal = ({ open, onClose }: RitualCheckinsAnnouncementModalProps) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    onClose(dontShowAgain);
    setDontShowAgain(false);
  };

  const handleRitualClick = () => {
    handleClose();
    navigate("/daily-ritual");
  };

  const handleCheckinsClick = () => {
    handleClose();
    navigate("/userdashboard?tab=checkins");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg border-2 border-primary/60 bg-gradient-to-br from-primary/5 via-background to-primary/5 shadow-[0_0_40px_rgba(212,175,55,0.15)] p-0 gap-0 animate-scale-in">
        {/* Header */}
        <div className="relative p-4 pb-2">
          {/* Close button */}
          <button 
            onClick={handleClose}
            className="absolute right-3 top-3 p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-primary/10 flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              ✨ Elevate Your Daily Routine!
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              Maximize your wellness with <span className="text-primary font-semibold">SmartyGym's</span> daily rituals and smart check-ins
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Smarty Ritual Card */}
            <div 
              className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-purple-500/40 cursor-pointer hover:border-purple-500 hover:scale-[1.02] transition-all shadow-md group"
              onClick={handleRitualClick}
            >
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-purple-500 transition-colors">
                Smarty Ritual
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Your daily movement ritual for optimal performance
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                  <Sunrise className="w-3 h-3" /> Morning
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                  <Sun className="w-3 h-3" /> Midday
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                  <Moon className="w-3 h-3" /> Evening
                </span>
              </div>
            </div>

            {/* Smarty Check-ins Card */}
            <div 
              className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-green-500/40 cursor-pointer hover:border-green-500 hover:scale-[1.02] transition-all shadow-md group"
              onClick={handleCheckinsClick}
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="w-5 h-5 text-green-500" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-2 group-hover:text-green-500 transition-colors">
                Smarty Check-ins
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Track your readiness, soreness, and daily scores
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full">
                  <Activity className="w-3 h-3" /> Readiness
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" /> Score
                </span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleRitualClick}
              variant="outline"
              className="border-purple-500/40 hover:bg-purple-500/10 hover:border-purple-500"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
              View Ritual
            </Button>
            <Button 
              onClick={handleCheckinsClick}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Check-in Now
            </Button>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center gap-2 justify-center mt-3 pt-3 border-t border-green-500/20">
            <Checkbox 
              id="dont-show-ritual" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="border-green-500/50 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <label htmlFor="dont-show-ritual" className="text-xs text-muted-foreground cursor-pointer">
              Don't show again today
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
