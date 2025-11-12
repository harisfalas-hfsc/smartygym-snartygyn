import { supabase } from "@/integrations/supabase/client";

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Check if notifications are supported and enabled
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Send a test notification
 */
export const sendTestNotification = async (title: string, body: string) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(title, {
    body,
    icon: '/smarty-gym-logo.png',
    badge: '/smarty-gym-logo.png',
    data: {
      url: window.location.origin
    }
  } as NotificationOptions);
};

/**
 * Send push notification via backend
 */
export const sendPushNotification = async (
  userId: string | string[],
  title: string,
  body: string,
  url?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: Array.isArray(userId) ? undefined : userId,
        userIds: Array.isArray(userId) ? userId : undefined,
        title,
        body,
        url: url || '/',
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};
