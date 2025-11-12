import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { isNotificationSupported, registerServiceWorker } from "@/utils/notificationUtils";

export const NotificationPrompt = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, []);

  const checkIfShouldShow = async () => {
    // Don't show if already dismissed in this session
    if (dismissed) return;

    // Don't show if not supported
    if (!isNotificationSupported()) return;

    // Don't show if already granted or denied
    if ('Notification' in window && Notification.permission !== 'default') return;

    // Check if dismissed before (localStorage)
    const dismissedBefore = localStorage.getItem('notification-prompt-dismissed');
    if (dismissedBefore) return;

    // Show after 5 seconds
    setTimeout(() => {
      setShow(true);
    }, 5000);
  };

  const handleEnable = async () => {
    try {
      await registerServiceWorker();
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setShow(false);
        setDismissed(true);
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-fade-in">
      <Card className="border-2 border-primary shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary shrink-0" />
              <h3 className="font-semibold text-sm sm:text-base">Stay Updated</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Enable notifications to receive instant updates about your messages, workouts, and training programs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleEnable} 
              className="flex-1 text-xs sm:text-sm"
            >
              Enable Notifications
            </Button>
            <Button 
              onClick={handleDismiss} 
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
