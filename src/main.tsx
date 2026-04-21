import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform, configureStatusBar } from "./utils/native";

// Configure native status bar on app launch
configureStatusBar();

// Inside Capacitor native shell: unregister any PWA service workers to prevent
// caching conflicts in WebView. The native app handles caching differently.
if (isNativePlatform() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((r) => r.unregister());
  });
  if ('caches' in window) {
    caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
  }
}

// DEV-only: Clear stuck service workers and caches from previous PWA builds
if (import.meta.env.DEV && !isNativePlatform() && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('[DEV] Unregistered service worker:', registration.scope);
    });
  });
  
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
        console.log('[DEV] Deleted cache:', cacheName);
      });
    });
  }
}

if (import.meta.env.PROD && !isNativePlatform()) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      registration?.update();
      window.addEventListener("focus", () => registration?.update());
      window.addEventListener("pageshow", () => registration?.update());
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
