import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import heroPoster from "@/assets/workout-hero.jpg";

type HeroBackgroundVideoProps = {
  /** Absolute path (public) or URL to MP4 */
  src: string;
  className?: string;
  /** Poster image to show instantly while video loads */
  posterSrc?: string;
  /** Default: auto for fastest first paint of video */
  preload?: "none" | "metadata" | "auto";
};

/**
 * Background video helper:
 * - shows a poster immediately (no blank hero)
 * - adds a preload hint
 * - retries with a cache-busting query param if the video stalls or errors
 */
export function HeroBackgroundVideo({
  src,
  className,
  posterSrc = heroPoster,
  preload = "auto",
}: HeroBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [retry, setRetry] = useState(0);

  const effectiveSrc = useMemo(() => {
    if (retry === 0) return src;
    const joiner = src.includes("?") ? "&" : "?";
    return `${src}${joiner}r=${retry}`;
  }, [src, retry]);

  // Hint the browser to start fetching the video as early as possible.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "video";
    link.href = src;
    link.type = "video/mp4";
    document.head.appendChild(link);
    return () => {
      // Best-effort cleanup
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [src]);

  // If it hasn't become ready quickly, retry (fixes intermittent "needs refresh" cases).
  useEffect(() => {
    if (ready) return;
    if (retry >= 2) return;

    const t = window.setTimeout(() => {
      if (!ready) setRetry((r) => r + 1);
    }, 2500);

    return () => window.clearTimeout(t);
  }, [ready, retry]);

  // Encourage playback (some browsers need an explicit play() call even with autoplay).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // Autoplay can be blocked; poster will remain visible.
    });
  }, [effectiveSrc]);

  return (
    <>
      {posterSrc ? (
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300",
            ready ? "opacity-0" : "opacity-100",
            className,
          )}
          loading="eager"
          decoding="async"
        />
      ) : null}

      <video
        ref={videoRef}
        key={effectiveSrc}
        autoPlay
        muted
        loop
        playsInline
        preload={preload}
        className={cn(
          "absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
        onError={() => {
          if (retry < 2) setRetry((r) => r + 1);
        }}
      >
        <source src={effectiveSrc} type="video/mp4" />
      </video>
    </>
  );
}
