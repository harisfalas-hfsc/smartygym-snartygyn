import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Sets device-specific default themes on initial load:
 * - Mobile (portrait mode): Dark theme
 * - Desktop/Tablet (landscape mode): Light theme
 * 
 * Only runs if user hasn't already set a preference.
 * User can always override via theme toggle button.
 */
export const DeviceThemeDefault = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Check if user has already manually set a theme preference
    const savedTheme = localStorage.getItem("smartygym-theme");
    
    // Only set device-based default if no user preference exists
    if (!savedTheme) {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = height > width; // Mobile view
      
      // Mobile (portrait): dark theme
      // Desktop/Tablet (landscape): light theme
      const deviceDefault = isPortrait ? "dark" : "light";
      setTheme(deviceDefault);
    }
  }, [setTheme]);

  return null;
};
