import { Capacitor } from "@capacitor/core";

/**
 * Returns true only when the app is running inside the iOS Capacitor
 * native shell. Web (any browser, including Safari on iPhone), Android
 * native, and PWA installs all return false.
 *
 * Used to hide Stripe purchase CTAs in the iOS app to comply with
 * Apple App Store Guideline 3.1.1 (no external payment links for
 * digital goods on iOS).
 */
export const isIOSNative = (): boolean => {
  try {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
  } catch {
    return false;
  }
};

export const isNativeApp = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};
