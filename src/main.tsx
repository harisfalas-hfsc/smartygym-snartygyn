import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform, configureStatusBar } from "./utils/native";

// Configure native status bar on app launch
configureStatusBar();

// DEV-only: Clear stuck service workers and caches from previous PWA builds
// Also skip SW cleanup when running inside Capacitor native shell
if (import.meta.env.DEV && 'serviceWorker' in navigator && !isNativePlatform()) {
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

createRoot(document.getElementById("root")!).render(<App />);
