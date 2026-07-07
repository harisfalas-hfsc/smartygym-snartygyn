import { useNavigate } from "react-router-dom";
import { ChevronRight, Dumbbell, Calendar, Newspaper, Wrench } from "lucide-react";
import { getBlogArticleImage } from "@/utils/blogImages";
import toolTimerImage from "@/assets/tools/timer-card-mobile.jpg";
import tool1RmImage from "@/assets/tools/1rm-card-mobile.jpg";
import toolMacroImage from "@/assets/tools/macro-card-mobile.jpg";

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

  const workoutItems: FeaturedItem[] = (workouts || []).slice(0, 3).map((w: any) => ({
    id: w.id,
    title: w.name,
    meta: [w.duration, w.difficulty].filter(Boolean).join(" · ") || w.category,
    image: w.image_url || "/images/workouts/wod-card-mobile.jpg",
    route: `/workout/${workoutCategoryToSlug(w.category)}/${w.id}`,
  }));

  const programItems: FeaturedItem[] = (programs || []).slice(0, 3).map((p: any) => ({
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
      className={`col-span-1 rounded-2xl border-2 ${borderClass} bg-card p-5 lg:p-6 flex flex-col h-full`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg lg:text-xl font-extrabold tracking-tight text-primary uppercase">
          Featured {title}
        </h2>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {(items.length > 0 ? items : Array.from({ length: 3 }).map(() => null)).map((item, idx) =>
          item ? (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.route)}
              className="group flex items-stretch bg-background border border-border rounded-xl overflow-hidden hover:border-green-500 hover:shadow-md transition-all text-left flex-1 min-h-[120px]"
              aria-label={item.title}
            >
              <div className="relative w-40 lg:w-48 flex-shrink-0 bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0 p-4 flex flex-col justify-center">
                <h3 className="text-base lg:text-lg font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                {item.meta && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.meta}</p>
                )}
              </div>
            </button>
          ) : (
            <div key={idx} className="flex items-stretch bg-background border border-border rounded-xl overflow-hidden flex-1 min-h-[120px]">
              <div className="w-40 lg:w-48 bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 p-4">
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
        className="mt-4 inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline self-start"
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
      className={`rounded-2xl border-2 ${borderClass} bg-card p-4 lg:p-5 flex flex-col h-full`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm lg:text-base font-extrabold tracking-tight text-primary uppercase">
          Featured {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {(items.length > 0 ? items.slice(0, 2) : Array.from({ length: 2 }).map(() => null)).map((item, idx) =>
          item ? (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.route)}
              className="group flex items-stretch bg-background border border-border rounded-lg overflow-hidden hover:border-green-500 hover:shadow-md transition-all text-left flex-1 min-h-[90px]"
              aria-label={item.title}
            >
              <div className="relative w-28 lg:w-32 flex-shrink-0 bg-muted overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                {item.meta && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.meta}</p>
                )}
              </div>
            </button>
          ) : (
            <div key={idx} className="flex items-stretch bg-background border border-border rounded-lg overflow-hidden flex-1 min-h-[90px]">
              <div className="w-28 lg:w-32 bg-muted animate-pulse flex-shrink-0" />
              <div className="flex-1 p-3">
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
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline self-start"
      >
        {ctaLabel}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </article>
  );

  return (
    <section className="hidden md:block container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pt-3 pb-6">
      <div className="grid grid-cols-3 gap-4 lg:gap-5 items-stretch">
        {bigCard("workouts", "Workouts", Dumbbell, workoutItems, "/workout", "Explore all workouts", "border-primary/40")}
        {bigCard("programs", "Programs", Calendar, programItems, "/trainingprogram", "Explore all programs", "border-primary/40")}
        <div className="col-span-1 flex flex-col gap-4 lg:gap-5 h-full">
          {smallCard("blog", "Blog", Newspaper, articleItems, "/blog", "Read the blog", "border-green-500/50")}
          {smallCard("tools", "Tools", Wrench, toolsFeatured, "/tools", "Open all tools", "border-green-500/50")}
        </div>
      </div>
    </section>
  );
};