import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useAccessControl } from "@/hooks/useAccessControl";

interface PremiumContentGateProps {
  children: ReactNode;
}

export const PremiumContentGate = ({ children }: PremiumContentGateProps) => {
  const { userTier, isLoading } = useAccessControl();
  const navigate = useNavigate();
  const isSubscribed = userTier === "premium";

  const handleSubscribe = () => {
    if (userTier === "guest") {
      navigate("/auth");
    } else {
      navigate("/premiumbenefits");
    }
  };

  // Add timeout to prevent infinite loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying your access...</p>
          <p className="mt-2 text-sm text-muted-foreground">This should only take a moment</p>
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="max-w-md w-full border-2 border-primary/30">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Lock className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">
              {isLoading ? "Checking Access..." : "Premium Content"}
            </h2>
            <p className="text-muted-foreground">
              {isLoading 
                ? "Please wait while we verify your subscription..."
                : "This workout/program is available exclusively to Gold and Platinum subscribers. Subscribe now to unlock all premium workouts and training programs!"}
            </p>
            {!isLoading && (
              <div className="space-y-2 pt-4">
                <Button onClick={handleSubscribe} className="w-full" size="lg">
                  View Subscription Plans
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  variant="outline" 
                  className="w-full"
                >
                  Back to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};