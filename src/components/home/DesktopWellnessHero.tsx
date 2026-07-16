import { ArrowRight, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
const heroVideo = "/__l5e/assets-v1/7be581a5-fc6d-4952-b7bf-7cf0c4c6abf3/hero-couple-home-workout.mp4";
import heroWorkoutsImage from "@/assets/hero-workouts-bright.jpg";
import heroProgramsImage from "@/assets/hero-programs.jpg";
import heroBlogImage from "@/assets/hero-blog.jpg";
import heroToolsImage from "@/assets/hero-tools.jpg";
import smartyGymIcon from "@/assets/smarty-gym-icon-noborder.png";

/**
 * Desktop-only wellness-style landing:
 * fullscreen looping video hero followed by four alternating brand sections
 * (Workouts, Programs, Blog, Tools). Mirrors the SMARTY WELLNESS layout.
 */
export const DesktopWellnessHero = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: "workouts",
      image: heroWorkoutsImage,
      tag: "Train",
      name: "Smarty Workouts",
      accentWord: "Workouts",
      route: "/workout",
      cta: "Explore Workouts",
      accent: "#4CAF50",
      description:
        "Expert-designed, single-session workouts for every goal — strength, conditioning, mobility, HIIT, recovery and more. 100% human-designed by Sports Scientist Haris Falas. Filter by equipment, difficulty and duration, and train anywhere with clear coaching cues and video demos for every exercise.",
    },
    {
      id: "programs",
      image: heroProgramsImage,
      tag: "Progress",
      name: "Smarty Programs",
      accentWord: "Programs",
      route: "/trainingprogram",
      cta: "Explore Programs",
      accent: "#29B6D2",
      description:
        "Structured multi-week training programs that take you from where you are to where you want to be. Strength, hypertrophy, fat loss, athletic performance, mobility and beginner-friendly plans — periodized week by week and built for real life, not the gym floor only.",
    },
    {
      id: "blog",
      image: heroBlogImage,
      tag: "Learn",
      name: "Smarty Blog",
      accentWord: "Blog",
      route: "/blog",
      cta: "Read the Blog",
      accent: "#4CAF50",
      description:
        "Evidence-based articles on training, recovery, nutrition, longevity and mindset — written for people who want the real 'why' behind their programs. No hype, no trends, no shortcuts: just clear, science-based guidance from a working coach.",
    },
    {
      id: "tools",
      image: heroToolsImage,
      tag: "Measure",
      name: "Smarty Tools",
      accentWord: "Tools",
      route: "/tools",
      cta: "Open the Tools",
      accent: "#29B6D2",
      description:
        "A growing toolbox to plan, track and understand your training — 1RM calculator, macro & calorie calculators, BMR, workout timer (HIIT · Tabata · EMOM), rounds tracker and more. Fast, mobile-friendly, and free to use for everyone.",
    },
  ];

  return (
    <div className="hidden md:block">
      {/* HERO — fullscreen video */}
      <section className="relative w-full h-screen overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
          poster={heroWorkoutsImage}
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative z-10 h-full flex items-center px-6 lg:px-0">
          <div className="w-full max-w-7xl mx-auto">
            <div className="max-w-2xl text-left lg:ml-16 xl:ml-24">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={smartyGymIcon}
                  alt="SmartyGym"
                  className="w-20 h-20 object-contain"
                />
              </div>
              <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Your Gym Re-imagined.
                <br />
                Anywhere, Anytime.
              </h1>
              <p className="mt-6 max-w-xl text-white/90 text-base md:text-lg leading-relaxed">
                Expert-designed workouts, structured programs, blog insights and smart tools —{" "}
                <span className="font-bold">100% Human</span>,{" "}
                <span className="font-bold text-red-400">0% AI</span>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/smarty-premium")}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-primary hover:gap-3 transition-all"
                >
                  Get Premium <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/workout")}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white border border-white/60 hover:bg-white/10 hover:gap-3 transition-all"
                >
                  Browse Workouts <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <a
          href="#wellness-sections"
          aria-label="Scroll to sections"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown className="w-8 h-8" />
        </a>
      </section>

      {/* Brand sections */}
      <div id="wellness-sections">
        {sections.map((s, idx) => {
          const reverse = idx % 2 === 1;
          return (
            <section
              key={s.id}
              id={s.id}
              className="border-t border-border/40 bg-background"
            >
              <div
                className={`max-w-7xl mx-auto px-6 lg:px-8 py-8 lg:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => navigate(s.route)}
                  aria-label={s.name}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl block"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </button>

                <div>
                  <div
                    className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]"
                    style={{ color: s.accent }}
                  >
                    <span
                      className="h-px w-6"
                      style={{ backgroundColor: s.accent }}
                    />
                    {s.tag}
                  </div>
                  <h2 className="mt-4 text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                    Smarty{" "}
                    <span style={{ color: s.accent }}>{s.accentWord}</span>
                  </h2>
                  <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
                    {s.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(s.route)}
                    className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:gap-3"
                    style={{ backgroundColor: s.accent }}
                  >
                    {s.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
