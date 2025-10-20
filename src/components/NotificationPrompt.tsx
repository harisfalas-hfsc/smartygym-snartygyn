import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const NotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already asked or granted
    const hasAsked = localStorage.getItem("notification-asked");
    
    if (!hasAsked && "Notification" in window && Notification.permission === "default") {
      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }
  }, []);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      localStorage.setItem("notification-asked", "true");
      
      if (permission === "granted") {
        toast({
          title: "Notifications enabled",
          description: "You'll receive updates about new workouts and articles!",
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("notification-asked", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-in-right">
      <Card className="p-4 shadow-lg border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Get notified about new workouts, articles, and fitness tips!
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAllow}>
                Allow
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Not Now
              </Button>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
