import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNativePlatform, configureStatusBar } from "./utils/native";

// Configure native status bar on app launch
configureStatusBar();

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isLovablePreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

const clearServiceWorkersAndCaches = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }

  if ('caches' in window) {
    caches.keys().then((names) => names.forEach((name) => caches.delete(name)));
  }
};

// Inside Capacitor native shell: unregister any PWA service workers to prevent
// caching conflicts in WebView. The native app handles caching differently.
if (isNativePlatform()) {
  clearServiceWorkersAndCaches();
}

// Lovable preview runs inside an iframe/preview host. Service workers should not
// control that environment because they can keep old editor builds alive.
if (!isNativePlatform() && (isInIframe || isLovablePreviewHost)) {
  clearServiceWorkersAndCaches();
}

// DEV-only: Clear stuck service workers and caches from previous PWA builds
if (import.meta.env.DEV && !isNativePlatform()) {
  clearServiceWorkersAndCaches();
}

createRoot(document.getElementById("root")!).render(<App />);
