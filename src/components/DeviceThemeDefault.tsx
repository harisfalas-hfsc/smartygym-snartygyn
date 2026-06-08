import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Desktop is always dark mode with no toggle.
 * Mobile defaults to dark and can be overridden by the user.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const sessionTheme = sessionStorage.getItem("smartygym-session-theme");

    if (isDesktop) {
      setTheme("dark");
    } else if (sessionTheme) {
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
