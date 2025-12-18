import { cn } from "@/lib/utils";
import { VideoBrandingOverlay } from "./VideoBrandingOverlay";

interface Day1VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day1Video = ({ currentTime }: Day1VideoProps) => {
  // Scene timings in milliseconds
  const scenes = {
    tagline: { start: 0, end: 4000 },
    features: { start: 4000, end: 10000 },
    human: { start: 10000, end: 16000 },
    categories: { start: 16000, end: 22000 },
    cta: { start: 22000, end: 25000 },
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
            "absolute flex flex-col items-center justify-center p-4 transition-all duration-500",
            isInScene(scenes.tagline) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="text-center"
            style={{
              transform: isInScene(scenes.tagline) ? 'scale(1)' : 'scale(0.9)',
              transition: 'all 0.5s ease'
            }}
          >
            <p className="text-base font-bold text-foreground mb-1">What is SmartyGym?</p>
            <p className="text-xs text-muted-foreground">Your Personal Training Platform</p>
          </div>
        </div>

        {/* Scene 2: Features (4-10s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2 p-4 transition-all duration-500",
            isInScene(scenes.features) ? "opacity-100" : "opacity-0"
          )}
        >
          {['500+ Workouts', 'Training Programs', 'Daily Rituals'].map((feature, i) => (
            <div
              key={feature}
              className="bg-primary/20 border border-primary/40 rounded-lg px-4 py-2 w-full max-w-[160px]"
              style={{
                opacity: getProgress(scenes.features) > (i * 0.25) ? 1 : 0,
                transform: getProgress(scenes.features) > (i * 0.25) 
                  ? 'translateX(0)' 
                  : 'translateX(-30px)',
                transition: 'all 0.4s ease'
              }}
            >
              <p className="text-foreground font-semibold text-center text-xs">{feature}</p>
            </div>
          ))}
        </div>

        {/* Scene 3: 100% Human (10-16s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-4 transition-all duration-500",
            isInScene(scenes.human) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="text-center"
            style={{
              transform: isInScene(scenes.human) ? 'scale(1)' : 'scale(0.8)',
              transition: 'all 0.5s ease'
            }}
          >
            <p className="text-xl font-bold text-foreground mb-1">100% Human.</p>
            <p className="text-xl font-bold text-primary">0% AI.</p>
            <div className="mt-3 w-10 h-10 mx-auto rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-lg">👨‍💼</span>
            </div>
          </div>
        </div>

        {/* Scene 4: Categories (16-22s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2 p-3 transition-all duration-500",
            isInScene(scenes.categories) ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-foreground font-semibold text-xs mb-1">7 Workout Categories</p>
          <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
            {['Strength', 'Cardio', 'Metabolic', 'Mobility', 'Challenge', 'Calorie', 'WOD'].map((cat, i) => (
              <span
                key={cat}
                className="bg-primary/30 text-foreground text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  opacity: getProgress(scenes.categories) > (i * 0.12) ? 1 : 0,
                  transform: getProgress(scenes.categories) > (i * 0.12) 
                    ? 'scale(1)' 
                    : 'scale(0)',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Scene 5: CTA (22-25s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
            Start Your Journey 💪
          </div>
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};
