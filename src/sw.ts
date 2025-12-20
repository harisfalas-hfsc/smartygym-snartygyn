/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'smarty-gym-v1';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker: Installed');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'Smarty Gym',
    body: 'You have a new notification',
    icon: '/smarty-gym-logo.png',
    badge: '/smarty-gym-logo.png',
    tag: 'smarty-gym-notification',
    requireInteraction: false,
    data: {
      url: '/'
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
        data: payload.data || notificationData.data
      };
    } catch (err) {
      console.error('[SW] Error parsing push payload:', err);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname) && 'focus' in client) {
            // Send message to client to refresh session
            client.postMessage({
              type: 'REFRESH_SESSION',
              timestamp: Date.now()
            });
            console.log('[SW] Sent REFRESH_SESSION message to client');
            return client.focus();
          }
        }
        
        // If no window is open, open a new one with session refresh flag
        if (self.clients.openWindow) {
          const fullUrl = new URL(urlToOpen, self.location.origin);
          fullUrl.searchParams.set('refresh_session', 'true');
          console.log('[SW] Opening new window with session refresh:', fullUrl.toString());
          return self.clients.openWindow(fullUrl.toString());
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
});
