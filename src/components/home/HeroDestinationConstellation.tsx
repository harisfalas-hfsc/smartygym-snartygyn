import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
  icon: LucideIcon;
  route: string;
  image: string;
  /** Desktop absolute position + size (px). */
  desktop: { top: number; left: number; size: number };
  /** Tailwind animation delay (staggered float). */
  delay: string;
  featured?: boolean;
};

const DESTINATIONS: Destination[] = [
  {
    id: "wod",
    title: "Workout of the Day",
    short: "WOD",
    tagline: "Today's featured session",
    icon: CalendarCheck,
    route: "/workout/wod",
    image: heroWodImage,
    desktop: { top: 0, left: 540, size: 200 },
    delay: "0s",
    featured: true,
  },
  {
    id: "workouts",
    title: "Smarty Workouts",
    short: "Workouts",
    tagline: "500+ expert sessions",
    icon: Dumbbell,
    route: "/workout",
    image: heroWorkoutsImage,
    desktop: { top: 70, left: 950, size: 190 },
    delay: "0.6s",
  },
  {
    id: "programs",
    title: "Smarty Programs",
    short: "Programs",
    tagline: "Multi-week plans",
    icon: Calendar,
    route: "/trainingprogram",
    image: heroProgramsImage,
    desktop: { top: 70, left: 160, size: 190 },
    delay: "1.2s",
  },
  {
    id: "tools",
    title: "Smarty Tools",
    short: "Tools",
    tagline: "Calculators & timers",
    icon: Calculator,
    route: "/tools",
    image: heroToolsImage,
    desktop: { top: 290, left: 0, size: 170 },
    delay: "0.9s",
  },
  {
    id: "library",
    title: "Exercise Library",
    short: "Library",
    tagline: "Form & technique",
    icon: Video,
    route: "/exerciselibrary",
    image: heroLibraryImage,
    desktop: { top: 290, left: 1130, size: 170 },
    delay: "1.5s",
  },
  {
    id: "blog",
    title: "Blog & Insights",
    short: "Blog",
    tagline: "Evidence-based articles",
    icon: FileText,
    route: "/blog",
    image: heroBlogImage,
    desktop: { top: 380, left: 280, size: 190 },
    delay: "0.3s",
  },
  {
    id: "community",
    title: "Community",
    short: "Community",
    tagline: "Train together",
    icon: Users,
    route: "/community",
    image: heroCommunityImage,
    desktop: { top: 380, left: 840, size: 190 },
    delay: "1.8s",
  },
];

/** Center coach bubble — sits in the middle of the constellation. */
const COACH: Destination = {
  id: "coach",
  title: "Haris Falas",
  short: "Haris Falas",
  tagline: "Founder & Head Coach",
  icon: User,
  route: "/coach-profile",
  image: harisFalasImage,
  desktop: { top: 270, left: 575, size: 150 },
  delay: "0.4s",
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
  pullX = 0,
  pullY = 0,
  cycleImages,
}: {
  dest: Destination;
  isWodLive: boolean;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  pullX?: number;
  pullY?: number;
  cycleImages?: string[];
}) => {
  const navigate = useNavigate();
  const Icon = dest.icon;
  const showLivePill = dest.featured && isWodLive;
  const labelMaxWidth = Math.max(size + 40, 130);
  // Featured WOD is already prominent — gentler scale.
  const hoverScale = dest.featured ? 1.1 : 1.18;

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
          // CSS vars consumed by the button transform on hover
          ["--pull-x" as any]: `${pullX}px`,
          ["--pull-y" as any]: `${pullY}px`,
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
        className={cn(
          "relative rounded-full overflow-hidden",
          "transform-gpu will-change-transform",
          "[transition:transform_550ms_cubic-bezier(0.22,1,0.36,1),box-shadow_400ms_ease-out,outline-color_300ms_ease-out]",
          "ring-[3px] ring-primary/50 hover:ring-primary",
          "shadow-lg shadow-primary/10 hover:shadow-2xl hover:shadow-primary/30",
          // Smooth gravitate-toward-center + scale on hover/focus
          "hover:[transform:translate3d(calc(var(--pull-x)*0.28),calc(var(--pull-y)*0.28),0)_scale(var(--hover-scale))]",
          "focus-visible:[transform:translate3d(calc(var(--pull-x)*0.28),calc(var(--pull-y)*0.28),0)_scale(var(--hover-scale))]",
          // Reduced motion: scale only, no translation
          "motion-reduce:hover:[transform:scale(1.06)] motion-reduce:focus-visible:[transform:scale(1.06)]",
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
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 group-hover:scale-110",
              i === imgIndex ? "opacity-100" : "opacity-0"
            )}
            loading="lazy"
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
        <p className="text-xs text-muted-foreground leading-snug mt-1 line-clamp-2">
          {dest.tagline}
        </p>
      </div>
    </div>
  );
};

export const HeroDestinationConstellation = () => {
  const { isPortrait: isMobile } = useIsPortraitMode();
  const { hasWods, bodyweightWod, equipmentWod, variousWod, allTodayWods } =
    useTodayWods(true);

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

  // Constellation stage center — bubbles gravitate toward this point on hover.
  const STAGE_CX = 1300 / 2;
  const STAGE_CY = 650 / 2;

  // Coach bubble occupies the center; cap each bubble's pull so its hovered
  // edge never touches the coach circle (prevents WOD/coach collision).
  const COACH_RADIUS = COACH.desktop.size / 2;
  const SAFE_GAP = 18; // px of breathing room around the coach
  const HOVER_PULL_RATIO = 0.28; // matches the CSS transform multiplier

  const featured = DESTINATIONS.find((d) => d.featured)!;
  const others = DESTINATIONS.filter((d) => !d.featured);

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
          className="relative mx-auto"
          style={{ width: "100%", maxWidth: "1300px", height: "650px" }}
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

          {DESTINATIONS.map((dest) => {
            const c = centers[dest.id];
            const dx = STAGE_CX - c.cx;
            const dy = STAGE_CY - c.cy;
            const dist = Math.hypot(dx, dy) || 1;
            // Hovered bubble (after scale) needs to stop before touching the coach.
            const bubbleHoverRadius = (dest.desktop.size / 2) * (dest.featured ? 1.1 : 1.18);
            const maxTravel = Math.max(0, dist - COACH_RADIUS - bubbleHoverRadius - SAFE_GAP);
            const desiredTravel = dist * HOVER_PULL_RATIO;
            const allowedTravel = Math.min(desiredTravel, maxTravel);
            const scale = allowedTravel / dist; // shrink the pull vector to a safe magnitude
            // Reverse the CSS multiplier so the final transform = dx*scale, dy*scale.
            const pullX = (dx * scale) / HOVER_PULL_RATIO;
            const pullY = (dy * scale) / HOVER_PULL_RATIO;
            return (
              <Bubble
                key={dest.id}
                dest={dest}
                isWodLive={hasWods}
                size={dest.desktop.size}
                pullX={pullX}
                pullY={pullY}
                cycleImages={dest.featured ? wodCycleImages : undefined}
                className="absolute"
                style={{
                  top: `${dest.desktop.top}px`,
                  left: `${dest.desktop.left}px`,
                }}
              />
            );
          })}

          {/* Center coach bubble */}
          <Bubble
            dest={COACH}
            isWodLive={false}
            size={COACH.desktop.size}
            pullX={0}
            pullY={0}
            className="absolute"
            style={{
              top: `${COACH.desktop.top}px`,
              left: `${COACH.desktop.left}px`,
            }}
          />
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