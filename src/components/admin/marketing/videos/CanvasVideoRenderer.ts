export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_MS = 25_000;

// Simple HEX colors only - no HSL
const BG_COLOR = "#0a0a0a";
const WHITE = "#FFFFFF";
const LIGHT_BLUE = "#64B5F6";
const RED = "#EF4444";
const MUTED_WHITE = "rgba(255, 255, 255, 0.7)";
const MUTED_WHITE_80 = "rgba(255, 255, 255, 0.8)";
const BLUE_GLOW = "rgba(100, 181, 246, 0.5)";
const BLUE_BG = "rgba(100, 181, 246, 0.15)";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOutCubic = (t: number) =>
  clamp01(t) < 0.5
    ? 4 * Math.pow(clamp01(t), 3)
    : 1 - Math.pow(-2 * clamp01(t) + 2, 3) / 2;

type Phase = "in" | "hold" | "out";

const sceneTimings = [
  { in: 800, hold: 800, out: 400 },
  { in: 500, hold: 1500, out: 500 },
  { in: 500, hold: 1500, out: 500 },
  { in: 500, hold: 1500, out: 500 },
  { in: 2400, hold: 800, out: 400 },
  { in: 500, hold: 1500, out: 500 },
  { in: 500, hold: 3000, out: 500 },
  { in: 800, hold: 1500, out: 700 },
];

const sceneTotal = (s: (typeof sceneTimings)[number]) => s.in + s.hold + s.out;
const totalScenesDurationMs = sceneTimings.reduce((acc, s) => acc + sceneTotal(s), 0);

export class CanvasVideoRenderer {
  private logo: HTMLImageElement | null = null;
  private logoLoaded = false;

  constructor(logoUrl: string) {
    this.logo = new Image();
    this.logo.crossOrigin = "anonymous";
    
    this.logo.onload = () => {
      this.logoLoaded = true;
      console.log("✅ Logo loaded:", this.logo?.naturalWidth, "x", this.logo?.naturalHeight);
    };
    
    this.logo.onerror = (err) => {
      console.error("❌ Logo failed:", err);
      this.logoLoaded = false;
    };
    
    this.logo.src = logoUrl;
  }

  isReady(): boolean {
    return this.logoLoaded;
  }

  waitForLogo(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.logoLoaded) {
        resolve(true);
        return;
      }
      
      const checkInterval = setInterval(() => {
        if (this.logoLoaded) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 50);
      
      // Timeout after 3 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(this.logoLoaded);
      }, 3000);
    });
  }

  drawFrame(ctx: CanvasRenderingContext2D, tMs: number) {
    // Clear with background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    const scene = this.getSceneAtTime(tMs);

    switch (scene.sceneIndex) {
      case 0:
        this.drawScene1LogoIntro(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 1:
        this.drawScene2ValueProp(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 2:
        this.drawScene3Wod(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 3:
        this.drawScene4TwoWorkouts(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 4:
        this.drawScene5QuickCards(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 5:
        this.drawScene6Difficulty(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 6:
        this.drawScene7PersonalTrainer(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
      case 7:
        this.drawScene8LogoOutro(ctx, scene.phase, scene.phaseMs, scene.phaseDurationMs);
        break;
    }

    this.drawBottomUrl(ctx);
  }

  private getSceneAtTime(tMs: number) {
    const t = Math.max(0, Math.min(tMs, totalScenesDurationMs));

    let cursor = 0;
    for (let i = 0; i < sceneTimings.length; i++) {
      const s = sceneTimings[i];
      const total = sceneTotal(s);
      if (t < cursor + total) {
        const local = t - cursor;

        if (local < s.in) {
          return { sceneIndex: i, phase: "in" as const, phaseMs: local, phaseDurationMs: s.in };
        }
        if (local < s.in + s.hold) {
          return {
            sceneIndex: i,
            phase: "hold" as const,
            phaseMs: local - s.in,
            phaseDurationMs: s.hold,
          };
        }
        return {
          sceneIndex: i,
          phase: "out" as const,
          phaseMs: local - s.in - s.hold,
          phaseDurationMs: s.out,
        };
      }
      cursor += total;
    }

    return { sceneIndex: 7, phase: "hold" as const, phaseMs: 0, phaseDurationMs: 1 };
  }

  private applyPhaseAlpha(phase: Phase, phaseMs: number, phaseDur: number) {
    if (phase === "hold") return 1;
    const t = phaseDur === 0 ? 1 : phaseMs / phaseDur;
    if (phase === "in") return easeOutCubic(t);
    return 1 - easeOutCubic(t);
  }

  private drawBottomUrl(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = LIGHT_BLUE;
    ctx.font = "600 40px Arial, sans-serif";
    ctx.fillText("smartygym.com", VIDEO_WIDTH / 2, VIDEO_HEIGHT - 140);
    ctx.restore();
  }

  private drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, glowStrength: number) {
    if (!this.logo || !this.logoLoaded || !this.logo.naturalWidth) {
      // Fallback: draw text if logo not loaded
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = LIGHT_BLUE;
      ctx.font = "bold 80px Arial, sans-serif";
      ctx.fillText("SMARTY GYM", x, y);
      ctx.restore();
      return;
    }

    const aspect = this.logo.naturalWidth / this.logo.naturalHeight;
    const w = h * aspect;

    ctx.save();
    ctx.translate(x, y);

    if (glowStrength > 0) {
      ctx.shadowColor = BLUE_GLOW;
      ctx.shadowBlur = lerp(8, 40, clamp01(glowStrength));
    }

    ctx.drawImage(this.logo, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  private drawCard(ctx: CanvasRenderingContext2D, text: string, alpha: number, scale: number) {
    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    ctx.font = "800 84px Arial, sans-serif";
    const metrics = ctx.measureText(text);
    const paddingX = 90;
    const paddingY = 70;
    const w = metrics.width + paddingX * 2;
    const h = 170 + paddingY;

    // Background
    ctx.fillStyle = BLUE_BG;
    this.roundRect(ctx, -w / 2, -h / 2, w, h, 44);
    ctx.fill();

    // Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = LIGHT_BLUE;
    ctx.stroke();

    // Text
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = WHITE;
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private drawScene1LogoIntro(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const tIn = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const baseY = VIDEO_HEIGHT * 0.62;
    const y = lerp(VIDEO_HEIGHT * 0.78, baseY, tIn);
    const pulse = phase === "hold" ? 0.35 + 0.25 * (0.5 + 0.5 * Math.sin((phaseMs / 1000) * Math.PI * 2)) : 0.35;

    ctx.save();
    ctx.globalAlpha = a;
    this.drawLogo(ctx, VIDEO_WIDTH / 2, y, 190, pulse);
    ctx.restore();
  }

  private drawScene2ValueProp(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const s = 0.95 + 0.05 * easeOutCubic(phase === "in" ? phaseMs / Math.max(1, phaseDur) : 1);

    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.scale(s, s);
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 140px Arial, sans-serif";

    ctx.fillStyle = RED;
    ctx.fillText("0% AI", 0, -80);

    ctx.fillStyle = LIGHT_BLUE;
    ctx.fillText("100% Human", 0, 80);

    ctx.restore();
  }

  private drawScene3Wod(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const x = lerp(VIDEO_WIDTH * 0.75, VIDEO_WIDTH / 2, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = WHITE;
    ctx.font = "900 72px Arial, sans-serif";
    ctx.fillText("Workout of the Day", x, VIDEO_HEIGHT * 0.40);

    ctx.fillStyle = LIGHT_BLUE;
    ctx.font = "800 64px Arial, sans-serif";
    ctx.fillText("Every single day", x, VIDEO_HEIGHT * 0.48);

    ctx.fillStyle = MUTED_WHITE;
    ctx.font = "600 48px Arial, sans-serif";
    ctx.fillText("No guessing", x, VIDEO_HEIGHT * 0.60);
    ctx.fillText("No random training", x, VIDEO_HEIGHT * 0.66);

    ctx.restore();
  }

  private drawScene4TwoWorkouts(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const x = lerp(VIDEO_WIDTH * 0.25, VIDEO_WIDTH / 2, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";

    ctx.fillStyle = WHITE;
    ctx.font = "900 68px Arial, sans-serif";
    ctx.fillText("2 Workouts. Every Day.", x, VIDEO_HEIGHT * 0.42);

    const baseY = VIDEO_HEIGHT * 0.55;
    const tHold = phase === "hold" ? phaseMs : phase === "out" ? phaseDur : 0;
    const line1Alpha = clamp01((tHold - 200) / 350);
    const line2Alpha = clamp01((tHold - 500) / 350);

    ctx.fillStyle = LIGHT_BLUE;
    ctx.font = "800 60px Arial, sans-serif";

    ctx.globalAlpha = a * line1Alpha;
    ctx.fillText("1 Bodyweight", x, baseY);

    ctx.globalAlpha = a * line2Alpha;
    ctx.fillText("1 With Equipment", x, baseY + 110);

    ctx.restore();
  }

  private drawScene5QuickCards(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const cards = ["Strength", "Cardio", "Calorie Burning", "Metabolic", "Mobility & Stability", "Challenge"];

    if (phase === "out") {
      this.drawCard(ctx, cards[cards.length - 1], a, 1);
      return;
    }

    const tIn = phase === "in" ? phaseMs : phaseDur;
    const index = Math.min(cards.length - 1, Math.floor(tIn / 400));
    const local = tIn - index * 400;
    const pop = 0.85 + 0.15 * easeOutCubic(clamp01(local / 180));

    this.drawCard(ctx, cards[index], a, pop);
  }

  private drawScene6Difficulty(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const yOffset = lerp(-60, 0, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(0, yOffset);
    ctx.textAlign = "center";

    ctx.fillStyle = WHITE;
    ctx.font = "900 68px Arial, sans-serif";
    ctx.fillText("Different difficulty", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.40);

    ctx.fillStyle = LIGHT_BLUE;
    ctx.font = "800 64px Arial, sans-serif";
    ctx.fillText("Every day", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.48);

    const subWords = ["Safe.", "Professional.", "Science based periodization."];
    const holdMs = phase === "hold" ? phaseMs : phase === "out" ? phaseDur : 0;
    const revealed = Math.min(subWords.length, Math.floor(holdMs / 400) + 1);

    ctx.fillStyle = MUTED_WHITE;
    ctx.font = "600 42px Arial, sans-serif";
    ctx.fillText(subWords.slice(0, revealed).join(" "), VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.62);

    ctx.restore();
  }

  private drawScene7PersonalTrainer(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const tHold = phase === "hold" ? phaseMs / Math.max(1, phaseDur) : 0;
    const zoom = 1 + 0.06 * easeInOutCubic(tHold);

    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.scale(zoom, zoom);
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = WHITE;
    ctx.font = "900 64px Arial, sans-serif";
    ctx.fillText("It's like having", 0, -100);

    ctx.fillStyle = LIGHT_BLUE;
    ctx.fillText("your personal trainer", 0, 0);

    ctx.fillStyle = WHITE;
    ctx.fillText("ready every day", 0, 100);

    ctx.restore();
  }

  private drawScene8LogoOutro(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const pulse = phase === "hold" ? 0.4 + 0.25 * (0.5 + 0.5 * Math.sin((phaseMs / 1000) * Math.PI * 2)) : 0.4;

    ctx.save();
    ctx.globalAlpha = a;

    this.drawLogo(ctx, VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.44, 230, pulse);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = MUTED_WHITE_80;
    ctx.font = "600 54px Arial, sans-serif";
    ctx.fillText("Your Gym Re-imagined. Anywhere, Anytime.", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.58);

    ctx.restore();
  }
}
