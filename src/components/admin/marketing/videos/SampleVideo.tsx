import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface SampleVideoProps {
  isPlaying?: boolean;
  onComplete?: () => void;
}

export interface SampleVideoRef {
  restart: () => void;
}

// Brand colors
const BRAND_LIGHT_BLUE = "#64B5F6";
const BRAND_RED = "#EF4444";
const BRAND_WHITE = "#FFFFFF";
const BRAND_DARK = "#0a0a0a";

export const SampleVideo = forwardRef<SampleVideoRef, SampleVideoProps>(
  ({ isPlaying = true, onComplete }, ref) => {
    const [currentScene, setCurrentScene] = useState(0);
    const [scenePhase, setScenePhase] = useState<"in" | "hold" | "out">("in");

    useImperativeHandle(ref, () => ({
      restart: () => {
        setCurrentScene(0);
        setScenePhase("in");
      },
    }));

    // Scene timings in milliseconds
    const sceneTimings = [
      { in: 800, hold: 800, out: 400 },    // Scene 1: 0-2s (logo)
      { in: 500, hold: 1500, out: 500 },   // Scene 2: 2-5s (0% AI / 100% Human)
      { in: 500, hold: 1500, out: 500 },   // Scene 3: 5-8s (WOD)
      { in: 500, hold: 1500, out: 500 },   // Scene 4: 8-11s (2 Workouts)
      { in: 2400, hold: 800, out: 400 },   // Scene 5: 11-15s (Quick cards - 6 x 600ms)
      { in: 500, hold: 1500, out: 500 },   // Scene 6: 15-18s (Different difficulty)
      { in: 500, hold: 3000, out: 500 },   // Scene 7: 18-22s (Personal trainer)
      { in: 800, hold: 1500, out: 700 },   // Scene 8: 22-25s (Logo end)
    ];

    useEffect(() => {
      if (!isPlaying) return;

      const timing = sceneTimings[currentScene];
      if (!timing) {
        onComplete?.();
        return;
      }

      let timeout: NodeJS.Timeout;

      if (scenePhase === "in") {
        timeout = setTimeout(() => setScenePhase("hold"), timing.in);
      } else if (scenePhase === "hold") {
        timeout = setTimeout(() => setScenePhase("out"), timing.hold);
      } else if (scenePhase === "out") {
        timeout = setTimeout(() => {
          if (currentScene < 7) {
            setCurrentScene((prev) => prev + 1);
            setScenePhase("in");
          } else {
            onComplete?.();
          }
        }, timing.out);
      }

      return () => clearTimeout(timeout);
    }, [isPlaying, currentScene, scenePhase, onComplete]);

    // Scene 5 quick cards animation state
    const [activeQuickCard, setActiveQuickCard] = useState(0);
    const quickCards = ["Strength", "Cardio", "Calorie Burning", "Metabolic", "Mobility & Stability", "Challenge"];

    useEffect(() => {
      if (currentScene === 4 && scenePhase === "in" && isPlaying) {
        const interval = setInterval(() => {
          setActiveQuickCard((prev) => {
            if (prev >= quickCards.length - 1) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 400);
        return () => clearInterval(interval);
      }
      if (currentScene !== 4) {
        setActiveQuickCard(0);
      }
    }, [currentScene, scenePhase, isPlaying]);

    // Scene 6 word reveal state
    const [revealedWords, setRevealedWords] = useState(0);
    const subTextWords = ["Safe.", "Professional.", "Science based periodization."];

    useEffect(() => {
      if (currentScene === 5 && scenePhase === "hold" && isPlaying) {
        setRevealedWords(0);
        const interval = setInterval(() => {
          setRevealedWords((prev) => {
            if (prev >= subTextWords.length) {
              clearInterval(interval);
              return prev;
            }
            return prev + 1;
          });
        }, 400);
        return () => clearInterval(interval);
      }
      if (currentScene !== 5) {
        setRevealedWords(0);
      }
    }, [currentScene, scenePhase, isPlaying]);

    const getSceneAnimation = () => {
      if (scenePhase === "in") return "animate-card-center-in";
      if (scenePhase === "out") return "animate-fade-out";
      return "";
    };

    const getSlideRightAnimation = () => {
      if (scenePhase === "in") return "animate-slide-in-right";
      if (scenePhase === "out") return "animate-slide-out-left";
      return "";
    };

    const getSlideLeftAnimation = () => {
      if (scenePhase === "in") return "animate-slide-in-left";
      if (scenePhase === "out") return "animate-fade-out";
      return "";
    };

    const getSlideDownAnimation = () => {
      if (scenePhase === "in") return "animate-slide-in-right";
      if (scenePhase === "out") return "animate-slide-down-out";
      return "";
    };

    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: BRAND_DARK, aspectRatio: "9/16" }}
      >
        {/* Scene 1: Logo appears at bottom, expands up */}
        {currentScene === 0 && (
          <div
            className={`absolute flex items-center justify-center transition-all duration-1000 ${
              scenePhase === "in"
                ? "bottom-[20%] animate-expand-up"
                : scenePhase === "out"
                ? "animate-fade-out"
                : "animate-glow-pulse"
            }`}
          >
            <img 
              src={smartyGymLogo} 
              alt="SmartyGym" 
              className="h-20 w-auto drop-shadow-[0_0_20px_rgba(100,181,246,0.5)]"
            />
          </div>
        )}

        {/* Scene 2: 0% AI / 100% Human */}
        {currentScene === 1 && (
          <div className={`text-center px-6 ${getSceneAnimation()}`}>
            <div className="space-y-2">
              <p
                className="text-5xl font-bold"
                style={{ color: BRAND_RED }}
              >
                0% AI
              </p>
              <p
                className="text-5xl font-bold"
                style={{ color: BRAND_LIGHT_BLUE }}
              >
                100% Human
              </p>
            </div>
          </div>
        )}

        {/* Scene 3: Workout of the Day */}
        {currentScene === 2 && (
          <div className={`text-center px-6 ${getSlideRightAnimation()}`}>
            <h2
              className="text-4xl font-bold mb-2"
              style={{ color: BRAND_WHITE }}
            >
              Workout of the Day
            </h2>
            <p
              className="text-3xl font-semibold mb-6"
              style={{ color: BRAND_LIGHT_BLUE }}
            >
              Every single day
            </p>
            <div className="space-y-1 text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
              <p>No guessing</p>
              <p>No random training</p>
            </div>
          </div>
        )}

        {/* Scene 4: 2 Workouts Every Day */}
        {currentScene === 3 && (
          <div className={`text-center px-6 ${getSlideLeftAnimation()}`}>
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: BRAND_WHITE }}
            >
              2 Workouts. Every Day.
            </h2>
            <div className="space-y-2 text-xl" style={{ color: BRAND_LIGHT_BLUE }}>
              <p className={scenePhase !== "in" ? "animate-fade-in" : "opacity-0"} style={{ animationDelay: "0.2s" }}>
                1 Bodyweight
              </p>
              <p className={scenePhase !== "in" ? "animate-fade-in" : "opacity-0"} style={{ animationDelay: "0.5s" }}>
                1 With Equipment
              </p>
            </div>
          </div>
        )}

        {/* Scene 5: Quick Category Cards */}
        {currentScene === 4 && (
          <div className="text-center px-6">
            {quickCards.map((card, index) => (
              <div
                key={card}
                className={`absolute inset-0 flex items-center justify-center ${
                  activeQuickCard === index
                    ? "animate-pop-in"
                    : activeQuickCard > index
                    ? "opacity-0"
                    : "opacity-0"
                }`}
              >
                <div
                  className="px-8 py-6 rounded-2xl"
                  style={{
                    backgroundColor: "rgba(100, 181, 246, 0.15)",
                    border: `2px solid ${BRAND_LIGHT_BLUE}`,
                  }}
                >
                  <p
                    className="text-3xl font-bold"
                    style={{ color: BRAND_WHITE }}
                  >
                    {card}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scene 6: Different difficulty */}
        {currentScene === 5 && (
          <div className={`text-center px-6 ${getSlideDownAnimation()}`}>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: BRAND_WHITE }}
            >
              Different difficulty
            </h2>
            <p
              className="text-3xl font-semibold mb-6"
              style={{ color: BRAND_LIGHT_BLUE }}
            >
              Every day
            </p>
            <div className="space-y-1 text-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
              {subTextWords.map((word, index) => (
                <span
                  key={word}
                  className={`inline-block mx-1 transition-opacity duration-300 ${
                    index < revealedWords ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scene 7: Personal Trainer */}
        {currentScene === 6 && (
          <div
            className={`text-center px-6 ${
              scenePhase === "in" ? "animate-card-center-in" : ""
            } ${scenePhase === "hold" ? "animate-zoom-in-slow" : ""} ${
              scenePhase === "out" ? "animate-fade-out" : ""
            }`}
          >
            <p
              className="text-3xl font-bold leading-relaxed"
              style={{ color: BRAND_WHITE }}
            >
              It's like having
              <br />
              <span style={{ color: BRAND_LIGHT_BLUE }}>your personal trainer</span>
              <br />
              ready every day
            </p>
          </div>
        )}

        {/* Scene 8: Logo End */}
        {currentScene === 7 && (
          <div
            className={`text-center ${
              scenePhase === "in"
                ? "animate-card-center-in"
                : scenePhase === "out"
                ? "animate-fade-out"
                : "animate-glow-pulse"
            }`}
          >
            <img 
              src={smartyGymLogo} 
              alt="SmartyGym" 
              className="h-24 w-auto mb-4 drop-shadow-[0_0_25px_rgba(100,181,246,0.6)]"
            />
            <p className="text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              Train smart. Train human.
            </p>
          </div>
        )}

        {/* Consistent bottom URL */}
        <div
          className="absolute bottom-12 left-0 right-0 text-center"
          style={{ color: BRAND_LIGHT_BLUE }}
        >
          <p className="text-sm font-medium tracking-wider">smartygym.com</p>
        </div>
      </div>
    );
  }
);

SampleVideo.displayName = "SampleVideo";
