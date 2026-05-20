import * as React from "react";

// Match Lovable's tablet preview: anything below 1100px must render mobile.
const DESKTOP_MIN_WIDTH = 1100;
const DESKTOP_MIN_HEIGHT = 600;

function computeIsMobile() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  return !(w >= DESKTOP_MIN_WIDTH && h >= DESKTOP_MIN_HEIGHT);
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
