import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Sets default theme to light mode for all devices (mobile + desktop).
 * User can override during session; persists on refresh within same session.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const sessionTheme = sessionStorage.getItem("smartygym-session-theme");
    
    // Force dark mode as default for all devices. Theme toggle is hidden,
    // so we always apply dark and ignore any previously stored preference.
    setTheme("dark");
    sessionStorage.setItem("smartygym-session-theme", "dark");
  }, [setTheme]);

  useEffect(() => {
    if (theme) {
      sessionStorage.setItem("smartygym-session-theme", theme);
    }
  }, [theme]);

  return null;
};
