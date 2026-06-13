import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Desktop and mobile both default to dark mode.
 * Mobile defaults to light mode.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const sessionTheme = sessionStorage.getItem("smartygym-session-theme");

    if (sessionTheme) {
      setTheme(sessionTheme);
    } else {
      setTheme("dark");
      sessionStorage.setItem("smartygym-session-theme", "dark");
    }
  }, [setTheme]);

  useEffect(() => {
    if (theme) {
      sessionStorage.setItem("smartygym-session-theme", theme);
    }
  }, [theme]);

  return null;
};
