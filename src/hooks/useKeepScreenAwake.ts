import { useEffect, useRef } from "react";
import NoSleep from "nosleep.js";

/**
 * Keep the device screen awake while `active` is true.
 * - Primary: Screen Wake Lock API (Chrome/Edge Android, desktop, Safari 16.4+)
 * - Fallback: NoSleep.js looping muted video (iOS Safari, older WebViews)
 * - Re-acquires the wake lock on visibilitychange.
 */
export function useKeepScreenAwake(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const noSleepRef = useRef<NoSleep | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const requestLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const s = await (navigator as any).wakeLock.request("screen");
          if (cancelled) {
            s.release?.();
            return;
          }
          sentinelRef.current = s;
          s.addEventListener?.("release", () => {
            sentinelRef.current = null;
          });
        }
      } catch {
        /* ignore */
      }
    };

    const enableNoSleep = () => {
      try {
        if (!noSleepRef.current) noSleepRef.current = new NoSleep();
        noSleepRef.current.enable().catch(() => {});
      } catch {
        /* ignore */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        requestLock();
        enableNoSleep();
      }
    };

    requestLock();
    enableNoSleep();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      try {
        sentinelRef.current?.release?.();
      } catch {
        /* ignore */
      }
      sentinelRef.current = null;
      try {
        noSleepRef.current?.disable();
      } catch {
        /* ignore */
      }
    };
  }, [active]);
}

export default useKeepScreenAwake;