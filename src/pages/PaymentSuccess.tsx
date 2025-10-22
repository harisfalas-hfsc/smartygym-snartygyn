import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Payment Successful - Smarty Gym</title>
        <meta name="description" content="Your payment has been processed successfully" />
      </Helmet>

      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
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
              Your payment has been processed successfully. You will receive a confirmation email shortly.
            </p>
            <p className="text-muted-foreground">
              If you purchased a personal training program, Haris Falas will contact you within 24-48 hours to discuss your customized program.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button onClick={() => navigate("/")}>
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate("/userdashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PaymentSuccess;
