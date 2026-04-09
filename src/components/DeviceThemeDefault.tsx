import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Sets default theme based on device width:
 * - Desktop (≥768px): light mode
 * - Mobile (<768px): dark mode
 * User can override during session; persists on refresh within same session.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const sessionTheme = sessionStorage.getItem("smartygym-session-theme");
    
    if (sessionTheme) {
      setTheme(sessionTheme);
    } else {
      const isMobile = window.innerWidth < 768;
      const defaultTheme = isMobile ? "dark" : "light";
      setTheme(defaultTheme);
      sessionStorage.setItem("smartygym-session-theme", defaultTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    if (theme) {
      sessionStorage.setItem("smartygym-session-theme", theme);
    }
  }, [theme]);

  return null;
};
