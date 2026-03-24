import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Returns true when the app is running inside a native Capacitor shell
 * (iOS / Android), false when running in a normal browser.
 */
export const isNativePlatform = (): boolean => {
  return Capacitor.isNativePlatform();
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
