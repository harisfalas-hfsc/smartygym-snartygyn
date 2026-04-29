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


const clearLovableDeploymentPinCookie = () => {
  if (typeof document === "undefined") return;

  const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const base = "__dpl=; Path=/; Max-Age=0; " + expires + "; SameSite=Lax; Secure";
  document.cookie = base;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  for (let index = 0; index <= parts.length - 2; index += 1) {
    const domain = parts.slice(index).join(".");
    document.cookie = `${base}; Domain=${domain}`;
    document.cookie = `${base}; Domain=.${domain}`;
  }
};


// Lovable hosting may set a short-lived deployment pin cookie during publish
// transitions. If a browser keeps an old pin, refreshes can keep loading an
// older deployment until cookies are cleared. Remove it on every app start.
clearLovableDeploymentPinCookie();

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
