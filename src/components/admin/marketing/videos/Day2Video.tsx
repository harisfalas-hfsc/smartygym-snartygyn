import { cn } from "@/lib/utils";

interface Day2VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day2Video = ({ currentTime }: Day2VideoProps) => {
  // Scene timings in milliseconds
  const scenes = {
    intro: { start: 0, end: 3000 },
    coachCard: { start: 3000, end: 8000 },
    credentials: { start: 8000, end: 14000 },
    quote: { start: 14000, end: 20000 },
    brandPromise: { start: 20000, end: 26000 },
    cta: { start: 26000, end: 30000 },
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
      {/* Scene 1: Intro (0-3s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
          isInScene(scenes.intro) ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary">SG</span>
        </div>
        <p className="text-lg text-white/70 mb-2">Meet the Expert</p>
        <div 
          className="w-32 h-1 bg-primary rounded-full"
          style={{ 
            transform: `scaleX(${getProgress(scenes.intro)})`,
            transformOrigin: 'center'
          }}
        />
      </div>

      {/* Scene 2: Coach Card (3-8s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500",
          isInScene(scenes.coachCard) ? "opacity-100" : "opacity-0"
        )}
      >
        <div 
          className="bg-gradient-to-b from-primary/20 to-transparent border border-primary/40 rounded-2xl p-6 w-full max-w-[260px]"
          style={{
            transform: isInScene(scenes.coachCard) ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.5s ease'
          }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/30 mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">👨‍🏫</span>
          </div>
          <h2 className="text-xl font-bold text-white text-center">Haris Falas</h2>
          <p className="text-primary text-center text-sm mt-1">Sports Scientist</p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="bg-primary/30 text-white text-xs px-2 py-1 rounded-full">CSCS</span>
            <span className="bg-primary/30 text-white text-xs px-2 py-1 rounded-full">20+ Years</span>
          </div>
        </div>
      </div>

      {/* Scene 3: Credentials (8-14s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-all duration-500",
          isInScene(scenes.credentials) ? "opacity-100" : "opacity-0"
        )}
      >
        {[
          { icon: '🎓', text: 'Sports Scientist' },
          { icon: '🏆', text: 'CSCS Certified' },
          { icon: '⏱️', text: '20+ Years Experience' },
        ].map((item, i) => (
          <div
            key={item.text}
            className="flex items-center gap-3 bg-slate-800/80 rounded-lg px-4 py-3 w-full max-w-[240px]"
            style={{
              opacity: getProgress(scenes.credentials) > (i * 0.3) ? 1 : 0,
              transform: getProgress(scenes.credentials) > (i * 0.3) 
                ? 'translateX(0)' 
                : 'translateX(50px)',
              transition: 'all 0.4s ease'
            }}
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-white font-semibold">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Scene 4: Quote (14-20s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500",
          isInScene(scenes.quote) ? "opacity-100" : "opacity-0"
        )}
      >
        <div 
          className="text-center"
          style={{
            transform: isInScene(scenes.quote) ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.5s ease'
          }}
        >
          <span className="text-5xl text-primary/50">"</span>
          <p className="text-lg text-white italic leading-relaxed -mt-4">
            Every workout designed with purpose.
          </p>
          <p className="text-lg text-white italic leading-relaxed">
            Every rep counts.
          </p>
          <span className="text-5xl text-primary/50">"</span>
          <p className="text-primary font-semibold mt-2">— Coach Haris</p>
        </div>
      </div>

      {/* Scene 5: Brand Promise (20-26s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-500",
          isInScene(scenes.brandPromise) ? "opacity-100" : "opacity-0"
        )}
      >
        <div 
          className="text-center"
          style={{
            transform: isInScene(scenes.brandPromise) ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.5s ease'
          }}
        >
          <p className="text-3xl font-bold text-white mb-2">100% Human.</p>
          <p className="text-3xl font-bold text-primary mb-4">0% AI.</p>
          <div className="bg-primary/20 border border-primary/40 rounded-lg px-4 py-3 mt-4">
            <p className="text-white text-sm">
              Real expertise. Real results.
            </p>
          </div>
        </div>
      </div>

      {/* Scene 6: CTA (26-30s) */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center transition-all duration-500",
          isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-primary">SG</span>
        </div>
        <p className="text-white font-semibold mb-1">Train with Haris</p>
        <p className="text-white/70 text-sm mb-3">smartygym.com</p>
        <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
          Link in bio 👆
        </div>
      </div>
    </div>
  );
};
