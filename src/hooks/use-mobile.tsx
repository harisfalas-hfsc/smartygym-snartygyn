import * as React from "react";

// Mobile view is driven by orientation, not just width:
// - Any phone (smallest dimension < PHONE_MAX) → always mobile (portrait or landscape)
// - Tablet in portrait → mobile
// - Tablet in landscape → desktop
// - Desktop → desktop
const PHONE_MAX = 600;
const TABLET_LANDSCAPE_MIN_WIDTH = 1100;
const TABLET_LANDSCAPE_MIN_HEIGHT = 600;

function computeIsMobile() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPhone = Math.min(w, h) < PHONE_MAX;
  const isTabletLandscape = w >= TABLET_LANDSCAPE_MIN_WIDTH && h >= TABLET_LANDSCAPE_MIN_HEIGHT && w > h;
  const isPortrait = h > w;
  return !isTabletLandscape && (isPhone || isPortrait);
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
