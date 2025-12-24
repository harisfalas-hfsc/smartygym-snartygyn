import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// DEV-only: Clear stuck service workers and caches from previous PWA builds
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
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
