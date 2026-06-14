import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

/**
 * Default theme is light on both desktop and mobile.
 * Users can freely toggle dark/light; the choice is remembered for the session.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const sessionTheme = sessionStorage.getItem("smartygym-session-theme");
    if (sessionTheme === "dark" || sessionTheme === "light") {
      setTheme(sessionTheme);
    } else {
      setTheme("light");
      sessionStorage.setItem("smartygym-session-theme", "light");
    }
  }, [setTheme]);

  useEffect(() => {
    if (!theme) return;
    if (theme === "dark" || theme === "light") {
      sessionStorage.setItem("smartygym-session-theme", theme);
    }
  }, [setTheme, theme]);

  return null;
};
