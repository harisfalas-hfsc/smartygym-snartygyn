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
      <div className="w-full h-full flex items-center justify-center overflow-hidden px-3">
        {/* Scene 1: Intro (0-3s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center transition-all duration-500",
            isInScene(scenes.intro) ? "opacity-100 scale-100" : "opacity-0 scale-90"
          )}
        >
          <p className="text-sm font-bold text-foreground mb-1">Meet Your Coach</p>
          <div 
            className="w-16 h-0.5 bg-primary rounded-full"
            style={{ 
              transform: `scaleX(${getProgress(scenes.intro)})`,
              transformOrigin: 'center'
            }}
          />
        </div>

        {/* Scene 2: Coach Card (3-8s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-3 transition-all duration-500",
            isInScene(scenes.coachCard) ? "opacity-100" : "opacity-0"
          )}
        >
          <div 
            className="bg-primary/10 border border-primary/50 rounded-xl p-3 w-full max-w-[150px]"
            style={{
              transform: isInScene(scenes.coachCard) ? 'translateY(0)' : 'translateY(15px)',
              transition: 'all 0.5s ease'
            }}
          >
            <div className="w-12 h-12 rounded-full mx-auto mb-2 overflow-hidden border-2 border-primary">
              <img 
                src={harisPhoto} 
                alt="Coach Haris" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xs font-bold text-foreground text-center">Haris Falas</h2>
            <p className="text-primary text-center text-[10px] mt-0.5 font-medium">Sports Scientist</p>
            <div className="flex justify-center gap-1 mt-1.5">
              <span className="bg-primary/25 border border-primary/40 text-foreground text-[8px] px-1.5 py-0.5 rounded-full">CSCS</span>
              <span className="bg-primary/25 border border-primary/40 text-foreground text-[8px] px-1.5 py-0.5 rounded-full">20+ Years</span>
            </div>
          </div>
        </div>

        {/* Scene 3: Credentials (8-13s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center gap-1.5 p-3 transition-all duration-500",
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
              className="flex items-center gap-2 bg-primary/15 border border-primary/40 rounded-lg px-2.5 py-1.5 w-full max-w-[145px]"
              style={{
                opacity: getProgress(scenes.credentials) > (i * 0.3) ? 1 : 0,
                transform: getProgress(scenes.credentials) > (i * 0.3) 
                  ? 'translateX(0)' 
                  : 'translateX(20px)',
                transition: 'all 0.4s ease'
              }}
            >
              <span className="text-sm">{item.icon}</span>
              <p className="text-foreground font-semibold text-[10px]">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Scene 4: Brand Promise (13-17s) */}
        <div
          className={cn(
            "absolute flex flex-col items-center justify-center p-3 transition-all duration-500",
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
            <p className="text-base font-bold text-foreground mb-0.5">100% Human.</p>
            <p className="text-base font-bold text-primary mb-2">0% AI.</p>
            <div className="bg-primary/15 border border-primary/50 rounded-lg px-2.5 py-1.5">
              <p className="text-foreground text-[10px] font-medium">
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
          <p className="text-foreground font-semibold text-[11px] mb-1.5">Train with Haris</p>
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-[11px] font-semibold animate-pulse">
            Start Training 💪
          </div>
        </div>
      </div>
    </VideoBrandingOverlay>
  );
};
