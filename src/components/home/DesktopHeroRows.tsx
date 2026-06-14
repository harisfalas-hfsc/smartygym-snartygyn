import { useNavigate } from "react-router-dom";
import { ChevronRight, Dumbbell, Calendar, Newspaper, Wrench, Clock, Calculator, Flame, Activity } from "lucide-react";
import { getBlogArticleImage } from "@/utils/blogImages";
import { cn } from "@/lib/utils";
import heroWorkoutsImage from "@/assets/hero-workouts-bright.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
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

type DesktopHeroRowsProps = {
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

export const DesktopHeroRows = ({ workouts, programs, articles, workoutCategoryToSlug, programCategoryToSlug }: DesktopHeroRowsProps) => {
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

  const rows: Array<{
    key: string;
    title: string;
    image: string;
    route: string;
    icon: any;
    items: FeaturedItem[];
    emptyLabel: string;
    ctaLabel: string;
  }> = [
    { key: "workouts", title: "Smarty Workouts", image: heroWorkoutsImage, route: "/workout", icon: Dumbbell, items: workoutItems, emptyLabel: "Featured workouts", ctaLabel: "Explore all workouts" },
    { key: "programs", title: "Smarty Programs", image: heroProgramsImage, route: "/trainingprogram", icon: Calendar, items: programItems, emptyLabel: "Featured programs", ctaLabel: "Explore all programs" },
    { key: "blog", title: "Smarty Blog", image: heroBlogImage, route: "/blog", icon: Newspaper, items: articleItems, emptyLabel: "Latest articles", ctaLabel: "Read the blog" },
    { key: "tools", title: "Smarty Tools", image: heroToolsImage, route: "/tools", icon: Wrench, items: toolsFeatured, emptyLabel: "Featured tools", ctaLabel: "Open all tools" },
  ];

  return (
    <section className="container mx-auto max-w-6xl md:max-w-[1500px] px-4 md:px-6 pt-3 pb-6">
      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <article
              key={row.key}
              className="grid grid-cols-[280px_1fr] gap-3 border-2 border-primary/40 rounded-2xl overflow-hidden bg-card hover:border-primary transition-colors"
            >
              {/* Pillar tile */}
              <button
                type="button"
                onClick={() => navigate(row.route)}
                className="relative h-[150px] group overflow-hidden text-left"
                aria-label={row.ctaLabel}
              >
                <img
                  src={row.image}
                  alt={row.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/15" />
                <div className="relative h-full flex flex-col justify-between p-4 text-white">
                  <div className="inline-flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/90">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary">Featured</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold leading-tight uppercase tracking-tight">{row.title}</h2>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      {row.ctaLabel}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>

              {/* Featured items */}
              <div className="grid grid-cols-3 gap-2 p-2">
                {row.items.length > 0 ? (
                  row.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.route)}
                      className="group flex flex-col bg-background border border-primary/20 rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition-all text-left"
                      aria-label={item.title}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 px-2.5 py-2">
                        <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2">{item.title}</h3>
                        {item.meta && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.meta}</p>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center text-xs text-muted-foreground py-6">
                    Loading {row.emptyLabel.toLowerCase()}…
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};