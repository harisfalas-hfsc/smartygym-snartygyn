import * as React from "react";

/**
 * Hook that returns true when device is in portrait orientation,
 * and false when in landscape orientation.
 * 
 * Portrait mode = Mobile view (height > width)
 * Landscape mode = Desktop view (width >= height)
 */
export function useIsPortraitMode() {
  const [isPortrait, setIsPortrait] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Portrait: height > width
      // Landscape: width >= height
      setIsPortrait(height > width);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return !!isPortrait;
}
