I checked the live site and the code. The server is already sending the correct no-cache headers, so the main problem is not normal browser caching. The live site still has an active PWA service worker (`/sw.js`) that precaches the app shell and generated JS/CSS bundles. Once a browser has that worker installed, it can keep serving an old app version even after Publish/Update, especially across Safari/Chrome/Edge and installed PWA contexts.

The safest fix is to stop the old worker from controlling the app shell so aggressively, while keeping the installable PWA benefits as much as possible.

Plan:

1. Ship a one-release service-worker cleanup/kill-switch
   - Add static cleanup service workers at both likely paths: `/sw.js` and `/service-worker.js`.
   - On activation, they will:
     - take control immediately,
     - delete old Workbox/PWA caches,
     - navigate open tabs once with a small cleanup marker,
     - unregister themselves after cleanup.
   - This is important because simply changing or removing PWA code does not remove old service workers from browsers that already have them.

2. Keep installability, remove aggressive app-shell caching
   - Remove `vite-plugin-pwa` service worker generation from the build for now.
   - Keep PWA/mobile meta tags and add/use a manifest-only setup so users can still add SmartyGym to their home screen.
   - This avoids the stale-cache issue while preserving the main “app-like” install experience.
   - Offline caching of full app pages/workouts will be reduced temporarily, but this is the safer tradeoff to make updates reliable.

3. Add a normal static web manifest
   - Create `public/manifest.webmanifest` with the existing app name, colors, icons, `display: standalone`, `scope`, and `start_url`.
   - Add/ensure the manifest link exists in `index.html`.
   - No cache-busting query tricks; the hosting layer already serves manifest and HTML with no-cache headers.

4. Clean up app registration code
   - Remove the `virtual:pwa-register` import and auto-update logic from `src/main.tsx`, because the cleanup worker will handle old installs and there will no longer be a generated Workbox service worker to update.
   - Keep the native-platform and preview safety cleanup logic where useful, but simplify it to avoid repeated reload behavior.

5. Keep service-worker messaging safe
   - Leave the existing `navigator.serviceWorker` message listener in authenticated layouts harmlessly in place or make it defensive, so notification-related future code does not crash when no worker is active.

6. Verify expected behavior after publishing
   - After the next Publish/Update, affected browsers should receive the cleanup worker, delete old caches, reload once, and then load the current published app directly from the network.
   - After that, normal refreshes should show new published versions without needing to clear cookies/history.

Technical notes:

- The live response for `https://smartygym.com/` already has `cache-control: no-cache, must-revalidate, max-age=0`, so repeated stale UI strongly points to the installed service worker rather than the web server.
- The current live `/sw.js` precaches `index.html`, `assets/index-...js`, and `assets/index-...css`, which is exactly the pattern that can pin browsers to an old version.
- This fix intentionally avoids refresh loops: the cleanup worker reloads controlled clients once using a URL marker, deletes caches, then unregisters.
- If later you want full offline workout caching again, we can reintroduce it in a more limited way that never precaches `index.html` or the main app shell.