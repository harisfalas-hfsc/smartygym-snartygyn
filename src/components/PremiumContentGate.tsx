import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumContentGateProps {
  children: ReactNode;
}

export const PremiumContentGate = ({ children }: PremiumContentGateProps) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsSubscribed(false);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setIsSubscribed(data?.subscribed || false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to subscribe",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      navigate("/");
      toast({
        title: "Subscribe Now",
        description: "Please select a plan from the homepage to access premium content",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

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