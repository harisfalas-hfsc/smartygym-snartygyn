import { useEffect, useRef } from "react";

// 1x1 transparent looping mp4 (base64) — iOS Safari fallback when Wake Lock API
// is unavailable. Playing a muted/looping/playsinline video keeps the screen on.
const NO_SLEEP_VIDEO_MP4 =
  "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKxtZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE0MiByMjM4OSA5NTZjOGQ4IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNCAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTUgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT11bWggc3VibWU9OCBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MiA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPटज सम्बन्धित कारण";

/**
 * Keep the device screen awake while `active` is true.
 * - Primary: Screen Wake Lock API (Chrome/Edge Android, desktop, Safari 16.4+)
 * - Fallback: hidden looping muted video (iOS Safari < 16.4, some WebViews)
 * - Re-acquires the wake lock on visibilitychange.
 */
export function useKeepScreenAwake(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

    const startVideoFallback = () => {
      try {
        if (videoRef.current) return;
        const v = document.createElement("video");
        v.setAttribute("playsinline", "");
        v.setAttribute("muted", "");
        v.setAttribute("loop", "");
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.style.position = "fixed";
        v.style.width = "1px";
        v.style.height = "1px";
        v.style.opacity = "0";
        v.style.pointerEvents = "none";
        v.style.top = "0";
        v.style.left = "0";
        v.src = NO_SLEEP_VIDEO_MP4;
        document.body.appendChild(v);
        videoRef.current = v;
        v.play().catch(() => {
          /* autoplay blocked — silent fail */
        });
      } catch {
        /* ignore */
      }
    };

    const stopVideoFallback = () => {
      try {
        const v = videoRef.current;
        if (!v) return;
        v.pause();
        v.removeAttribute("src");
        v.load();
        v.remove();
        videoRef.current = null;
      } catch {
        /* ignore */
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Wake Lock auto-releases on hide — re-acquire on return.
        requestLock();
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      }
    };

    requestLock();
    startVideoFallback();
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
      stopVideoFallback();
    };
  }, [active]);
}

export default useKeepScreenAwake;