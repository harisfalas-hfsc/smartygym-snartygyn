import { cn } from "@/lib/utils";
import { VideoBrandingOverlay } from "./VideoBrandingOverlay";
import harisPhoto from "@/assets/haris-falas-coach.png";

interface Day2VideoProps {
  currentTime: number;
  isPlaying: boolean;
}

export const Day2Video = ({ currentTime }: Day2VideoProps) => {
  // Scene timings in milliseconds - 20 seconds total
  const scenes = {
    intro: { start: 0, end: 3000 },
    coachCard: { start: 3000, end: 8000 },
    credentials: { start: 8000, end: 13000 },
    brandPromise: { start: 13000, end: 17000 },
    cta: { start: 17000, end: 20000 },
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
        {/* Scene 1: Intro (0-3s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-700",
            isInScene(scenes.intro) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <p 
            className="text-xl font-bold text-foreground mb-2"
            style={{
              opacity: isInScene(scenes.intro) ? 1 : 0,
              transform: isInScene(scenes.intro) ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            Meet Your Coach
          </p>
          <div 
            className="w-20 h-1 bg-primary rounded-full"
            style={{ 
              transform: `scaleX(${getProgress(scenes.intro)})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease'
            }}
          />
        </div>

        {/* Scene 2: Coach Card (3-8s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.coachCard) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="bg-primary/10 border-2 border-primary/60 rounded-2xl p-4 shadow-lg"
            style={{
              opacity: isInScene(scenes.coachCard) ? 1 : 0,
              transform: isInScene(scenes.coachCard) ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden border-3 border-primary shadow-lg">
              <img 
                src={harisPhoto} 
                alt="Coach Haris" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-base font-bold text-foreground text-center">Haris Falas</h2>
            <p className="text-primary text-center text-sm mt-1 font-semibold">Sports Scientist</p>
            <div className="flex justify-center gap-2 mt-3">
              <span 
                className="bg-primary/20 border-2 border-primary/50 text-foreground text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  opacity: getProgress(scenes.coachCard) > 0.5 ? 1 : 0,
                  transform: getProgress(scenes.coachCard) > 0.5 ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s'
                }}
              >
                CSCS
              </span>
              <span 
                className="bg-primary/20 border-2 border-primary/50 text-foreground text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  opacity: getProgress(scenes.coachCard) > 0.6 ? 1 : 0,
                  transform: getProgress(scenes.coachCard) > 0.6 ? 'scale(1)' : 'scale(0)',
                  transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s'
                }}
              >
                20+ Years
              </span>
            </div>
          </div>
        </div>

        {/* Scene 3: Credentials (8-13s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-2.5 transition-all duration-500",
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
              className="flex items-center gap-3 bg-primary/10 border-2 border-primary/50 rounded-xl px-4 py-2.5 shadow-md"
              style={{
                opacity: getProgress(scenes.credentials) > (i * 0.3) ? 1 : 0,
                transform: getProgress(scenes.credentials) > (i * 0.3) 
                  ? 'translateX(0) scale(1)' 
                  : 'translateX(40px) scale(0.9)',
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`
              }}
            >
              <span className="text-lg">{item.icon}</span>
              <p className="text-foreground font-bold text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Scene 4: Brand Promise (13-17s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-700",
            isInScene(scenes.brandPromise) ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="text-center">
            <p 
              className="text-2xl font-black text-foreground"
              style={{
                opacity: isInScene(scenes.brandPromise) ? 1 : 0,
                transform: isInScene(scenes.brandPromise) ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
            >
              100% Human.
            </p>
            <p 
              className="text-2xl font-black text-primary"
              style={{
                opacity: getProgress(scenes.brandPromise) > 0.2 ? 1 : 0,
                transform: getProgress(scenes.brandPromise) > 0.2 ? 'scale(1)' : 'scale(0.5)',
                transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.15s'
              }}
            >
              0% AI.
            </p>
            <div 
              className="mt-3 bg-primary/10 border-2 border-primary/50 rounded-xl px-4 py-2 shadow-md"
              style={{
                opacity: getProgress(scenes.brandPromise) > 0.4 ? 1 : 0,
                transform: getProgress(scenes.brandPromise) > 0.4 ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s'
              }}
            >
              <p className="text-foreground text-sm font-semibold">
                Real expertise. Real results.
              </p>
            </div>
          </div>
        </div>

        {/* Scene 5: CTA (17-20s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.cta) ? "opacity-100" : "opacity-0"
          )}
        >
          <p 
            className="text-foreground font-bold text-base mb-3"
            style={{
              opacity: isInScene(scenes.cta) ? 1 : 0,
              transform: isInScene(scenes.cta) ? 'translateY(0)' : 'translateY(-15px)',
              transition: 'all 0.4s ease'
            }}
          >
            Train with Haris
          </p>
          <div 
            className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold shadow-lg animate-pulse-glow"
            style={{
              opacity: isInScene(scenes.cta) ? 1 : 0,
              transform: isInScene(scenes.cta) ? 'scale(1)' : 'scale(0.5)',
              transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.1s'
            }}
          >
            Start Training 💪
          </div>
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};
