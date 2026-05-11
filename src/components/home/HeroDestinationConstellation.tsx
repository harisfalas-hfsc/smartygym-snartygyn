import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  CalendarCheck,
  Dumbbell,
  Calendar,
  Calculator,
  Video,
  FileText,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTodayWods } from "@/hooks/useTodayWods";
import { useIsPortraitMode } from "@/hooks/useIsPortraitMode";

import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts-bright.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library-new.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroCommunityImage from "@/assets/hero-community-new.jpg";
import harisFalasImage from "@/assets/haris-falas-coach.png";

type Destination = {
  id: string;
  title: string;
  short: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  route: string;
  image: string;
  /** Desktop absolute position + size (px). */
  desktop: { top: number; left: number; size: number };
  /** Tailwind animation delay (staggered float). */
  delay: string;
  featured?: boolean;
  /** Where the hover description popover should appear relative to the bubble. */
  popoverPos?: string;
};

const DESTINATIONS: Destination[] = [
  {
    id: "wod",
    title: "Workout of the Day",
    short: "WOD",
    tagline: "Today's featured session",
    description:
      "The Workout of the Day is a fresh, smart-coded session published every morning for you to train with.",
    icon: CalendarCheck,
    route: "/workout/wod",
    image: heroWodImage,
    desktop: { top: 0, left: 540, size: 200 },
    delay: "0s",
    featured: true,
    popoverPos: "top-full mt-1 left-1/2 -translate-x-1/2",
  },
  {
    id: "workouts",
    title: "Smarty Workouts",
    short: "Workouts",
    tagline: "500+ expert sessions",
    description:
      "Smarty Workouts are single-session training routines designed to fit your lifestyle and goals.",
    icon: Dumbbell,
    route: "/workout",
    image: heroWorkoutsImage,
    desktop: { top: 70, left: 950, size: 190 },
    delay: "0.6s",
    popoverPos: "top-1/2 right-full mr-1",
  },
  {
    id: "programs",
    title: "Smarty Programs",
    short: "Programs",
    tagline: "Multi-week plans",
    description:
      "Smarty Programs are long-term, structured plans designed to help you achieve your specific fitness goals.",
    icon: Calendar,
    route: "/trainingprogram",
    image: heroProgramsImage,
    desktop: { top: 70, left: 160, size: 190 },
    delay: "1.2s",
    popoverPos: "top-1/2 left-full ml-1",
  },
  {
    id: "tools",
    title: "Smarty Tools",
    short: "Tools",
    tagline: "Calculators & timers",
    description:
      "Smarty Tools are calculators and timers that help you measure, plan and time your training.",
    icon: Calculator,
    route: "/tools",
    image: heroToolsImage,
    desktop: { top: 290, left: 0, size: 170 },
    delay: "0.9s",
    popoverPos: "bottom-1/2 left-full ml-1",
  },
  {
    id: "library",
    title: "Exercise Library",
    short: "Library",
    tagline: "Form & technique",
    description:
      "The Exercise Library shows you proper form and technique for every movement we use.",
    icon: Video,
    route: "/exerciselibrary",
    image: heroLibraryImage,
    desktop: { top: 290, left: 1130, size: 170 },
    delay: "1.5s",
    popoverPos: "bottom-1/2 right-full mr-1",
  },
  {
    id: "blog",
    title: "Blog & Insights",
    short: "Blog",
    tagline: "Evidence-based articles",
    description:
      "The Blog publishes evidence-based articles on training, nutrition and recovery.",
    icon: FileText,
    route: "/blog",
    image: heroBlogImage,
    desktop: { top: 380, left: 280, size: 190 },
    delay: "0.3s",
    popoverPos: "top-1/2 left-full ml-1",
  },
  {
    id: "community",
    title: "Community",
    short: "Community",
    tagline: "Train together",
    description:
      "The Community is where Smarty members connect, share progress and train together.",
    icon: Users,
    route: "/community",
    image: heroCommunityImage,
    desktop: { top: 380, left: 840, size: 190 },
    delay: "1.8s",
    popoverPos: "top-1/2 right-full mr-1",
  },
];

/** Center coach bubble — sits in the middle of the constellation. */
const COACH: Destination = {
  id: "coach",
  title: "Haris Falas",
  short: "Haris Falas",
  tagline: "Founder & Head Coach",
  description:
    "Haris Falas is the founder and head coach behind every workout, program and article on SmartyGym.",
  icon: User,
  route: "/coach-profile",
  image: harisFalasImage,
  desktop: { top: 270, left: 575, size: 150 },
  delay: "0.4s",
  popoverPos: "top-full mt-3 left-1/2 -translate-x-1/2",
};

/** Decorative connection lines between bubble centers (desktop only). */
const CONNECTIONS: Array<[string, string]> = [
  ["wod", "workouts"],
  ["wod", "programs"],
  ["workouts", "library"],
  ["programs", "tools"],
  ["tools", "blog"],
  ["library", "community"],
  ["blog", "community"],
];

const Bubble = ({
  dest,
  isWodLive,
  size,
  className,
  style,
  cycleImages,
  popoverPosOverride,
}: {
  dest: Destination;
  isWodLive: boolean;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  cycleImages?: string[];
  popoverPosOverride?: string;
}) => {
  const navigate = useNavigate();
  const Icon = dest.icon;
  const showLivePill = dest.featured && isWodLive;
  const labelMaxWidth = Math.max(size + 40, 130);
  const popoverPos =
    popoverPosOverride ||
    dest.popoverPos ||
    "top-full mt-3 left-1/2 -translate-x-1/2";
  const descId = `bubble-desc-${dest.id}`;
  // Featured WOD is already prominent — gentler scale.
  const hoverScale = dest.featured ? 1.06 : 1.08;

  // Optional image carousel (e.g. today's WOD bodyweight + equipment images)
  const images = cycleImages && cycleImages.length > 0 ? cycleImages : [dest.image];
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [images.length]);

  return (
    <div
      className={cn(
        "flex flex-col items-center group",
        "transition-[z-index] duration-0",
        "hover:z-30 focus-within:z-30",
        className
      )}
      style={
        {
          ...style,
          ["--hover-scale" as any]: hoverScale,
        } as React.CSSProperties
      }
    >
      <span
        className="motion-safe:animate-[float_6s_ease-in-out_infinite] inline-block group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{ animationDelay: dest.delay }}
      >
      <button
        type="button"
        onClick={() => navigate(dest.route)}
        aria-label={`Go to ${dest.title}`}
        aria-describedby={descId}
        className={cn(
          "relative rounded-full overflow-hidden",
          "transform-gpu will-change-transform",
          "[transition:transform_550ms_cubic-bezier(0.22,1,0.36,1),box-shadow_400ms_ease-out,outline-color_300ms_ease-out]",
          "ring-[3px] ring-primary/50 hover:ring-primary",
          "shadow-lg shadow-primary/10 hover:shadow-2xl hover:shadow-primary/30",
          "hover:[transform:scale(var(--hover-scale))] focus-visible:[transform:scale(var(--hover-scale))]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary",
          dest.featured && "ring-4 ring-primary"
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
              dest.featured
                ? "scale-150 group-hover:scale-[1.65]"
                : "scale-110 group-hover:scale-125",
              i === imgIndex ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
        {/* Subtle gradient overlay for legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          aria-hidden="true"
        />

        {/* Featured pulsing ring */}
        {dest.featured && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full ring-4 ring-primary motion-safe:animate-ping opacity-40"
          />
        )}

        {/* TODAY pill on featured WOD when live */}
        {showLivePill && (
          <span className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold tracking-wider uppercase shadow-md">
            Today
          </span>
        )}

        {/* Icon chip centered near the bottom, inset from the circle edge */}
        <span
          className={cn(
            "absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/95 backdrop-blur-sm",
            "flex items-center justify-center shadow-lg ring-2 ring-primary/60",
            "group-hover:scale-110 transition-transform"
          )}
          style={{
            bottom: `${Math.max(size * 0.1, 12)}px`,
            width: `${Math.max(size * 0.26, 34)}px`,
            height: `${Math.max(size * 0.26, 34)}px`,
          }}
          aria-hidden="true"
        >
          <Icon
            className="text-primary"
            style={{
              width: `${Math.max(size * 0.14, 18)}px`,
              height: `${Math.max(size * 0.14, 18)}px`,
            }}
          />
        </span>
      </button>
      </span>

      {/* Hover/focus description popover — placed in empty space next to the bubble */}
      <div
        id={descId}
        role="tooltip"
        className={cn(
          "absolute z-40 w-[240px] p-4 rounded-lg border-2 border-primary",
          "bg-primary text-primary-foreground shadow-2xl",
          "text-sm sm:text-base leading-snug text-center font-bold",
          "opacity-0 translate-y-1 pointer-events-none",
          "group-hover:opacity-100 group-focus-within:opacity-100 group-hover:translate-y-0 group-focus-within:translate-y-0",
          "transition-all duration-200",
          popoverPos
        )}
      >
        {dest.description}
      </div>

      <div
        className="mt-2 text-center"
        style={{ maxWidth: `${labelMaxWidth}px` }}
      >
        <p
          className={cn(
            "font-bold text-foreground leading-tight",
            size >= 160 ? "text-base" : "text-sm"
          )}
        >
          {dest.short}
        </p>
      </div>
    </div>
  );
};

export const HeroDestinationConstellation = () => {
  const { isPortrait: isMobile } = useIsPortraitMode();
  const { hasWods, bodyweightWod, equipmentWod, variousWod, allTodayWods } =
    useTodayWods(true);

  // Tablet detection: landscape but narrower than full desktop.
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // True tablets only (iPad portrait/landscape up to 1024px wide).
      // Anything wider is treated as desktop so the constellation stays intact.
      setIsTablet(w >= 768 && w <= 1024 && w >= h);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  // Build the WOD image carousel from today's actual WOD images (bodyweight + equipment).
  // Falls back to the static hero image if nothing is available yet.
  const wodCycleImages = (() => {
    const ordered = [bodyweightWod, equipmentWod, variousWod].filter(Boolean) as Array<{ image_url?: string | null }>;
    const fromOrdered = ordered.map((w) => w.image_url).filter(Boolean) as string[];
    if (fromOrdered.length > 0) return fromOrdered;
    const fromAll = (allTodayWods || []).map((w: any) => w.image_url).filter(Boolean) as string[];
    return fromAll;
  })();

  // Find bubble center coords for connection lines (desktop)
  const centers: Record<string, { cx: number; cy: number }> = {};
  DESTINATIONS.forEach((d) => {
    centers[d.id] = {
      cx: d.desktop.left + d.desktop.size / 2,
      cy: d.desktop.top + d.desktop.size / 2,
    };
  });

  const featured = DESTINATIONS.find((d) => d.featured)!;
  const others = DESTINATIONS.filter((d) => !d.featured);

  // ============ DESKTOP RESPONSIVE SCALING ============
  // The desktop stage is a fixed 1300x650 absolutely-positioned canvas.
  // On viewports narrower than 1300px (e.g. phone in landscape with
  // "Desktop site" forced) we uniformly scale it down to fit.
  const desktopWrapperRef = useRef<HTMLDivElement | null>(null);
  const [desktopScale, setDesktopScale] = useState(1);
  useEffect(() => {
    const el = desktopWrapperRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      setDesktopScale(Math.min(1, w / 1300));
    };
    measure();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  // ============ TABLET CIRCULAR LAYOUT ============
  const tabletStage = 720;
  const tabletRadius = 260;
  const tabletBubbleSize = 130;
  const tabletCoachSize = 160;
  const tabletCenter = tabletStage / 2;
  const tabletPositions = DESTINATIONS.map((dest, i) => {
    const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / DESTINATIONS.length;
    const cx = tabletCenter + tabletRadius * Math.cos(angle);
    const cy = tabletCenter + tabletRadius * Math.sin(angle);
    return {
      dest,
      top: cy - tabletBubbleSize / 2,
      left: cx - tabletBubbleSize / 2,
      cx,
      cy,
    };
  });

  if (isTablet) {
    return (
      <div className="w-full">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
          @keyframes orbitPulse {
            0%, 100% { stroke-opacity: 0.18; }
            50% { stroke-opacity: 0.35; }
          }
        `}</style>
        <div
          className="relative mx-auto"
          style={{ width: "100%", maxWidth: `${tabletStage}px`, aspectRatio: "1 / 1" }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${tabletStage} ${tabletStage}`}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="tablet-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={tabletStage} height={tabletStage} fill="url(#tablet-glow)" />
            <circle
              cx={tabletCenter}
              cy={tabletCenter}
              r={tabletRadius}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.25"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              style={{ animation: "orbitPulse 6s ease-in-out infinite" }}
            />
            {tabletPositions.map(({ dest, cx, cy }) => (
              <line
                key={`spoke-${dest.id}`}
                x1={tabletCenter}
                y1={tabletCenter}
                x2={cx}
                y2={cy}
                stroke="hsl(var(--primary))"
                strokeOpacity="0.2"
                strokeWidth="1.25"
                strokeDasharray="3 5"
              />
            ))}
          </svg>

          {tabletPositions.map(({ dest, top, left }) => (
            <Bubble
              key={dest.id}
              dest={dest}
              isWodLive={hasWods}
              size={tabletBubbleSize}
              cycleImages={dest.featured ? wodCycleImages : undefined}
              className="absolute"
              popoverPosOverride={
                top + tabletBubbleSize / 2 < tabletCenter
                  ? "top-full mt-2 left-1/2 -translate-x-1/2"
                  : "bottom-full mb-2 left-1/2 -translate-x-1/2"
              }
              style={{
                top: `${(top / tabletStage) * 100}%`,
                left: `${(left / tabletStage) * 100}%`,
              }}
            />
          ))}

          <Bubble
            dest={COACH}
            isWodLive={false}
            size={tabletCoachSize}
            className="absolute"
            style={{
              top: `${((tabletCenter - tabletCoachSize / 2) / tabletStage) * 100}%`,
              left: `${((tabletCenter - tabletCoachSize / 2) / tabletStage) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Inline keyframes — local to this component */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      {/* ============ DESKTOP ============ */}
      <div className="hidden md:block">
        <div
          ref={desktopWrapperRef}
          className="relative mx-auto"
          style={{
            width: "100%",
            maxWidth: "1300px",
            height: `${650 * desktopScale}px`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "1300px",
              height: "650px",
              transform: `scale(${desktopScale})`,
              transformOrigin: "top left",
              position: "relative",
            }}
          >
          {/* Decorative connection SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1300 650"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="constellation-glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1300" height="650" fill="url(#constellation-glow)" />
            {CONNECTIONS.map(([a, b]) => {
              const A = centers[a];
              const B = centers[b];
              if (!A || !B) return null;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.cx}
                  y1={A.cy}
                  x2={B.cx}
                  y2={B.cy}
                  stroke="hsl(var(--primary))"
                  strokeOpacity="0.18"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
              );
            })}
          </svg>

          {DESTINATIONS.map((dest) => (
            <Bubble
              key={dest.id}
              dest={dest}
              isWodLive={hasWods}
              size={dest.desktop.size}
              cycleImages={dest.featured ? wodCycleImages : undefined}
              className="absolute"
              style={{
                top: `${dest.desktop.top}px`,
                left: `${dest.desktop.left}px`,
              }}
            />
          ))}

          {/* Center coach bubble */}
          <Bubble
            dest={COACH}
            isWodLive={false}
            size={COACH.desktop.size}
            className="absolute"
            style={{
              top: `${COACH.desktop.top}px`,
              left: `${COACH.desktop.left}px`,
            }}
          />
          </div>
        </div>
      </div>

      {/* ============ MOBILE ============ */}
      <div className="md:hidden">
        <div className="flex flex-col items-center gap-5">
          {/* Featured WOD bubble */}
          <Bubble dest={featured} isWodLive={hasWods} size={150} cycleImages={wodCycleImages} />

          {/* 3 rows × 2 bubbles */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 w-full max-w-xs">
            {others.map((dest) => (
              <div key={dest.id} className="flex justify-center">
                <Bubble dest={dest} isWodLive={hasWods} size={105} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDestinationConstellation;