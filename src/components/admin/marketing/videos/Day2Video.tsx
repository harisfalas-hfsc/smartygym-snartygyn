import { cn } from "@/lib/utils";
import { VideoBrandingOverlay } from "./VideoBrandingOverlay";

interface Day2VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day2Video = ({ currentTime }: Day2VideoProps) => {
  // Scene timings in milliseconds
  const scenes = {
    intro: { start: 0, end: 4000 },
    coachCard: { start: 4000, end: 10000 },
    credentials: { start: 10000, end: 16000 },
    quote: { start: 16000, end: 22000 },
    brandPromise: { start: 22000, end: 27000 },
    cta: { start: 27000, end: 30000 },
  };

  const isInScene = (scene: { start: number; end: number }) =>
    currentTime >= scene.start && currentTime < scene.end;

  const getProgress = (scene: { start: number; end: number }) => {
    if (currentTime < scene.start) return 0;
    if (currentTime >= scene.end) return 1;
    return (currentTime - scene.start) / (scene.end - scene.start);
  };

  return (
    <VideoBrandingOverlay tagline="Meet the Expert Behind Every Workout">
      <div className="w-full h-full flex items-center justify-center overflow-hidden px-4">
        {/* Scene 1: Intro (0-4s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.intro) ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <p className="text-base font-bold text-foreground mb-1">Meet Your Coach</p>
          <div 
            className="w-20 h-1 bg-primary rounded-full"
            style={{ 
              transform: `scaleX(${getProgress(scenes.intro)})`,
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Scene 2: Coach Card (4-10s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-4 transition-all duration-500",
            isInScene(scenes.coachCard) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="bg-gradient-to-b from-primary/20 to-transparent border border-primary/40 rounded-xl p-4 w-full max-w-[180px]"
            style={{
              transform: isInScene(scenes.coachCard) ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.5s ease'
            }}
          >
            <div className="w-12 h-12 rounded-full bg-primary/30 mx-auto mb-2 flex items-center justify-center">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h2 className="text-sm font-bold text-foreground text-center">Haris Falas</h2>
            <p className="text-primary text-center text-xs mt-0.5">Sports Scientist</p>
            <div className="flex justify-center gap-1 mt-2">
              <span className="bg-primary/30 text-foreground text-[10px] px-1.5 py-0.5 rounded-full">CSCS</span>
              <span className="bg-primary/30 text-foreground text-[10px] px-1.5 py-0.5 rounded-full">20+ Years</span>
            </div>
          </div>
        </div>

        {/* Scene 3: Credentials (10-16s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2 p-4 transition-all duration-500",
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
              className="flex items-center gap-2 bg-muted/80 rounded-lg px-3 py-2 w-full max-w-[160px]"
              style={{
                opacity: getProgress(scenes.credentials) > (i * 0.3) ? 1 : 0,
                transform: getProgress(scenes.credentials) > (i * 0.3) 
                  ? 'translateX(0)' 
                  : 'translateX(30px)',
                transition: 'all 0.4s ease'
              }}
            >
              <span className="text-base">{item.icon}</span>
              <p className="text-foreground font-semibold text-xs">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Scene 4: Quote (16-22s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-4 transition-all duration-500",
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
            <span className="text-2xl text-primary/50">"</span>
            <p className="text-xs text-foreground italic leading-relaxed">
              Every workout designed with purpose.
            </p>
            <p className="text-xs text-foreground italic leading-relaxed">
              Every rep counts.
            </p>
            <span className="text-2xl text-primary/50">"</span>
            <p className="text-primary font-semibold text-xs mt-1">— Coach Haris</p>
          </div>
        </div>

        {/* Scene 5: Brand Promise (22-27s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-4 transition-all duration-500",
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
            <p className="text-lg font-bold text-foreground mb-0.5">100% Human.</p>
            <p className="text-lg font-bold text-primary mb-2">0% AI.</p>
            <div className="bg-primary/20 border border-primary/40 rounded-lg px-3 py-2">
              <p className="text-foreground text-xs">
                Real expertise. Real results.
              </p>
            </div>
          </div>
        </div>

        {/* Scene 6: CTA (27-30s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
          )}
        >
          <p className="text-foreground font-semibold text-xs mb-2">Train with Haris</p>
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
            Start Training 💪
          </div>
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};
