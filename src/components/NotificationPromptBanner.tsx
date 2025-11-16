import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, X } from "lucide-react";
import { isNotificationSupported, registerServiceWorker } from "@/utils/notificationUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const NotificationPromptBanner = () => {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkIfShouldShow();
  }, []);

  const checkIfShouldShow = async () => {
    console.log('[NotificationPromptBanner] Checking if should show prompt');
    
    if (dismissed) {
      console.log('[NotificationPromptBanner] Already dismissed this session');
      return;
    }

    if (!isNotificationSupported()) {
      console.log('[NotificationPromptBanner] Notifications not supported');
      return;
    }

    if ('Notification' in window && Notification.permission !== 'default') {
      console.log('[NotificationPromptBanner] Permission already decided:', Notification.permission);
      return;
    }

    // Check if already subscribed
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[NotificationPromptBanner] No authenticated user');
        return;
      }

      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('is_active')
        .eq('user_id', user.id)
        .maybeSingle();

      if (subscription?.is_active) {
        console.log('[NotificationPromptBanner] User already has active subscription');
        return;
      }
    } catch (error) {
      console.error('[NotificationPromptBanner] Error checking subscription:', error);
    }

    // Check if dismissed before (localStorage)
    const dismissedBefore = localStorage.getItem('notification-prompt-dismissed');
    const dismissedTime = dismissedBefore ? parseInt(dismissedBefore) : 0;
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    if (dismissedTime > sevenDaysAgo) {
      console.log('[NotificationPromptBanner] Dismissed within last 7 days');
      return;
    }

    console.log('[NotificationPromptBanner] Showing banner');
    setShow(true);
  };

  const handleEnable = async () => {
    console.log('[NotificationPromptBanner] User clicked enable');
    try {
      await registerServiceWorker();
      const permission = await Notification.requestPermission();
      console.log('[NotificationPromptBanner] Permission result:', permission);
      
      if (permission === 'granted') {
        toast.success("Notifications enabled! You'll receive updates instantly.");
        setShow(false);
        setDismissed(true);
      } else {
        toast.error("Notification permission denied. You can enable it later in your browser settings.");
      }
    } catch (error) {
      console.error('[NotificationPromptBanner] Error enabling notifications:', error);
      toast.error("Failed to enable notifications. Please try again.");
    }
  };

  const handleDismiss = () => {
    console.log('[NotificationPromptBanner] User dismissed banner');
    setShow(false);
    setDismissed(true);
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  if (!show) return null;

  return (
    <Card className="mb-6 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <div className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="p-3 rounded-full bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">Stay Connected with Your Fitness Journey</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enable notifications to receive instant updates when your coach responds, new workouts are added, 
              and important account updates. You'll never miss a beat!
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleEnable} size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Enable Notifications
              </Button>
              <Button onClick={handleDismiss} variant="outline" size="sm">
                Maybe Later
              </Button>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
