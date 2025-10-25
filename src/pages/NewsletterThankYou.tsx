import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";

const NewsletterThankYou = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Welcome to Smarty Gym | smartygym.com</title>
        <meta name="description" content="Thank you for joining Smarty Gym. Check your email for your first free workout." />
        <link rel="canonical" href="https://smartygym.com/newsletter-thank-you" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-lg w-full p-8 text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold">Welcome to Smarty Gym!</h1>
          
          <p className="text-muted-foreground text-lg">
            Check your email for your first free workout and exclusive training tips.
          </p>
          
          <div className="pt-4 space-y-3">
            <Button onClick={() => navigate("/workout")} size="lg" className="w-full">
              Explore Workouts
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" size="lg" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default NewsletterThankYou;
