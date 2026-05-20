import * as React from "react";

/**
 * Hook that returns orientation info for responsive layouts.
 * 
 * Portrait mode = Mobile view (height > width)
 * Landscape mode = Desktop view (width >= height)
 * 
 * Also detects if device is a phone in landscape (small screen height)
 * to enable scaling of desktop content.
 */
export function useIsPortraitMode() {
  const [state, setState] = React.useState({
    isPortrait: true,
    isPhoneLandscape: false,
  });

  React.useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTabletLandscape = width >= 1024 && height >= 600 && width > height;
      
      // Portrait: height > width
      // Landscape: width >= height
      const isPortrait = !isTabletLandscape && height > width;
      
      // Phone in landscape: not portrait AND screen height is small (< 500px)
      // This helps detect when we're on a phone vs tablet in landscape
      const isPhoneLandscape = !isPortrait && height < 500;
      
      setState({ isPortrait, isPhoneLandscape });
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return {
    isPortrait: state.isPortrait,
    isPhoneLandscape: state.isPhoneLandscape,
  };
}
