import { cn } from "@/lib/utils";
import { VideoBrandingOverlay } from "./VideoBrandingOverlay";

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

  const isInScene = (scene: { start: number; end: number }) =>
    currentTime >= scene.start && currentTime < scene.end;

  const getProgress = (scene: { start: number; end: number }) => {
    if (currentTime < scene.start) return 0;
    if (currentTime >= scene.end) return 1;
    return (currentTime - scene.start) / (scene.end - scene.start);
  };

  return (
    <VideoBrandingOverlay tagline="Your Gym Re-imagined. Anywhere, Anytime.">
      <div className="w-full h-full flex items-center justify-center overflow-hidden px-4">
        {/* Scene 1: Tagline emphasis (0-4s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-700",
            isInScene(scenes.tagline) 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-8"
          )}
        >
          <div className="text-center">
            <p 
              className="text-lg font-bold text-foreground mb-2"
              style={{
                animationDelay: '0.1s',
                opacity: isInScene(scenes.tagline) ? 1 : 0,
                transform: isInScene(scenes.tagline) ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              What is SmartyGym?
            </p>
            <p 
              className="text-base text-primary font-semibold"
              style={{
                opacity: getProgress(scenes.tagline) > 0.3 ? 1 : 0,
                transform: getProgress(scenes.tagline) > 0.3 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s'
              }}
            >
              Your Personal Training Platform
            </p>
          </div>
        </div>

        {/* Scene 2: Features (4-9s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2 transition-all duration-500",
            isInScene(scenes.features) ? "opacity-100" : "opacity-0"
          )}
        >
          {['500+ Workouts', 'Training Programs', 'Daily Rituals'].map((feature, i) => (
            <div
              key={feature}
              className="bg-primary/10 border-2 border-primary/60 rounded-xl px-5 py-2.5 shadow-lg"
              style={{
                opacity: getProgress(scenes.features) > (i * 0.25) ? 1 : 0,
                transform: getProgress(scenes.features) > (i * 0.25) 
                  ? 'translateX(0) scale(1)' 
                  : 'translateX(-40px) scale(0.9)',
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`
              }}
            >
              <p className="text-foreground font-bold text-center text-sm">{feature}</p>
            </div>
          ))}
        </div>

        {/* Scene 3: 100% Human (9-14s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-700",
            isInScene(scenes.human) ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-center">
            <p 
              className="text-2xl font-black text-foreground"
              style={{
                opacity: isInScene(scenes.human) ? 1 : 0,
                transform: isInScene(scenes.human) ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
            >
              100% Human.
            </p>
            <p 
              className="text-2xl font-black text-primary"
              style={{
                opacity: getProgress(scenes.human) > 0.2 ? 1 : 0,
                transform: getProgress(scenes.human) > 0.2 ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.15s'
              }}
            >
              0% AI.
            </p>
            <div 
              className="mt-3 w-12 h-12 mx-auto rounded-full border-3 border-primary bg-primary/20 flex items-center justify-center shadow-lg"
              style={{
                opacity: getProgress(scenes.human) > 0.4 ? 1 : 0,
                transform: getProgress(scenes.human) > 0.4 ? 'scale(1)' : 'scale(0)',
                transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s'
              }}
            >
              <span className="text-xl text-primary">✓</span>
            </div>
          </div>
        </div>

        {/* Scene 4: Categories (14-18s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2 transition-all duration-500",
            isInScene(scenes.categories) ? "opacity-100" : "opacity-0"
          )}
        >
          <p 
            className="text-foreground font-bold text-sm mb-1"
            style={{
              opacity: isInScene(scenes.categories) ? 1 : 0,
              transform: isInScene(scenes.categories) ? 'translateY(0)' : 'translateY(-15px)',
              transition: 'all 0.5s ease'
            }}
          >
            7 Workout Categories
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-[220px]">
            {['Strength', 'Cardio', 'Metabolic', 'Mobility', 'Challenge', 'Calorie', 'WOD'].map((cat, i) => (
              <span
                key={cat}
                className="bg-primary/15 border-2 border-primary/50 text-foreground text-xs px-3 py-1 rounded-full font-semibold"
                style={{
                  opacity: getProgress(scenes.categories) > (i * 0.12) ? 1 : 0,
                  transform: getProgress(scenes.categories) > (i * 0.12) 
                    ? 'scale(1)' 
                    : 'scale(0)',
                  transition: `all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) ${i * 0.08}s`
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Scene 5: CTA (18-20s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-pulse-glow"
            style={{
              opacity: isInScene(scenes.cta) ? 1 : 0,
              transform: isInScene(scenes.cta) ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
          >
            Start Your Journey 💪
          </div>
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};
