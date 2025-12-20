import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Forces dark theme on every NEW session.
 * User can switch to light during their session, and it persists on refresh.
 * When browser/app is closed and reopened, it resets to dark.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
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
