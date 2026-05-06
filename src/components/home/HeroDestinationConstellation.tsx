import { useNavigate } from "react-router-dom";
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
    desktop: { top: 0, left: 380, size: 200 },
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
    desktop: { top: 60, left: 720, size: 170 },
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
    desktop: { top: 60, left: 90, size: 170 },
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
    desktop: { top: 270, left: 0, size: 150 },
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
    desktop: { top: 270, left: 830, size: 150 },
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
    desktop: { top: 410, left: 280, size: 130 },
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
    desktop: { top: 410, left: 570, size: 130 },
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
  desktop: { top: 215, left: 405, size: 150 },
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
}: {
  dest: Destination;
  isWodLive: boolean;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  pullX?: number;
  pullY?: number;
}) => {
  const navigate = useNavigate();
  const Icon = dest.icon;
  const showLivePill = dest.featured && isWodLive;
  const labelMaxWidth = Math.max(size + 40, 130);
  // Featured WOD is already prominent — gentler scale.
  const hoverScale = dest.featured ? 1.1 : 1.18;

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
          // Pause idle float while hovering so the gravitation reads cleanly
          "hover:[animation-play-state:paused] focus-visible:[animation-play-state:paused]",
          // Reduced motion: scale only, no translation
          "motion-reduce:hover:[transform:scale(1.06)] motion-reduce:focus-visible:[transform:scale(1.06)]",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary",
          "motion-safe:animate-[float_6s_ease-in-out_infinite]",
          dest.featured && "ring-4 ring-primary"
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: dest.delay,
        }}
      >
        <img
          src={dest.image}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
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
  const { hasWods } = useTodayWods(isMobile);

  // Find bubble center coords for connection lines (desktop)
  const centers: Record<string, { cx: number; cy: number }> = {};
  DESTINATIONS.forEach((d) => {
    centers[d.id] = {
      cx: d.desktop.left + d.desktop.size / 2,
      cy: d.desktop.top + d.desktop.size / 2,
    };
  });

  // Constellation stage center — bubbles gravitate toward this point on hover.
  const STAGE_CX = 980 / 2;
  const STAGE_CY = 590 / 2;

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
          style={{ width: "100%", maxWidth: "980px", height: "590px" }}
        >
          {/* Decorative connection SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 980 590"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="constellation-glow" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="980" height="590" fill="url(#constellation-glow)" />
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
            return (
              <Bubble
                key={dest.id}
                dest={dest}
                isWodLive={hasWods}
                size={dest.desktop.size}
                pullX={STAGE_CX - c.cx}
                pullY={STAGE_CY - c.cy}
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
          <Bubble dest={featured} isWodLive={hasWods} size={150} />

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