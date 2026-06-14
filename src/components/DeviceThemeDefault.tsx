import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Desktop (>=1024px): dark mode only, always forced.
 * Mobile (<1024px): defaults to light, user can toggle.
 */
export const DeviceThemeDefault = () => {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");

    const apply = () => {
      if (mq.matches) {
        // Desktop: always dark
        setTheme("dark");
        sessionStorage.setItem("smartygym-session-theme", "dark");
      } else {
        const sessionTheme = sessionStorage.getItem("smartygym-session-theme");
        if (sessionTheme) {
          setTheme(sessionTheme);
        } else {
          setTheme("light");
          sessionStorage.setItem("smartygym-session-theme", "light");
        }
      }
    };

    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setTheme]);

  useEffect(() => {
    if (!theme) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      if (theme !== "dark") setTheme("dark");
      return;
    }
    sessionStorage.setItem("smartygym-session-theme", theme);
  }, [setTheme, theme]);

  return null;
};
