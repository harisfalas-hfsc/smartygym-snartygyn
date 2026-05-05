import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Returns true when the app is running inside a native shell or website-wrapper app,
 * false when running in a normal desktop/mobile browser.
 */
export const isNativePlatform = (): boolean => {
  if (Capacitor.isNativePlatform()) return true;

  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);
  const forcedNativeView = params.get('forceHideBadge') === 'true' || params.get('nativeApp') === 'true';

  if (forcedNativeView) {
    try {
      window.localStorage.setItem('smartygym-native-wrapper', 'true');
    } catch {
      // Ignore storage restrictions in embedded webviews.
    }
    return true;
  }

  try {
    if (window.localStorage.getItem('smartygym-native-wrapper') === 'true') return true;
  } catch {
    // Ignore storage restrictions in embedded webviews.
  }

  const userAgent = window.navigator.userAgent || '';
  const isAndroidWebView = /;\s?wv\)/i.test(userAgent) || /Version\/\d+\.\d+.*Chrome\//i.test(userAgent);
  const isIOSWebView = /iPhone|iPad|iPod/i.test(userAgent) && /AppleWebKit/i.test(userAgent) && !/Safari/i.test(userAgent);

  return isAndroidWebView || isIOSWebView;
};

/**
 * Opens a URL externally — uses Capacitor Browser plugin on native,
 * falls back to window.open in the browser.
 */
export const openExternal = async (url: string): Promise<void> => {
  if (!url) return;

  if (isNativePlatform()) {
    try {
      await Browser.open({ url, presentationStyle: 'popover' });
    } catch {
      // Fallback if plugin fails
      window.open(url, '_blank');
    }
  } else {
    window.open(url, '_blank');
  }
};

/**
 * Configures the native status bar to match the app's dark theme.
 * No-op when running in a browser.
 */
export const configureStatusBar = async (): Promise<void> => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0F0F0F' });
  } catch {
    // StatusBar plugin not available — ignore
  }
};
