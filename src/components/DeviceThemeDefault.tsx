import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Forces dark theme on every page load.
 * User can switch to light during their session, but it resets on refresh/reopen.
 */
export const DeviceThemeDefault = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return null;
};
