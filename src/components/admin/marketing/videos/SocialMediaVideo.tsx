import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";
import coachPhoto from "@/assets/haris-falas-coach.png";
import { socialMediaVideoScripts, VideoScript } from "@/data/socialMediaVideoScripts";

interface SocialMediaVideoProps {
  isPlaying?: boolean;
  onComplete?: () => void;
  dayNumber: number;
}

export interface SocialMediaVideoRef {
  restart: () => void;
}

// Brand colors
const BRAND_LIGHT_BLUE = "#64B5F6";
const BRAND_WHITE = "#FFFFFF";
const BRAND_DARK = "#0a0a0a";

export const SocialMediaVideo = forwardRef<SocialMediaVideoRef, SocialMediaVideoProps>(
  ({ isPlaying = true, onComplete, dayNumber }, ref) => {
    const [timeMs, setTimeMs] = useState(0);
    const animationRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const pausedTimeRef = useRef<number>(0);

    const script = socialMediaVideoScripts.find(s => s.day === dayNumber) || socialMediaVideoScripts[0];

    useImperativeHandle(ref, () => ({
      restart: () => {
        setTimeMs(0);
        startTimeRef.current = null;
        pausedTimeRef.current = 0;
      },
    }));

    useEffect(() => {
      if (!isPlaying) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        pausedTimeRef.current = timeMs;
        return;
      }

      const animate = (timestamp: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = timestamp - pausedTimeRef.current;
        }
        const elapsed = timestamp - startTimeRef.current;
        setTimeMs(elapsed);

        if (elapsed < 25000) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onComplete?.();
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isPlaying, onComplete]);

    // Timing structure
    const INTRO_END = 2000;
    const CARD_DURATION = 5250;
    const OUTRO_START = 23000;
    const TOTAL_DURATION = 25000;

    const getCardIndex = () => {
      if (timeMs < INTRO_END) return -1;
      if (timeMs >= OUTRO_START) return -2;
      const cardTime = timeMs - INTRO_END;
      return Math.min(Math.floor(cardTime / CARD_DURATION), 3);
    };

    const getCardProgress = () => {
      if (timeMs < INTRO_END) return 0;
      if (timeMs >= OUTRO_START) return 0;
      const cardTime = timeMs - INTRO_END;
      return (cardTime % CARD_DURATION) / CARD_DURATION;
    };

    const cardIndex = getCardIndex();
    const cardProgress = getCardProgress();
    const currentCard = cardIndex >= 0 && cardIndex < script.cards.length ? script.cards[cardIndex] : null;

    // Animation calculations
    const getLogoIntroStyle = () => {
      const progress = Math.min(timeMs / INTRO_END, 1);
      const scale = 0.5 + progress * 0.5;
      const opacity = progress < 0.9 ? 1 : 1 - (progress - 0.9) / 0.1;
      return {
        transform: `scale(${scale})`,
        opacity,
      };
    };

    const getLogoOutroStyle = () => {
      const outroTime = timeMs - OUTRO_START;
      const progress = Math.min(outroTime / 2000, 1);
      const scale = 0.5 + progress * 0.5;
      const opacity = progress < 0.9 ? progress * 1.5 : 1;
      return {
        transform: `scale(${scale})`,
        opacity: Math.min(opacity, 1),
      };
    };

    const getCardEntryStyle = () => {
      // Entry: 0-300ms (slide up + fade in)
      // Exit: last 200ms (fade out)
      const entryDuration = 300 / CARD_DURATION;
      const exitStart = 1 - (200 / CARD_DURATION);

      if (cardProgress < entryDuration) {
        const entryProgress = cardProgress / entryDuration;
        const eased = 1 - Math.pow(1 - entryProgress, 3); // easeOutCubic
        return {
          transform: `translateY(${30 * (1 - eased)}px)`,
          opacity: eased,
        };
      } else if (cardProgress > exitStart) {
        const exitProgress = (cardProgress - exitStart) / (1 - exitStart);
        const eased = Math.pow(exitProgress, 3); // easeInCubic
        return {
          transform: 'translateY(0)',
          opacity: 1 - eased,
        };
      }
      return {
        transform: 'translateY(0)',
        opacity: 1,
      };
    };

    const isIntro = timeMs < INTRO_END;
    const isOutro = timeMs >= OUTRO_START;
    const isCoachCard = script.hasCoachPhoto && cardIndex === 1;

    return (
      <div
        className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: BRAND_DARK, aspectRatio: "9/16" }}
      >
        {/* Logo Intro */}
        {isIntro && (
          <div
            className="absolute flex items-center justify-center"
            style={getLogoIntroStyle()}
          >
            <img 
              src={smartyGymLogo} 
              alt="SmartyGym" 
              className="h-20 w-auto drop-shadow-[0_0_20px_rgba(100,181,246,0.5)]"
            />
          </div>
        )}

        {/* Content Cards */}
        {currentCard && !isIntro && !isOutro && (
          <div
            className="text-center px-8"
            style={getCardEntryStyle()}
          >
            {isCoachCard ? (
              // Coach card with photo
              <div className="flex flex-col items-center">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4"
                  style={{ borderColor: BRAND_LIGHT_BLUE }}
                >
                  <img 
                    src={coachPhoto} 
                    alt="Coach Haris Falas"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2" style={{ color: BRAND_WHITE }}>
                  {currentCard.line1}
                </h2>
                {currentCard.line2 && (
                  <p className="text-xl" style={{ color: BRAND_LIGHT_BLUE }}>
                    {currentCard.line2}
                  </p>
                )}
              </div>
            ) : (
              // Standard text card
              <div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: BRAND_WHITE }}>
                  {currentCard.line1}
                </h2>
                {currentCard.line2 && (
                  <p className="text-xl" style={{ color: BRAND_LIGHT_BLUE }}>
                    {currentCard.line2}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logo Outro */}
        {isOutro && (
          <div
            className="text-center"
            style={getLogoOutroStyle()}
          >
            <img 
              src={smartyGymLogo} 
              alt="SmartyGym" 
              className="h-24 w-auto mb-4 drop-shadow-[0_0_25px_rgba(100,181,246,0.6)]"
            />
          </div>
        )}

        {/* Bottom URL */}
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

SocialMediaVideo.displayName = "SocialMediaVideo";
