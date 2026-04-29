import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
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

if (import.meta.env.PROD && !isNativePlatform() && !isInIframe && !isLovablePreviewHost) {
  const refreshRequestedKey = "smartygym-sw-refresh-requested";
  const lastReloadKey = "smartygym-sw-last-reload";
  let isReloadingForUpdate = false;

  navigator.serviceWorker?.addEventListener("controllerchange", () => {
    if (isReloadingForUpdate) return;
    if (sessionStorage.getItem(refreshRequestedKey) !== "1") return;

    const now = Date.now();
    const lastReload = Number(sessionStorage.getItem(lastReloadKey) || "0");

    sessionStorage.removeItem(refreshRequestedKey);

    // Avoid refresh loops if a browser repeatedly fires controllerchange.
    if (now - lastReload < 10_000) return;

    isReloadingForUpdate = true;
    sessionStorage.setItem(lastReloadKey, String(now));
    window.location.reload();
  });

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      sessionStorage.setItem(refreshRequestedKey, "1");
      updateSW(true);
    },
    onRegisteredSW(_swUrl, registration) {
      registration?.update();
      if (registration?.waiting && navigator.serviceWorker.controller) {
        sessionStorage.setItem(refreshRequestedKey, "1");
        updateSW(true);
      }
      window.addEventListener("focus", () => registration?.update());
      window.addEventListener("pageshow", () => registration?.update());
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration?.update();
      });
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
