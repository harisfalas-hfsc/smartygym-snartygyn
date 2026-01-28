import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HeartPulse, AlertTriangle, ExternalLink } from "lucide-react";

interface ParQReminderModalProps {
  open: boolean;
  onClose: (dontShowAgain?: boolean) => void;
}

export const ParQReminderModal = ({ open, onClose }: ParQReminderModalProps) => {
  const navigate = useNavigate();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleGoToParQ = () => {
    onClose(dontShowAgain);
    navigate("/disclaimer#parq");
  };

  const handleLater = () => {
    onClose(dontShowAgain);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose(dontShowAgain)}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 bg-destructive/10 rounded-full flex-shrink-0">
              <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg sm:text-xl leading-tight">Complete Your Health Assessment</DialogTitle>
          </div>
          <DialogDescription asChild>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-destructive">
                  For your safety, completing the PAR-Q test is <strong>mandatory</strong> before starting any workout program.
                </p>
              </div>

              <p className="text-muted-foreground">
                The <strong>PAR-Q (Physical Activity Readiness Questionnaire)</strong> helps identify any health conditions 
                that may require medical clearance before exercising. It only takes 2 minutes to complete.
              </p>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Why is this important?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Ensures you exercise safely</li>
                  <li>✓ Identifies potential health risks</li>
                  <li>✓ Helps customize your fitness journey</li>
                  <li>✓ Required for liability purposes</li>
                </ul>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col gap-3 sm:gap-4 sm:flex-col">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleLater}
              className="flex-1 text-sm sm:text-base py-2"
            >
              Remind Me Later
            </Button>
            <Button 
              onClick={handleGoToParQ}
              className="flex-1 bg-primary hover:bg-primary/90 text-sm sm:text-base py-2"
            >
              <HeartPulse className="mr-1.5 sm:mr-2 h-4 w-4" />
              Take PAR-Q Test
              <ExternalLink className="ml-1.5 sm:ml-2 h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex items-start sm:items-center gap-2 pt-2 border-t w-full justify-center">
            <Checkbox 
              id="dont-show-parq" 
              checked={dontShowAgain} 
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
              className="mt-0.5 sm:mt-0"
            />
            <Label 
              htmlFor="dont-show-parq" 
              className="text-xs text-muted-foreground cursor-pointer leading-tight"
            >
              I've already completed the PAR-Q test, don't show this again
            </Label>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
