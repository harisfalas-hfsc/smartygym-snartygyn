import * as React from "react";

// Tablet rule: portrait behaves like mobile, landscape behaves like desktop.
const TABLET_LANDSCAPE_MIN_WIDTH = 1024;
const DESKTOP_MIN_WIDTH = 1200;

function computeIsMobile() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isLandscape = w > h;
  const isTabletLandscapeOrWider = w >= TABLET_LANDSCAPE_MIN_WIDTH && isLandscape;
  const isWideDesktop = w >= DESKTOP_MIN_WIDTH;
  return !(isTabletLandscapeOrWider || isWideDesktop);
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const onChange = () => setIsMobile(computeIsMobile());
    onChange();
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return !!isMobile;
}
