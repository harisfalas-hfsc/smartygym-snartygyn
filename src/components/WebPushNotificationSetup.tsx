import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VAPID_PUBLIC_KEY = "BPOeA3m7ZLLZ3gwvMVPpU7t-0dUoH0YQ3F8CJ4j8d2YKxBgN9xQZY8P5U_g9M0XKm7zHvLJC1pwKL8yLH7kKH6o";

export const WebPushNotificationSetup = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    console.log("[WebPush] Starting notification status check...");
    
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("[WebPush] ❌ Browser does not support Notification API");
      return;
    }
    
    if (!("serviceWorker" in navigator)) {
      console.log("[WebPush] ❌ Browser does not support Service Workers");
      return;
    }
    
    console.log("[WebPush] ✅ Browser supports notifications and service workers");

    const permission = Notification.permission;
    setPermissionState(permission);
    console.log("[WebPush] Current permission state:", permission);

    // If permission already denied, don't show prompt
    if (permission === "denied") {
      console.log("[WebPush] ⚠️ Permission denied by user, not showing prompt");
      return;
    }

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log("[WebPush] ⚠️ No user logged in, not showing prompt");
      return;
    }
    console.log("[WebPush] ✅ User logged in:", user.id);

    // Check if already subscribed
    const { data: existingSubscription, error: subError } = await supabase
      .from("push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (subError) {
      console.log("[WebPush] ⚠️ Error checking subscription:", subError.message);
    }

    if (existingSubscription) {
      console.log("[WebPush] ✅ User already has active subscription:", existingSubscription.id);
      setIsSubscribed(true);
      return;
    }
    console.log("[WebPush] ℹ️ No active subscription found");

    // Show prompt if permission is default (not yet asked)
    if (permission === "default") {
      // Check if user dismissed prompt today
      const dismissedKey = `push_prompt_dismissed_${new Date().toISOString().split('T')[0]}`;
      if (localStorage.getItem(dismissedKey) === "true") {
        console.log("[WebPush] ⚠️ User dismissed prompt today, not showing");
        return;
      }
      
      console.log("[WebPush] ✅ Will show prompt in 5 seconds...");
      // Delay showing prompt
      setTimeout(() => {
        console.log("[WebPush] 🔔 Showing push notification prompt now");
        setShowPrompt(true);
      }, 5000);
    } else if (permission === "granted") {
      // Permission granted but no subscription - try to subscribe
      console.log("[WebPush] ℹ️ Permission granted but no subscription, will show prompt to complete setup");
      setTimeout(() => setShowPrompt(true), 5000);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    console.log("[WebPush] 🔔 User clicked Enable Notifications");
    
    try {
      // Register the custom push service worker first
      console.log("[WebPush] Registering custom service worker for push...");
      const swRegistration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      console.log("[WebPush] ✅ Custom service worker registered:", swRegistration.scope);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      console.log("[WebPush] ✅ Service worker is ready");
      
      // Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      console.log("[WebPush] Permission result:", permission);

      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setShowPrompt(false);
        return;
      }

      // Subscribe to push
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      const subscriptionJson = subscription.toJSON();
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to enable notifications");
        return;
      }

      // Save subscription to database
      const { error } = await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        endpoint: subscriptionJson.endpoint!,
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
        device_type: getDeviceType(),
        user_agent: navigator.userAgent,
        is_active: true,
      }, {
        onConflict: "user_id,endpoint",
      });

      if (error) {
        console.error("Error saving push subscription:", error);
        toast.error("Failed to enable notifications");
        return;
      }

      setIsSubscribed(true);
      setShowPrompt(false);
      toast.success("Notifications enabled! You'll be notified when you have new messages.");
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    const dismissedKey = `push_prompt_dismissed_${new Date().toISOString().split('T')[0]}`;
    localStorage.setItem(dismissedKey, "true");
    setShowPrompt(false);
  };

  if (!showPrompt || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
      <Card className="border-primary/40 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10 shrink-0">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1">Enable Notifications</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Get notified when you have new messages in your dashboard.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {isLoading ? "Enabling..." : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="text-xs"
                >
                  Not now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-full transition-colors shrink-0"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

// Helper function to detect device type
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Windows/.test(ua)) return "windows";
  if (/Mac/.test(ua)) return "mac";
  return "web";
}
