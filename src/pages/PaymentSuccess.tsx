import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPurchase = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setVerifying(false);
        setVerified(true);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session");
        }

        const { error } = await supabase.functions.invoke('verify-purchase', {
          body: { sessionId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;
        setVerified(true);
      } catch (error) {
        console.error('Error verifying purchase:', error);
        toast({
          title: "Verification Warning",
          description: "Your purchase was successful but verification is pending. Please contact support if access is not granted within 24 hours.",
          variant: "destructive",
        });
        setVerified(true);
      } finally {
        setVerifying(false);
      }
    };

    verifyPurchase();
  }, [searchParams, toast]);

  return (
    <>
      <Helmet>
        <title>Payment Successful - Smarty Gym</title>
        <meta name="description" content="Your payment has been processed successfully" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        {verifying ? (
          <Card className="max-w-2xl w-full">
            <CardContent className="py-12 text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground">Verifying your purchase...</p>
              <p className="text-sm text-muted-foreground">Please wait while we confirm your order</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl">Payment Successful!</CardTitle>
              <CardDescription className="text-lg">
                Thank you for your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your payment has been processed successfully. {verified && "Your purchase has been added to your account."}
              </p>
              <p className="text-muted-foreground">
                If you purchased a personal training program, Haris Falas will contact you within 24-48 hours to discuss your customized program.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button onClick={() => navigate("/userdashboard")}>
                  View My Purchases
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default PaymentSuccess;
