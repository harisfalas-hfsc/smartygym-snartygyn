import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";


const NewsletterThankYou = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Welcome to Smarty Gym | smartygym.com</title>
        <meta name="description" content="Thank you for joining Smarty Gym. Check your email for your first free workout." />
        <link rel="canonical" href="https://smartygym.com/newsletter-thank-you" />
      </Helmet>
      
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="container mx-auto max-w-lg">
          <PageBreadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Newsletter" }
          ]} />
        </div>
        
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
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
          </div>
        </Card>
        </div>
      </div>
    </>
  );
};

export default NewsletterThankYou;
