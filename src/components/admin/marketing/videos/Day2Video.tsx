import { VideoBrandingOverlay } from "./VideoBrandingOverlay";
import { PhoneMockup } from "./PhoneMockup";
import harisPhoto from "@/assets/haris-falas-coach.png";

interface Day2VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day2Video = ({ currentTime }: Day2VideoProps) => {
  // Scene timings in milliseconds - 20 seconds total
  const scenes = {
    intro: { start: 0, end: 3000 },
    coach: { start: 3000, end: 9000 },
    creds: { start: 9000, end: 15000 },
    promise: { start: 15000, end: 18000 },
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
    intro: {
      headline: "Meet your coach",
      sub: "The expert behind every workout",
      bullets: ["Sports Scientist", "CSCS Certified", "20+ years experience"],
    },
    coach: {
      headline: "Haris Falas",
      sub: "Sports Scientist",
      bullets: ["Strength & conditioning", "Performance programming", "Real coaching"],
    },
    creds: {
      headline: "Credentials",
      sub: "Proven expertise",
      bullets: ["CSCS", "Sports Science", "20+ Years"],
    },
    promise: {
      headline: "100% Human",
      sub: "0% AI",
      bullets: ["Real expertise", "Real results", "No shortcuts"],
    },
    cta: {
      headline: "Train with Haris",
      sub: "Start today",
      bullets: ["Structured programs", "Progressive workouts", "Stay consistent"],
    },
  };

  const scene = data[activeKey];

  return (
    <VideoBrandingOverlay tagline="Meet the Expert Behind Every Workout">
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
            <div className="relative h-full w-full">
              <img
                src={harisPhoto}
                alt="Coach Haris Falas"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="rounded-xl border border-border bg-background/70 backdrop-blur-sm p-3">
                  <p className="text-sm font-extrabold text-foreground">Haris Falas</p>
                  <p className="text-xs font-semibold text-primary">Sports Scientist • CSCS</p>
                </div>
              </div>
            </div>
          </PhoneMockup>

          {/* Sliding bullets */}
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
                opacity: p > 0.25 ? 1 : 0,
                transform: p > 0.25 ? "scale(1)" : "scale(0.92)",
                transition: "all 420ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Start Training
            </div>
          ) : null}
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};

