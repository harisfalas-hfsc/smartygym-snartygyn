import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Crown, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SubscriptionGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAuthenticated: boolean;
}

export const SubscriptionGate = ({ open, onOpenChange, isAuthenticated }: SubscriptionGateProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              {isAuthenticated ? (
                <Crown className="w-8 h-8 text-primary" />
              ) : (
                <Lock className="w-8 h-8 text-primary" />
              )}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            {isAuthenticated ? "Upgrade to Premium" : "Log In or Sign Up"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isAuthenticated 
              ? "Subscribe to access premium workouts and training programs"
              : "Log in or create an account to access this workout and training program"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Personalized Workout Plans</p>
              <p className="text-sm text-muted-foreground">Expert-designed routines tailored to your goals</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Custom Training Programs</p>
              <p className="text-sm text-muted-foreground">Multi-week programs with progressive overload</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Nutrition Plans</p>
              <p className="text-sm text-muted-foreground">Customized meal plans with macro breakdowns</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Exercise Video Library</p>
              <p className="text-sm text-muted-foreground">Demonstration videos for every exercise</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {!isAuthenticated ? (
            <>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full"
                size="lg"
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In / Sign Up
              </Button>
              <Button 
                onClick={() => onOpenChange(false)} 
                variant="outline"
                className="w-full"
              >
                Continue Browsing
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  navigate('/');
                }} 
                className="w-full"
                size="lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                View Pricing Plans
              </Button>
              <Button 
                onClick={() => onOpenChange(false)} 
                variant="outline"
                className="w-full"
              >
                Maybe Later
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};