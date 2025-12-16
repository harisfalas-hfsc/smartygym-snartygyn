import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type ExerciseGifProps = {
  exerciseId: string;
  alt: string;
  className?: string;
  resolution?: number;
};

export function ExerciseGif({ exerciseId, alt, className, resolution = 360 }: ExerciseGifProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const stableId = useMemo(() => String(exerciseId ?? "").trim(), [exerciseId]);

  useEffect(() => {
    setFailed(false);

    // cleanup old URL when exercise changes
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSrc(null);

    if (!stableId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("fetch-exercisedb-image", {
          body: { exerciseId: stableId, resolution },
        });

        if (cancelled) return;
        if (error) throw error;
        if (!(data instanceof Blob)) throw new Error("Unexpected image response");

        const url = URL.createObjectURL(data);
        objectUrlRef.current = url;
        setSrc(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const el = containerRef.current;
    if (!el) {
      void load();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((e) => e.isIntersecting);
        if (isVisible) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [stableId, resolution]);

  return (
    <div ref={containerRef} className="h-full w-full">
      {src ? (
        <img src={src} alt={alt} className={className} loading="lazy" />
      ) : (
        <div
          className={[
            "h-full w-full",
            "bg-muted",
            "animate-pulse",
            failed ? "opacity-60" : "opacity-100",
          ].join(" ")}
          aria-label={alt}
        />
      )}
    </div>
  );
}
