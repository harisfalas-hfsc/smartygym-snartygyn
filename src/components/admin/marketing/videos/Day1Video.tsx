import { cn } from "@/lib/utils";

interface Day1VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day1Video = ({ currentTime }: Day1VideoProps) => {
  // Scene timings in milliseconds
  const scenes = {
    logo: { start: 0, end: 3000 },
    tagline: { start: 3000, end: 7000 },
    features: { start: 7000, end: 12000 },
    human: { start: 12000, end: 18000 },
    categories: { start: 18000, end: 23000 },
    cta: { start: 23000, end: 25000 },
  };

  const isInScene = (scene: { start: number; end: number }) =>
    currentTime >= scene.start && currentTime < scene.end;

  const getProgress = (scene: { start: number; end: number }) => {
    if (currentTime < scene.start) return 0;
    if (currentTime >= scene.end) return 1;
    return (currentTime - scene.start) / (scene.end - scene.start);
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
      {/* Scene 1: Logo (0-3s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
          isInScene(scenes.logo) ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-4 animate-pulse">
          <span className="text-4xl font-bold text-primary">SG</span>
        </div>
        <h1 className="text-2xl font-bold text-white">SmartyGym</h1>
        <div 
          className="w-24 h-1 bg-primary mt-2 rounded-full"
          style={{ 
            transform: `scaleX(${getProgress(scenes.logo)})`,
            transformOrigin: 'left'
          }}
        />
      </div>

      {/* Scene 2: Tagline (3-7s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500",
          isInScene(scenes.tagline) ? "opacity-100" : "opacity-0"
        )}
      >
        <p 
          className="text-xl text-center text-white font-medium leading-relaxed"
          style={{
            transform: isInScene(scenes.tagline) ? 'translateY(0)' : 'translateY(20px)'
          }}
        >
          Your Gym Re-imagined.
        </p>
        <p 
          className="text-xl text-center text-primary font-bold mt-2"
          style={{
            opacity: getProgress(scenes.tagline) > 0.3 ? 1 : 0,
            transform: getProgress(scenes.tagline) > 0.3 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.5s ease'
          }}
        >
          Anywhere, Anytime.
        </p>
      </div>

      {/* Scene 3: Features (7-12s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 transition-all duration-500",
          isInScene(scenes.features) ? "opacity-100" : "opacity-0"
        )}
      >
        {['500+ Workouts', 'Training Programs', 'Daily Rituals'].map((feature, i) => (
          <div
            key={feature}
            className="bg-primary/20 border border-primary/40 rounded-lg px-6 py-3 w-full max-w-[200px]"
            style={{
              opacity: getProgress(scenes.features) > (i * 0.25) ? 1 : 0,
              transform: getProgress(scenes.features) > (i * 0.25) 
                ? 'translateX(0)' 
                : 'translateX(-50px)',
              transition: 'all 0.4s ease'
            }}
          >
            <p className="text-white font-semibold text-center">{feature}</p>
          </div>
        ))}
      </div>

      {/* Scene 4: 100% Human (12-18s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500",
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
          <p className="text-3xl font-bold text-white mb-2">100% Human.</p>
          <p className="text-3xl font-bold text-primary">0% AI.</p>
          <div className="mt-4 w-16 h-16 mx-auto rounded-full border-4 border-primary flex items-center justify-center">
            <span className="text-2xl">👨‍💼</span>
          </div>
        </div>
      </div>

      {/* Scene 5: Categories (18-23s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 transition-all duration-500",
          isInScene(scenes.categories) ? "opacity-100" : "opacity-0"
        )}
      >
        <p className="text-white font-semibold mb-2">7 Workout Categories</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
          {['Strength', 'Cardio', 'Metabolic', 'Mobility', 'Challenge', 'Calorie', 'WOD'].map((cat, i) => (
            <span
              key={cat}
              className="bg-primary/30 text-white text-xs px-2 py-1 rounded-full"
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

      {/* Scene 6: CTA (23-25s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
          isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary">SG</span>
        </div>
        <p className="text-white font-semibold mb-2">smartygym.com</p>
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
          Link in bio 👆
        </div>
      </div>
    </div>
  );
};
