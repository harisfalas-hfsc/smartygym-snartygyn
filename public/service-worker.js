const CLEANUP_PARAM = "sw-cleanup";
const CLEANUP_VALUE = Date.now().toString();

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    const clients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });

    await Promise.all(clients.map((client) => {
      const url = new URL(client.url);

      if (url.searchParams.has(CLEANUP_PARAM)) {
        return Promise.resolve();
      }

      url.searchParams.set(CLEANUP_PARAM, CLEANUP_VALUE);
      return client.navigate(url.toString());
    }));

    await self.registration.unregister();
  })());
});
