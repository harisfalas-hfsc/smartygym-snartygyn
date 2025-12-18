import { VideoBrandingOverlay } from "./VideoBrandingOverlay";
import { PhoneMockup } from "./PhoneMockup";

interface Day1VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day1Video = ({ currentTime }: Day1VideoProps) => {
  // Scene timings in milliseconds - 20 seconds total
  const scenes = {
    tagline: { start: 0, end: 4000 },
    features: { start: 4000, end: 9000 },
    human: { start: 9000, end: 14000 },
    categories: { start: 14000, end: 18000 },
    cta: { start: 18000, end: 20000 },
  };

  const getProgress = (scene: { start: number; end: number }) => {
    if (currentTime < scene.start) return 0;
    if (currentTime >= scene.end) return 1;
    return (currentTime - scene.start) / (scene.end - scene.start);
  };

  const activeKey = (Object.keys(scenes) as Array<keyof typeof scenes>).find((k) => {
    const s = scenes[k];
    return currentTime >= s.start && currentTime < s.end;
  }) ?? "cta";

  const activeScene = scenes[activeKey];
  const p = getProgress(activeScene);

  const bulletStyle = (i: number) => {
    const threshold = i * 0.22;
    const visible = p >= threshold;
    return {
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(48px)",
      transition: `all 520ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
    } as const;
  };

  const data: Record<keyof typeof scenes, { headline: string; sub?: string; bullets: string[] }> = {
    tagline: {
      headline: "What is SmartyGym?",
      sub: "Your personal training platform",
      bullets: ["Anywhere, anytime", "Built by real coaches", "Simple. Effective."],
    },
    features: {
      headline: "Everything you need",
      sub: "All in one app",
      bullets: ["500+ Workouts", "Training Programs", "Daily Rituals"],
    },
    human: {
      headline: "No AI workouts",
      sub: "Real expertise only",
      bullets: ["100% Human programming", "Coaches you can trust", "Results that last"],
    },
    categories: {
      headline: "Train your way",
      sub: "7 workout categories",
      bullets: ["Strength", "Cardio", "Mobility"],
    },
    cta: {
      headline: "Start today",
      sub: "Your gym—re-imagined",
      bullets: ["Download SmartyGym", "Train anywhere", "Stay consistent"],
    },
  };

  const scene = data[activeKey];

  return (
    <VideoBrandingOverlay tagline="Your Gym Re-imagined. Anywhere, Anytime.">
      <div className="relative w-full h-full flex items-center justify-center">
        <div
          key={activeKey}
          className="w-full h-full flex flex-col items-center justify-center gap-4 px-2 animate-fade-in"
        >
          {/* Headline */}
          <div className="text-center">
            <p className="text-lg font-extrabold text-foreground tracking-tight">
              {scene.headline}
            </p>
            {scene.sub ? (
              <p className="mt-1 text-sm font-semibold text-primary">{scene.sub}</p>
            ) : null}
          </div>

          {/* Phone */}
          <PhoneMockup>
            <div className="h-full w-full bg-gradient-to-b from-primary/15 to-background flex flex-col items-center justify-center p-5">
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">SmartyGym</p>
                <p className="mt-1 text-xs text-muted-foreground">Day {activeKey === "cta" ? "1" : "1"}</p>
              </div>
              <div className="mt-4 w-full rounded-xl border border-primary/30 bg-primary/10 p-3">
                <div className="h-2 w-24 rounded-full bg-primary/30" />
                <div className="mt-2 h-2 w-16 rounded-full bg-primary/20" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="h-10 rounded-lg bg-primary/10 border border-primary/20" />
                  <div className="h-10 rounded-lg bg-primary/10 border border-primary/20" />
                </div>
              </div>
            </div>
          </PhoneMockup>

          {/* Sliding bullets (like your example) */}
          <div className="w-full max-w-[260px] space-y-2">
            {scene.bullets.map((text, i) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 shadow-sm"
                style={bulletStyle(i)}
              >
                <span className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-sm font-semibold text-foreground">{text}</p>
              </div>
            ))}
          </div>

          {/* CTA pill */}
          {activeKey === "cta" ? (
            <div
              className="mt-1 bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-extrabold shadow-lg animate-pulse-glow"
              style={{
                opacity: p > 0.3 ? 1 : 0,
                transform: p > 0.3 ? "scale(1)" : "scale(0.92)",
                transition: "all 420ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Start Your Journey
            </div>
          ) : null}
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};

