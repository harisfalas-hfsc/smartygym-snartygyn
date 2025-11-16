import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const PushNotificationSetup = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    console.log('[PushNotificationSetup] Checking notification status');
    
    if (!('Notification' in window)) {
      console.log('[PushNotificationSetup] Push notifications not supported');
      return;
    }

    const currentPermission = Notification.permission;
    console.log('[PushNotificationSetup] Current permission:', currentPermission);
    setPermission(currentPermission);

    // Verify service worker status
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        console.log('[PushNotificationSetup] Service Worker Status:', {
          registered: !!registration,
          active: registration?.active?.state,
          installing: registration?.installing?.state
        });
      } catch (err) {
        console.error('[PushNotificationSetup] Service Worker check failed:', err);
      }
    }

    // Verify VAPID key
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    console.log('[PushNotificationSetup] VAPID Key present:', !!vapidKey);

    if (currentPermission === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        const isSubscribed = !!subscription;
        console.log('[PushNotificationSetup] Subscription status:', {
          isSubscribed,
          endpoint: subscription?.endpoint
        });
        setSubscribed(isSubscribed);
      } catch (error) {
        console.error('[PushNotificationSetup] Error checking subscription:', error);
      }
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    console.log('[PushNotificationSetup] Starting push subscription process');
    setLoading(true);
    setError(null);
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.error('[PushNotificationSetup] Push notifications not supported');
        throw new Error('Push notifications are not supported in this browser');
      }

      // Request notification permission
      console.log('[PushNotificationSetup] Requesting permission...');
      const permission = await Notification.requestPermission();
      console.log('[PushNotificationSetup] Permission result:', permission);
      setPermission(permission);

      if (permission !== 'granted') {
        console.warn('[PushNotificationSetup] Permission denied');
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('Service worker not registered. Please refresh the page.');
      }

      console.log('[PushNotificationSetup] Service worker registration:', registration);

      // Get VAPID public key
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured. Please contact support.');
      }

      console.log('[PushNotificationSetup] VAPID key available:', !!vapidPublicKey);
      console.log('[PushNotificationSetup] Subscribing to push manager...');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('[PushNotificationSetup] Push subscription created:', subscription);

      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated. Please log in again.');
      }

      console.log('[PushNotificationSetup] Saving subscription to database for user:', user.id);
      const deviceType = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                       /Android/.test(navigator.userAgent) ? 'android' : 'desktop';
      
      const { error: upsertError } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_data: subscription.toJSON() as any,
          device_type: deviceType,
          browser_info: navigator.userAgent,
          is_active: true
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('[PushNotificationSetup] Error saving subscription:', upsertError);
        throw new Error(`Failed to save subscription: ${upsertError.message}`);
      }

      console.log('[PushNotificationSetup] Subscription saved successfully');

      // Update notification preferences
      await supabase
        .from('profiles')
        .update({
          notification_preferences: {
            email: true,
            push: true,
            new_messages: true,
            admin_responses: true,
            system_updates: false
          }
        })
        .eq('user_id', user.id);

      setSubscribed(true);
      
      toast({
        title: "Success!",
        description: "Notifications enabled successfully.",
      });
    } catch (error: any) {
      console.error('[PushNotificationSetup] Subscribe error:', error);
      const errorMsg = error.message || "Failed to enable notifications. Please try again.";
      setError(errorMsg);
      toast({
        title: "Error Enabling Notifications",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
        }

        // Remove from database
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id);

          // Update preferences
          await supabase
            .from('profiles')
            .update({
              notification_preferences: {
                email: true,
                push: false,
                new_messages: true,
                admin_responses: true,
                system_updates: false
              }
            })
            .eq('user_id', user.id);
        }

        setSubscribed(false);
        
        toast({
          title: "Notifications Disabled",
          description: "You will no longer receive push notifications",
        });
      }
    } catch (error: any) {
      console.error('Error unsubscribing from push:', error);
      toast({
        title: "Error",
        description: "Failed to disable notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!('Notification' in window)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Get instant notifications for messages and updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium">Browser Notifications</p>
              <p className="text-xs text-muted-foreground">
                {subscribed ? 'Notifications are enabled' : 'Enable to receive instant updates'}
              </p>
            </div>
            <Button
              onClick={subscribed ? unsubscribeFromPush : subscribeToPush}
              variant={subscribed ? "outline" : "default"}
              disabled={loading || permission === 'denied'}
              className="w-full sm:w-auto shrink-0 text-xs sm:text-sm"
            >
              {loading ? (
                <><Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" /> Processing...</>
              ) : subscribed ? (
                <><BellOff className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Disable</>
              ) : (
                <><Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-2" /> Enable</>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          {permission === 'denied' && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-xs text-destructive">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            </div>
          )}

          {permission === 'granted' && subscribed && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
              <p className="text-xs text-primary">
                ✓ You'll receive notifications for new messages and updates
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
