import { useNavigate } from "react-router-dom";
import { ChevronRight, Dumbbell, Calendar, Newspaper, Wrench, Users, Trophy, MessageCircle, Star } from "lucide-react";
import { getBlogArticleImage } from "@/utils/blogImages";
import toolTimerImage from "@/assets/tools/timer-card-mobile.jpg";
import tool1RmImage from "@/assets/tools/1rm-card-mobile.jpg";
import toolMacroImage from "@/assets/tools/macro-card-mobile.jpg";
import heroCommunityCelebratingImage from "@/assets/hero-community-celebrating.jpg";

type FeaturedItem = {
  id: string;
  title: string;
  meta?: string;
  image: string;
  route: string;
};

type Props = {
  workouts: any[];
  programs: any[];
  articles: any[];
  workoutCategoryToSlug: (cat?: string | null) => string;
  programCategoryToSlug: (cat?: string | null) => string;
};

const toolsFeatured: FeaturedItem[] = [
  { id: "timer", title: "Workout Timer", meta: "HIIT · Tabata · EMOM", image: toolTimerImage, route: "/tools/workout-timer" },
  { id: "1rm", title: "1RM Calculator", meta: "Find your one-rep max", image: tool1RmImage, route: "/tools/1rm-calculator" },
  { id: "macro", title: "Macro Calculator", meta: "Personalized nutrition", image: toolMacroImage, route: "/tools/macro-calculator" },
];

export const DesktopFeaturedGrid = ({ workouts, programs, articles, workoutCategoryToSlug, programCategoryToSlug }: Props) => {
  const navigate = useNavigate();

  const workoutItems: FeaturedItem[] = (workouts || []).slice(0, 4).map((w: any) => ({
    id: w.id,
    title: w.name,
    meta: [w.duration, w.difficulty].filter(Boolean).join(" · ") || w.category,
    image: w.image_url || "/images/workouts/wod-card-mobile.jpg",
    route: `/workout/${workoutCategoryToSlug(w.category)}/${w.id}`,
  }));

  const programItems: FeaturedItem[] = (programs || []).slice(0, 4).map((p: any) => ({
    id: p.id,
    title: p.name,
    meta: [p.weeks ? `${p.weeks} weeks` : null, p.difficulty].filter(Boolean).join(" · ") || p.category,
    image: p.image_url || "/images/programs/functional-strength-card-mobile.jpg",
    route: `/trainingprogram/${programCategoryToSlug(p.category)}/${p.id}`,
  }));

  const articleItems: FeaturedItem[] = (articles || []).slice(0, 3).map((a: any) => ({
    id: a.id,
    title: a.title,
    meta: [a.read_time, a.category].filter(Boolean).join(" · "),
    image: getBlogArticleImage(a.image_url, a.slug),
    route: `/blog/${a.slug}.html`,
  }));

  const bigCard = (
    key: string,
    title: string,
    Icon: any,
    items: FeaturedItem[],
    route: string,
    ctaLabel: string,
    borderClass: string,
  ) => (
    <article
      key={key}
      className={`rounded-2xl border-2 ${borderClass} bg-card p-5 lg:p-6 flex flex-col`}
    >
      <div className="flex items-center gap-2 mb-4 min-h-[28px]">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg lg:text-xl font-extrabold tracking-tight text-primary uppercase">
          Featured {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        {(items.length > 0 ? items : Array.from({ length: 4 }).map(() => null)).map((item, idx) =>
          item ? (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.route)}
              className="group flex items-stretch bg-background border border-border rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md transition-all text-left min-h-[88px]"
              aria-label={item.title}
            >
              <div className="relative w-28 lg:w-36 flex-shrink-0 bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                <h3 className="text-sm lg:text-base font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                {item.meta && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.meta}</p>
                )}
              </div>
            </button>
          ) : (
            <div key={idx} className="flex items-stretch bg-background border border-border rounded-xl overflow-hidden min-h-[88px]">
              <div className="w-28 lg:w-36 bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 p-3">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded mt-2" />
              </div>
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate(route)}
        className="mt-4 inline-flex h-9 items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline self-start"
      >
        {ctaLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    </article>
  );

  const smallCard = (
    key: string,
    title: string,
    Icon: any,
    items: FeaturedItem[],
    route: string,
    ctaLabel: string,
    borderClass: string,
  ) => (
    <article
      key={key}
      className={`rounded-2xl border-2 ${borderClass} bg-card p-5 lg:p-6 flex flex-col h-full`}
    >
      <div className="flex items-center gap-2 mb-3 min-h-[24px]">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm lg:text-base font-extrabold tracking-tight text-primary uppercase">
          Featured {title}
        </h2>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {(items.length > 0 ? items.slice(0, 3) : Array.from({ length: 3 }).map(() => null)).map((item, idx) =>
          item ? (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.route)}
              className="group flex items-stretch bg-background border border-border rounded-lg overflow-hidden hover:border-green-500 hover:shadow-md transition-all text-left min-h-[66px]"
              aria-label={item.title}
            >
              <div className="relative w-20 lg:w-24 flex-shrink-0 bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-center">
                <h3 className="text-xs lg:text-sm font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                {item.meta && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.meta}</p>
                )}
              </div>
            </button>
          ) : (
            <div key={idx} className="flex items-stretch bg-background border border-border rounded-lg overflow-hidden min-h-[66px]">
              <div className="w-20 lg:w-24 bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 p-2.5">
                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-2.5 w-1/2 bg-muted animate-pulse rounded mt-1" />
              </div>
            </div>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={() => navigate(route)}
        className="mt-auto pt-4 inline-flex h-9 items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline self-start"
      >
        {ctaLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </article>
  );

  return (
    <section className="hidden md:block container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pt-3 pb-6">
      <div className="grid grid-cols-3 gap-4 lg:gap-5 items-stretch">
        <div className="col-span-2 flex flex-col gap-4 lg:gap-5 h-full">
          <div className="grid grid-cols-2 gap-4 lg:gap-5 items-start">
            {bigCard("workouts", "Workouts", Dumbbell, workoutItems, "/workout", "Explore all workouts", "border-primary/40")}
            {bigCard("programs", "Programs", Calendar, programItems, "/trainingprogram", "Explore all programs", "border-primary/40")}
          </div>
          <button
            type="button"
            onClick={() => navigate("/community")}
            className="group relative flex-1 min-h-[180px] rounded-2xl border-2 border-green-500/50 bg-card overflow-hidden text-left hover:border-green-500 hover:shadow-lg transition-all"
            aria-label="Join the SmartyGym Community"
          >
            <img
              src={heroCommunityCelebratingImage}
              alt="SmartyGym community celebrating together"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-card/40" />
            <div className="relative h-full flex flex-col justify-between p-5 lg:p-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg lg:text-xl font-extrabold tracking-tight text-primary uppercase">
                    Featured Community
                  </h2>
                </div>
                <p className="text-sm lg:text-base text-foreground/80 max-w-xl leading-snug">
                  Share progress, climb the leaderboards, and stay accountable with real people on the same journey.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground">
                    <Trophy className="h-3.5 w-3.5 text-primary" /> Leaderboards
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground">
                    <Star className="h-3.5 w-3.5 text-primary" /> Member reviews
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-semibold text-foreground">
                    <MessageCircle className="h-3.5 w-3.5 text-primary" /> Real support
                  </span>
                </div>
              </div>
              <span className="mt-4 inline-flex h-9 items-center gap-1 text-sm font-semibold text-primary group-hover:underline self-start">
                Join the community
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </button>
        </div>
        <div className="col-span-1 flex flex-col gap-4 lg:gap-5 h-full">
          {smallCard("blog", "Blog", Newspaper, articleItems, "/blog", "Read the blog", "border-green-500/50")}
          {smallCard("tools", "Tools", Wrench, toolsFeatured, "/tools", "Open all tools", "border-green-500/50")}
        </div>
      </div>
    </section>
  );
};