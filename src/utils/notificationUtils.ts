import { supabase } from "@/integrations/supabase/client";

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[NotificationUtils] Service workers are not supported');
    return null;
  }

  try {
    console.log('[NotificationUtils] Registering service worker...');
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });
    
    console.log('[NotificationUtils] Service Worker registered successfully:', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting
    });
    return registration;
  } catch (error) {
    console.error('[NotificationUtils] Service Worker registration failed:', error);
    return null;
  }
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.error('[NotificationUtils] Notifications are not supported in this browser');
    throw new Error('Notifications are not supported in this browser');
  }

  console.log('[NotificationUtils] Requesting notification permission...');
  const permission = await Notification.requestPermission();
  console.log('[NotificationUtils] Notification permission result:', permission);
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
    console.error('[NotificationUtils] Notification permission not granted');
    throw new Error('Notification permission not granted');
  }

  console.log('[NotificationUtils] Sending test notification:', { title, body });
  const registration = await navigator.serviceWorker.ready;
  
  await registration.showNotification(title, {
    body,
    icon: '/smarty-gym-logo.png',
    badge: '/smarty-gym-logo.png',
    data: {
      url: window.location.origin
    }
  } as NotificationOptions);
  
  console.log('[NotificationUtils] Test notification sent successfully');
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
    console.log('[NotificationUtils] Sending push notification via edge function:', {
      userId: Array.isArray(userId) ? `${userId.length} users` : userId,
      title,
      body,
      url
    });

    const { data, error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId: Array.isArray(userId) ? undefined : userId,
        userIds: Array.isArray(userId) ? userId : undefined,
        title,
        body,
        url: url || '/',
      }
    });

    if (error) {
      console.error('[NotificationUtils] Error from edge function:', error);
      throw error;
    }

    console.log('[NotificationUtils] Push notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('[NotificationUtils] Error sending push notification:', error);
    throw error;
  }
};
