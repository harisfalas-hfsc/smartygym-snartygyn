import * as React from "react";

// Mobile view is driven by orientation, not just width:
// - Any phone (smallest dimension < PHONE_MAX) → always mobile (portrait or landscape)
// - Tablet in portrait → mobile
// - Tablet in landscape → desktop
// - Desktop → desktop
const PHONE_MAX = 600;

function computeIsMobile() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPhone = Math.min(w, h) < PHONE_MAX;
  const isPortrait = h > w;
  return isPhone || isPortrait;
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
