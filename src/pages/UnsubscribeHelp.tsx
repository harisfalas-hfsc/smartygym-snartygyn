import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Mail, Settings, Bell, ToggleRight, ArrowRight, Home, LogIn } from "lucide-react";

const UnsubscribeHelp = () => {
  const steps = [
    {
      icon: LogIn,
      title: "Log in to your account",
      description: "Sign in to SmartyGym with your email and password"
    },
    {
      icon: Home,
      title: "Go to your Dashboard",
      description: "Navigate to your personal dashboard"
    },
    {
      icon: Mail,
      title: "Click on 'Messages'",
      description: "Find the Messages section in your dashboard"
    },
    {
      icon: Settings,
      title: "Go to 'Settings' tab",
      description: "Click on the Settings tab within Messages"
    },
    {
      icon: Bell,
      title: "Find 'Email Notifications'",
      description: "Locate the Email Notifications settings"
    },
    {
      icon: ToggleRight,
      title: "Toggle notifications On/Off",
      description: "Turn off any notifications you don't want to receive"
    }
  ];

  return (
    <>
      <Helmet>
        <title>Manage Email Preferences | SmartyGym</title>
        <meta name="description" content="Learn how to manage your email notification preferences on SmartyGym" />
      </Helmet>
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Manage Your Email Preferences</CardTitle>
            <p className="text-muted-foreground mt-2">
              Follow these simple steps to customize which emails you receive from SmartyGym
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <step.icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="font-medium text-foreground">{step.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link to="/userdashboard?tab=messages">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  Return to Homepage
                </Link>
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground pt-2">
              Need help? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UnsubscribeHelp;
