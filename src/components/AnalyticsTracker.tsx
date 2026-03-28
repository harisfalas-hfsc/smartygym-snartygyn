import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { 
  trackPageNavigation, 
  trackScrollDepth, 
  trackCTAClick, 
  trackTimeOnPage, 
  trackExit 
} from "@/utils/socialMediaTracking";

export function AnalyticsTracker() {
  const location = useLocation();
  const currentPath = useRef(location.pathname);
  const pageEntryTime = useRef(performance.now());
  const scrollMilestones = useRef(new Set<number>());
  const isFirstRender = useRef(true);

  // Send time on page for previous page when navigating away
  const sendTimeOnPage = useCallback(() => {
    const elapsed = (performance.now() - pageEntryTime.current) / 1000;
    trackTimeOnPage(currentPath.current, elapsed);
  }, []);

  // Track page navigation on route change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      currentPath.current = location.pathname;
      pageEntryTime.current = performance.now();
      scrollMilestones.current = new Set();
      return;
    }

    // Send time on page for the page we're leaving
    sendTimeOnPage();

    // Track the new page view
    trackPageNavigation(location.pathname);

    // Reset for new page
    currentPath.current = location.pathname;
    pageEntryTime.current = performance.now();
    scrollMilestones.current = new Set();
  }, [location.pathname, sendTimeOnPage]);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const scrollPercent = Math.round((scrollTop / docHeight) * 100);
      const milestones = [25, 50, 75, 100];

      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone);
          trackScrollDepth(currentPath.current, milestone);
        }
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [location.pathname]);

  // CTA click tracking via data attributes
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-track-cta]");
      if (target) {
        const ctaName = target.getAttribute("data-track-cta") || "unknown";
        trackCTAClick(ctaName, currentPath.current);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  // Exit detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendTimeOnPage();
        trackExit(currentPath.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sendTimeOnPage]);

  return null;
}
