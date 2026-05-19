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
import { ChevronRight, ChevronLeft } from "lucide-react";
import heroBannerVideo from "@/assets/hero-banner-video.mp4.asset.json";
import heroBannerVideoPark from "@/assets/hero-banner-video-park.mp4.asset.json";
import heroBannerVideoLivingroom from "@/assets/hero-banner-video-livingroom.mp4.asset.json";
import { useIsPortraitMode } from "@/hooks/useIsPortraitMode";
import type { WorkoutData } from "@/hooks/useWorkoutData";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Layers } from "lucide-react";

import heroWodImage from "@/assets/hero-wod.jpg";
import heroWorkoutsImage from "@/assets/hero-workouts-bright.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import heroLibraryImage from "@/assets/hero-exercise-library-new.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroCommunityImage from "@/assets/hero-community-new.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type RotatingLink = {
  id: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  route: string;
};

const ROTATING_LINKS: RotatingLink[] = [
  { id: "wod",       title: "Workout of the Day", tagline: "Today's featured session",   icon: CalendarCheck, route: "/workout/wod" },
  { id: "workouts",  title: "Smarty Workouts",    tagline: "500+ expert sessions",       icon: Dumbbell,      route: "/workout" },
  { id: "programs",  title: "Smarty Programs",    tagline: "Multi-week training plans",  icon: Calendar,      route: "/trainingprogram" },
  { id: "library",   title: "Exercise Library",   tagline: "Form & technique videos",    icon: Video,         route: "/exerciselibrary" },
  { id: "blog",      title: "Blog & Insights",    tagline: "Evidence-based articles",    icon: FileText,      route: "/blog" },
  { id: "tools",     title: "Smarty Tools",       tagline: "Calculators & timers",       icon: Calculator,    route: "/tools" },
  { id: "community", title: "Community",          tagline: "Train together",             icon: Users,         route: "/community" },
];

const RotatingLinkBanner = () => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(false);
  const dragStartX = useRef<number | null>(null);
  const dragDeltaX = useRef(0);
  const draggedRef = useRef(false);

  const goPrev = () => setIndex((i) => (i - 1 + ROTATING_LINKS.length) % ROTATING_LINKS.length);
  const goNext = () => setIndex((i) => (i + 1) % ROTATING_LINKS.length);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    dragDeltaX.current = 0;
    draggedRef.current = false;
    setPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    dragDeltaX.current = e.clientX - dragStartX.current;
    if (Math.abs(dragDeltaX.current) > 5) draggedRef.current = true;
  };
  const handlePointerEnd = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const dx = dragDeltaX.current;
    const threshold = 40;
    if (dx > threshold) goPrev();
    else if (dx < -threshold) goNext();
    dragStartX.current = null;
    dragDeltaX.current = 0;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    setPaused(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion.current) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ROTATING_LINKS.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [paused]);

  if (prefersReducedMotion.current) {
    return (
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
        {ROTATING_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => navigate(link.route)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-md border border-white/20 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              <Icon className="w-3.5 h-3.5" />
              {link.title}
            </button>
          );
        })}
      </div>
    );
  }

  const current = ROTATING_LINKS[index];
  const Icon = current.icon;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
      className="w-full max-w-md select-none relative"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous destination"
          className="flex-shrink-0 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/30 text-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClick={(e) => {
            if (draggedRef.current) {
              e.preventDefault();
              return;
            }
            navigate(current.route);
          }}
          key={current.id}
          className={cn(
            "group flex-1 min-w-0 flex items-center gap-4 px-5 py-4 rounded-2xl touch-pan-y cursor-grab active:cursor-grabbing",
            "bg-black/50 backdrop-blur-xl border border-white/25",
            "shadow-2xl shadow-black/40",
            "hover:bg-black/65 hover:border-primary transition-all",
            "animate-fade-in text-left"
          )}
        >
          <span className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/25 ring-2 ring-primary/60 flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-base lg:text-lg font-bold text-white leading-tight truncate drop-shadow">
              {current.title}
            </span>
            <span className="block text-xs lg:text-sm text-white/80 truncate">
              {current.tagline}
            </span>
          </span>
          <ChevronRight className="w-5 h-5 text-white flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next destination"
          className="flex-shrink-0 w-9 h-9 rounded-full bg-black/45 backdrop-blur-md border border-white/30 text-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {ROTATING_LINKS.map((link, i) => (
          <button
            key={link.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${link.title}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const DesktopVideoHero = ({ width, height }: { width: number; height: number }) => {
  const VIDEOS = [heroBannerVideo.url, heroBannerVideoPark.url, heroBannerVideoLivingroom.url];
  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const [activeLayer, setActiveLayer] = useState<"A" | "B">("A");
  const [srcA, setSrcA] = useState(VIDEOS[0]);
  const [srcB, setSrcB] = useState(VIDEOS[1]);
  const indexRef = useRef(0);
  const transitioningRef = useRef(false);

  // Crossfade when the current video is near its end
  const handleTimeUpdate = (which: "A" | "B") => () => {
    if (transitioningRef.current) return;
    if (which !== activeLayer) return;
    const v = which === "A" ? videoARef.current : videoBRef.current;
    if (!v || !v.duration || isNaN(v.duration)) return;
    const remaining = v.duration - v.currentTime;
    if (remaining > 0.6) return;

    transitioningRef.current = true;
    const nextIndex = (indexRef.current + 1) % VIDEOS.length;
    const afterNextIndex = (nextIndex + 1) % VIDEOS.length;
    const nextSrc = VIDEOS[nextIndex];
    const afterNextSrc = VIDEOS[afterNextIndex];

    if (which === "A") {
      // B should already hold nextSrc and be ready
      const bv = videoBRef.current;
      if (bv) {
        bv.currentTime = 0;
        bv.play().catch(() => {});
      }
      setActiveLayer("B");
      // Preload the following video into A
      window.setTimeout(() => {
        setSrcA(afterNextSrc);
        transitioningRef.current = false;
      }, 800);
    } else {
      const av = videoARef.current;
      if (av) {
        av.currentTime = 0;
        av.play().catch(() => {});
      }
      setActiveLayer("A");
      window.setTimeout(() => {
        setSrcB(afterNextSrc);
        transitioningRef.current = false;
      }, 800);
    }
    indexRef.current = nextIndex;
  };

  return (
    <div className="mx-auto" style={{ width: `${width}px`, maxWidth: "100%" }}>
      <div
        className="relative rounded-2xl overflow-hidden ring-1 ring-border/60 shadow-2xl shadow-primary/15"
        style={{ height: `${height}px` }}
      >
        <video
          ref={videoARef}
          src={srcA}
          autoPlay
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate("A")}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
            activeLayer === "A" ? "opacity-100" : "opacity-0"
          )}
        />
        <video
          ref={videoBRef}
          src={srcB}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate("B")}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
            activeLayer === "B" ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Readability gradient — lighter so video stays vivid in light mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" aria-hidden="true" />

        {/* Brand message — centered at top, no backdrop so the video stays visible */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-center pt-5 px-6 pointer-events-none">
          <div
            className="text-center"
            style={{
              textShadow:
                "0 1px 2px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.7)",
            }}
          >
            <h2 className="text-white text-2xl lg:text-4xl font-extrabold leading-tight tracking-tight">
              100% Human. <span className="text-red-500">0% AI.</span>
            </h2>
            <p className="text-white text-sm lg:text-base font-semibold mt-1 max-w-xl mx-auto">
              SmartyGym workouts and programs are built to fit YOUR life.
            </p>
          </div>
        </div>

        {/* Destination cards — overlaid at bottom of video */}
        <div className="absolute inset-x-0 bottom-4 px-4">
          <DesktopCardCarousel cardHeight={Math.max(80, Math.round(height / 5))} />
        </div>
      </div>
    </div>
  );
};

type DesktopCardItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  image: string;
};

const DESKTOP_CARDS: DesktopCardItem[] = [
  { id: "workouts",  title: "Smarty Workouts",   description: "500+ expert sessions",      icon: Dumbbell,      route: "/workout",          image: heroWorkoutsImage },
  { id: "programs",  title: "Smarty Programs",   description: "Multi-week training plans", icon: Calendar,      route: "/trainingprogram",  image: heroProgramsImage },
  { id: "library",   title: "Exercise Library",  description: "Form & technique videos",   icon: Video,         route: "/exerciselibrary",  image: heroLibraryImage },
  { id: "wod",       title: "Workout of the Day",description: "Today's featured session",  icon: CalendarCheck, route: "/workout/wod",      image: heroWodImage },
  { id: "blog",      title: "Blog & Insights",   description: "Evidence-based articles",   icon: FileText,      route: "/blog",             image: heroBlogImage },
  { id: "tools",     title: "Smarty Tools",      description: "Calculators & timers",      icon: Calculator,    route: "/tools",            image: heroToolsImage },
  { id: "community", title: "Community",         description: "Train together",            icon: Users,         route: "/community",        image: heroCommunityImage },
];

const DesktopCardCarousel = ({ width, cardHeight }: { width?: number; cardHeight: number }) => {
  const navigate = useNavigate();
  const autoplayRef = useRef(Autoplay({ delay: 3500, stopOnInteraction: false, stopOnMouseEnter: true }));
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(3);
  const wodIndex = DESKTOP_CARDS.findIndex((c) => c.id === "wod");

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <div className="mx-auto" style={width ? { width: `${width}px`, maxWidth: "100%" } : undefined}>
      <Carousel
        setApi={setApi}
        opts={{ align: "center", loop: true, dragFree: false, startIndex: wodIndex }}
        plugins={[autoplayRef.current]}
        className="w-full px-20"
        onMouseEnter={() => autoplayRef.current.stop()}
        onMouseLeave={() => autoplayRef.current.play()}
      >
        <CarouselContent className="-ml-3">
          {DESKTOP_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <CarouselItem key={card.id} className="pl-3 basis-1/3">
                <button
                  type="button"
                  onClick={() => navigate(card.route)}
                  className={cn(
                    "relative w-full overflow-hidden rounded-xl border-2 border-white/40",
                    "hover:border-primary hover:shadow-xl hover:scale-[1.03]",
                    "transition-all duration-300 ease-out group"
                  )}
                  style={{ height: `${cardHeight}px` }}
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-white text-xs font-semibold truncate drop-shadow">{card.title}</h3>
                      <p className="text-white/85 text-[10px] truncate">{card.description}</p>
                    </div>
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-background/95 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </span>
                  </div>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="left-2 w-14 h-14 [&_svg]:w-6 [&_svg]:h-6 border-white/30 bg-black/60 text-white hover:bg-primary hover:text-primary-foreground z-20" />
        <CarouselNext className="right-2 w-14 h-14 [&_svg]:w-6 [&_svg]:h-6 border-white/30 bg-black/60 text-white hover:bg-primary hover:text-primary-foreground z-20" />
      </Carousel>
      <div className="flex justify-center gap-1.5 mt-2">
        {DESKTOP_CARDS.map((card, i) => (
          <button
            key={card.id}
            type="button"
            onClick={() => api?.scrollTo(i)}
            aria-label={`Go to ${card.title}`}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === current ? "w-6 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
};
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
    desktop: { top: 15, left: 530, size: 240 },
    delay: "0s",
    featured: true,
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
    desktop: { top: 430, left: 280, size: 190 },
    delay: "0.3s",
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
    desktop: { top: 430, left: 840, size: 190 },
    delay: "1.8s",
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
  desktop: { top: 310, left: 575, size: 150 },
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
  cycleImages,
}: {
  dest: Destination;
  isWodLive: boolean;
  size: number;
  className?: string;
  style?: React.CSSProperties;
  cycleImages?: string[];
}) => {
  const navigate = useNavigate();
  const Icon = dest.icon;
  const showLivePill = dest.featured && isWodLive;
  const labelMaxWidth = Math.max(size + 40, 130);
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

/** Bento grid layout for desktop — expands side cards to page edges while preserving equal 20px gaps. */
const getBentoLayout = (stageWidth: number): Record<string, { top: number; left: number; width: number; height: number }> => {
  const gap = 20;
  const edgeGap = 20;
  const wodWidth = 580;
  const sideWidth = Math.max(320, (stageWidth - edgeGap * 2 - gap * 2 - wodWidth) / 2);
  const leftX = edgeGap;
  const wodX = leftX + sideWidth + gap;
  const rightX = wodX + wodWidth + gap;

  return {
    workouts:  { top:  20, left: leftX, width: sideWidth, height: 232 },
    blog:      { top: 272, left: leftX, width: sideWidth, height: 113 },
    library:   { top: 405, left: leftX, width: sideWidth, height: 113 },
    wod:       { top:  20, left: wodX, width: wodWidth, height: 495 },
    programs:  { top:  20, left: rightX, width: sideWidth, height: 146 },
    tools:     { top: 186, left: rightX, width: sideWidth, height: 200 },
    community: { top: 406, left: rightX, width: sideWidth, height: 113 },
  };
};

const BentoTile = ({
  dest,
  isWodLive,
  width,
  height,
  className,
  style,
  cycleImages,
  cycleWods,
}: {
  dest: Destination;
  isWodLive: boolean;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
  cycleImages?: string[];
  cycleWods?: WorkoutData[];
}) => {
  const navigate = useNavigate();
  const Icon = dest.icon;
  const showLivePill = dest.featured && isWodLive;

  const images = cycleImages && cycleImages.length > 0 ? cycleImages : [dest.image];
  const [imgIndex, setImgIndex] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setImgIndex((i) => (i + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [images.length]);

  const activeWod = cycleWods && cycleWods.length > 0
    ? cycleWods[imgIndex % cycleWods.length]
    : undefined;

  // Fixed icon chip size across all bento tiles (matches Tools card sizing).
  const chipSize = 46;
  const iconSize = 26;

  // Today's date label for the featured (WOD) header band.
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const hoverScale = dest.featured ? 1.015 : 1.025;

  return (
    <div
      className={cn("group", className)}
      style={style}
    >
      <span className="block">
        <button
          type="button"
          onClick={() => navigate(dest.route)}
          aria-label={`Go to ${dest.title}`}
          className={cn(
            "relative block rounded-2xl overflow-hidden text-left transform-gpu will-change-transform",
            "[transition:transform_450ms_cubic-bezier(0.22,1,0.36,1),box-shadow_400ms_ease-out,outline-color_300ms_ease-out]",
            "ring-1 ring-border/60 shadow-lg shadow-primary/10",
            "hover:ring-primary hover:shadow-2xl hover:shadow-primary/30",
            "motion-safe:hover:[transform:scale(var(--bento-hover-scale))] motion-safe:focus-visible:[transform:scale(var(--bento-hover-scale))]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            dest.featured && "ring-4 ring-primary shadow-2xl shadow-primary/40"
          )}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            ["--bento-hover-scale" as any]: hoverScale,
          } as React.CSSProperties}
        >
          {/* Image layer with hover zoom */}
          <div className="absolute inset-0 overflow-hidden transition-transform duration-700 ease-out motion-safe:group-hover:scale-105">
          {images.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                i === imgIndex ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          </div>
          {/* Bottom gradient for label legibility — image-independent dark scrim */}
          {dest.featured ? (
            <div
              className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-500 group-hover:opacity-95"
              aria-hidden="true"
            />
          ) : (
            <div
              className={cn(
                "absolute inset-0 transition-opacity duration-500 group-hover:opacity-90",
                activeWod
                  ? "bg-gradient-to-t from-black/65 via-black/20 to-transparent"
                  : "bg-gradient-to-t from-black/70 via-black/15 to-transparent"
              )}
              aria-hidden="true"
            />
          )}

          {/* Featured pulsing ring */}
          {dest.featured && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-primary opacity-60 motion-safe:animate-pulse"
            />
          )}

          {/* Prominent header band on the WOD (featured) tile — frosted dark bar, image-independent */}
          {dest.featured && (
            <>
              <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-3 pb-3 bg-black/55 backdrop-blur-md border-b border-white/10 text-center">
                <h2 className="font-extrabold uppercase tracking-wide text-white text-xl md:text-2xl leading-tight [paint-order:stroke] [-webkit-text-stroke:1px_rgba(0,0,0,0.55)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                  Workout of the Day
                </h2>
                <p className="mt-0.5 text-white/90 text-xs md:text-sm font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                  {todayLabel}
                </p>
              </div>
              {/* Soft fade strip below the bar so it blends into the image */}
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 z-[9] h-6 bg-gradient-to-b from-black/40 to-transparent pointer-events-none"
                style={{ top: "calc(var(--wod-header-h, 64px))" }}
              />
            </>
          )}

          {/* Icon chip — top right (hidden on featured to avoid clashing with header) */}
          {!dest.featured && (
            <span
              className="absolute top-2 right-2 z-10 rounded-full bg-background/95 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-primary/60 transition-transform duration-300 ease-out motion-safe:group-hover:scale-110 motion-safe:group-hover:-translate-y-0.5"
              style={{ width: `${chipSize}px`, height: `${chipSize}px` }}
              aria-hidden="true"
            >
              <Icon className="text-primary" style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
            </span>
          )}

          {/* Label — bottom left */}
          {activeWod ? (
            <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2">
              <p className="font-extrabold text-white leading-tight text-2xl md:text-3xl line-clamp-2 [paint-order:stroke] [-webkit-text-stroke:1px_rgba(0,0,0,0.55)] drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
                {activeWod.name}
              </p>
              {activeWod.description && (
                <p className="text-white/95 text-sm leading-snug line-clamp-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                  {activeWod.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/&nbsp;/gi, " ")
                    .replace(/&amp;/gi, "&")
                    .replace(/&lt;/gi, "<")
                    .replace(/&gt;/gi, ">")
                    .replace(/&quot;/gi, '"')
                    .replace(/&#39;/gi, "'")
                    .replace(/\s+/g, " ")
                    .trim()}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeWod.category && (
                  <Badge className="bg-primary/90 text-primary-foreground border-0 gap-1">
                    <Layers className="w-3 h-3" />
                    {activeWod.category}
                  </Badge>
                )}
                {activeWod.difficulty && (
                  <Badge variant="secondary" className="bg-white/15 text-white border-white/20 gap-1 backdrop-blur-sm">
                    <Flame className="w-3 h-3" />
                    {activeWod.difficulty}
                  </Badge>
                )}
                {activeWod.duration && (
                  <Badge variant="secondary" className="bg-white/15 text-white border-white/20 gap-1 backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    {activeWod.duration}
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <p className="font-bold text-white leading-tight drop-shadow-lg text-base md:text-lg">
                {dest.short}
              </p>
              <p className="text-white/85 text-xs leading-tight drop-shadow-md mt-0.5 line-clamp-1">
                {dest.tagline}
              </p>
            </div>
          )}
        </button>
      </span>
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
  // Build the WOD cycle (ordered list of today's WOD objects + their images).
  const wodCycleData = (() => {
    const ordered = [bodyweightWod, equipmentWod, variousWod].filter(Boolean) as WorkoutData[];
    if (ordered.length > 0) return ordered;
    return (allTodayWods || []) as WorkoutData[];
  })();
  const wodCycleImages = wodCycleData
    .map((w) => w.image_url)
    .filter(Boolean) as string[];

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
  const [desktopStageWidth, setDesktopStageWidth] = useState(1300);
  useEffect(() => {
    const el = desktopWrapperRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      const stageWidth = Math.max(1300, w);
      setDesktopStageWidth(stageWidth);
      setDesktopScale(Math.min(1, w / stageWidth));
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

  const bentoLayout = getBentoLayout(desktopStageWidth);

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
        <div ref={desktopWrapperRef} className="w-full">
          <DesktopVideoHero
            width={(desktopStageWidth - 40) * desktopScale}
            height={Math.round(702 * desktopScale)}
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