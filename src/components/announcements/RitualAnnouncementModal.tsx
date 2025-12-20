import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Sun, Moon, Sunrise, X } from "lucide-react";

interface RitualAnnouncementModalProps {
  open: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export const RitualAnnouncementModal = ({ open, onClose }: RitualAnnouncementModalProps) => {
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-sm w-[95vw] sm:w-full max-h-[90vh] border-2 border-purple-500/60 bg-gradient-to-br from-purple-500/5 via-background to-purple-500/5 shadow-[0_0_40px_rgba(168,85,247,0.15)] p-0 gap-0 animate-scale-in overflow-hidden">
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
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mb-3">
              <Sparkles className="w-7 h-7 text-purple-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">
              ✨ Smarty Ritual
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your daily movement ritual for optimal performance & recovery
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Ritual Info Card */}
          <div className="bg-background/90 backdrop-blur-sm rounded-xl p-4 border border-purple-500/40 mb-4 shadow-md">
            <p className="text-sm text-muted-foreground mb-3">
              Three guided sessions throughout your day to keep you moving, energized, and ready for anything.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full">
                <Sunrise className="w-3.5 h-3.5" /> Morning
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full">
                <Sun className="w-3.5 h-3.5" /> Midday
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full">
                <Moon className="w-3.5 h-3.5" /> Evening
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={handleRitualClick}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Today's Ritual
          </Button>

          {/* Don't show again checkbox */}
          <div className="flex items-center gap-2 justify-center mt-3 pt-3 border-t border-purple-500/20">
            <Checkbox 
              id="dont-show-ritual" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="border-purple-500/50 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
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
