import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Sets dark theme as the default on initial load.
 * Only runs if user hasn't already set a preference.
 * User can always override via theme toggle button.
 */
export const DeviceThemeDefault = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Check if user has already manually set a theme preference
    const savedTheme = localStorage.getItem("smartygym-theme");
    
    // Only set default if no user preference exists
    if (!savedTheme) {
      setTheme("dark");
    }
  }, [setTheme]);

  return null;
};
