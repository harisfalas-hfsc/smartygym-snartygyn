// Service Worker for Push Notifications
const CACHE_NAME = 'smarty-gym-v1';

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    clients.claim()
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
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
      console.error('Error parsing push payload:', err);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      vibrate: [200, 100, 200]
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(new URL(urlToOpen, self.location.origin).pathname) && 'focus' in client) {
            // Send message to client to refresh session
            client.postMessage({
              type: 'REFRESH_SESSION',
              timestamp: Date.now()
            });
            console.log('Sent REFRESH_SESSION message to client');
            return client.focus();
          }
        }
        
        // If no window is open, open a new one with session refresh flag
        if (clients.openWindow) {
          const fullUrl = new URL(urlToOpen, self.location.origin);
          fullUrl.searchParams.set('refresh_session', 'true');
          console.log('Opening new window with session refresh:', fullUrl.toString());
          return clients.openWindow(fullUrl.toString());
        }
      })
  );
});

// Handle background sync (optional)
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
});
