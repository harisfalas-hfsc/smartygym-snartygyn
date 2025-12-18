export const VIDEO_WIDTH = 1080;
export const VIDEO_HEIGHT = 1920;
export const VIDEO_FPS = 30;
export const VIDEO_DURATION_MS = 25_000;

// Brand colors (HSL only; comma syntax for Canvas 2D compatibility)
const BRAND_DARK = "hsl(0, 0%, 4%)"; // ~ #0a0a0a
const BRAND_WHITE = "hsl(0, 0%, 100%)";
const BRAND_LIGHT_BLUE = "hsl(206, 89%, 68%)"; // ~ #64B5F6
const BRAND_RED = "hsl(0, 84%, 58%)"; // ~ #EF4444

const MUTED_WHITE = "hsla(0, 0%, 100%, 0.7)";
const MUTED_WHITE_80 = "hsla(0, 0%, 100%, 0.8)";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOutCubic = (t: number) =>
  clamp01(t) < 0.5
    ? 4 * Math.pow(clamp01(t), 3)
    : 1 - Math.pow(-2 * clamp01(t) + 2, 3) / 2;

type Phase = "in" | "hold" | "out";

const sceneTimings = [
  { in: 800, hold: 800, out: 400 }, // Scene 1
  { in: 500, hold: 1500, out: 500 }, // Scene 2
  { in: 500, hold: 1500, out: 500 }, // Scene 3
  { in: 500, hold: 1500, out: 500 }, // Scene 4
  { in: 2400, hold: 800, out: 400 }, // Scene 5
  { in: 500, hold: 1500, out: 500 }, // Scene 6
  { in: 500, hold: 3000, out: 500 }, // Scene 7
  { in: 800, hold: 1500, out: 700 }, // Scene 8
];

const sceneTotal = (s: (typeof sceneTimings)[number]) => s.in + s.hold + s.out;
const totalScenesDurationMs = sceneTimings.reduce((acc, s) => acc + sceneTotal(s), 0);

export class CanvasVideoRenderer {
  private readonly logo: HTMLImageElement;
  private readonly readyPromise: Promise<void>;
  private logoLoaded = false;

  constructor(logoUrl: string) {
    this.logo = new Image();
    this.logo.crossOrigin = "anonymous";
    this.logo.decoding = "async";

    this.readyPromise = new Promise((resolve) => {
      this.logo.onload = () => {
        this.logoLoaded = true;
        console.log("Logo loaded successfully:", this.logo.naturalWidth, "x", this.logo.naturalHeight);
        resolve();
      };
      this.logo.onerror = (err) => {
        console.error("Logo failed to load:", err);
        resolve();
      };
      // Set src AFTER attaching handlers
      this.logo.src = logoUrl;
    });
  }

  ready() {
    return this.readyPromise;
  }

  isLogoLoaded() {
    return this.logoLoaded && this.logo.naturalWidth > 0;
  }

  drawFrame(ctx: CanvasRenderingContext2D, tMs: number) {
    // Background
    ctx.save();
    ctx.fillStyle = BRAND_DARK;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    ctx.restore();

    const scene = this.getSceneAtTime(tMs);

    // Scene content
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
      default:
        break;
    }

    // Bottom URL (always)
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

  private withAlpha(color: string, alpha: number) {
    // For HSL strings, easiest is to use globalAlpha in canvas.
    return { color, alpha: clamp01(alpha) };
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
    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.font = "600 40px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("smartygym.com", VIDEO_WIDTH / 2, VIDEO_HEIGHT - 140);
    ctx.restore();
  }

  private drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, glowStrength: number) {
    const img = this.logo;
    if (!img || !img.naturalWidth) return;

    const aspect = img.naturalWidth / img.naturalHeight;
    const w = h * aspect;

    ctx.save();
    ctx.translate(x, y);

    // Glow
    ctx.shadowColor = `hsla(206, 89%, 68%, ${clamp01(glowStrength)})`;
    ctx.shadowBlur = lerp(8, 40, clamp01(glowStrength));

    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  private drawCard(ctx: CanvasRenderingContext2D, text: string, alpha: number, scale: number) {
    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.scale(scale, scale);

    const paddingX = 90;
    const paddingY = 70;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Measure text
    ctx.font = "800 84px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    const metrics = ctx.measureText(text);
    const w = metrics.width + paddingX * 2;
    const h = 170 + paddingY;

    ctx.globalAlpha = alpha;

    // Background
    ctx.fillStyle = "hsla(206, 89%, 68%, 0.15)";
    this.roundRect(ctx, -w / 2, -h / 2, w, h, 44);
    ctx.fill();

    // Border
    ctx.lineWidth = 6;
    ctx.strokeStyle = BRAND_LIGHT_BLUE;
    ctx.stroke();

    // Text
    ctx.fillStyle = BRAND_WHITE;
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

  // ===== Scene 1 =====
  private drawScene1LogoIntro(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);

    // Similar to: starts lower then expands upward
    const tIn = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const baseY = VIDEO_HEIGHT * 0.62;
    const y = lerp(VIDEO_HEIGHT * 0.78, baseY, tIn);

    const pulse = phase === "hold" ? 0.35 + 0.25 * (0.5 + 0.5 * Math.sin((phaseMs / 1000) * Math.PI * 2)) : 0.35;

    ctx.save();
    ctx.globalAlpha = a;
    this.drawLogo(ctx, VIDEO_WIDTH / 2, y, 190, pulse);
    ctx.restore();
  }

  // ===== Scene 2 =====
  private drawScene2ValueProp(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const s = 0.95 + 0.05 * easeOutCubic(phase === "in" ? phaseMs / Math.max(1, phaseDur) : 1);

    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);
    ctx.scale(s, s);
    ctx.globalAlpha = a;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 140px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    ctx.fillStyle = BRAND_RED;
    ctx.fillText("0% AI", 0, -80);

    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.fillText("100% Human", 0, 80);

    ctx.restore();
  }

  // ===== Scene 3 =====
  private drawScene3Wod(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const x = lerp(VIDEO_WIDTH * 0.75, VIDEO_WIDTH / 2, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = BRAND_WHITE;
    ctx.font = "900 120px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Workout of the Day", x, VIDEO_HEIGHT * 0.40);

    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.font = "800 96px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Every single day", x, VIDEO_HEIGHT * 0.48);

    ctx.fillStyle = MUTED_WHITE;
    ctx.font = "600 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("No guessing", x, VIDEO_HEIGHT * 0.60);
    ctx.fillText("No random training", x, VIDEO_HEIGHT * 0.66);

    ctx.restore();
  }

  // ===== Scene 4 =====
  private drawScene4TwoWorkouts(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const x = lerp(VIDEO_WIDTH * 0.25, VIDEO_WIDTH / 2, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";

    ctx.fillStyle = BRAND_WHITE;
    ctx.font = "900 120px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("2 Workouts. Every Day.", x, VIDEO_HEIGHT * 0.42);

    // Fade-in sublines on hold
    const baseY = VIDEO_HEIGHT * 0.55;

    const line1Delay = 200;
    const line2Delay = 500;

    const tHold = phase === "hold" ? phaseMs : phase === "out" ? phaseDur : 0;

    const line1Alpha = clamp01((tHold - line1Delay) / 350);
    const line2Alpha = clamp01((tHold - line2Delay) / 350);

    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.font = "800 80px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    ctx.globalAlpha = a * line1Alpha;
    ctx.fillText("1 Bodyweight", x, baseY);

    ctx.globalAlpha = a * line2Alpha;
    ctx.fillText("1 With Equipment", x, baseY + 110);

    ctx.restore();
  }

  // ===== Scene 5 =====
  private drawScene5QuickCards(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);

    const cards = [
      "Strength",
      "Cardio",
      "Calorie Burning",
      "Metabolic",
      "Mobility & Stability",
      "Challenge",
    ];

    if (phase === "out") {
      // Fade all
      this.drawCard(ctx, cards[cards.length - 1], a, 1);
      return;
    }

    // During in phase, advance every 400ms (like the React version)
    const tIn = phase === "in" ? phaseMs : phaseDur;
    const index = Math.min(cards.length - 1, Math.floor(tIn / 400));
    const local = tIn - index * 400;

    const pop = 0.85 + 0.15 * easeOutCubic(clamp01(local / 180));

    this.drawCard(ctx, cards[index], a, pop);
  }

  // ===== Scene 6 =====
  private drawScene6Difficulty(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);

    // Slide-in (slight)
    const t = phase === "in" ? easeOutCubic(phaseMs / Math.max(1, phaseDur)) : 1;
    const yOffset = lerp(-60, 0, t);

    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(0, yOffset);
    ctx.textAlign = "center";

    ctx.fillStyle = BRAND_WHITE;
    ctx.font = "900 104px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Different difficulty", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.40);

    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.font = "800 96px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Every day", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.48);

    const subWords = ["Safe.", "Professional.", "Science based periodization."];

    const holdMs = phase === "hold" ? phaseMs : phase === "out" ? phaseDur : 0;
    const revealed = Math.min(subWords.length, Math.floor(holdMs / 400) + 1);

    ctx.fillStyle = MUTED_WHITE;
    ctx.font = "600 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    const startY = VIDEO_HEIGHT * 0.62;
    const wordsText = subWords.slice(0, revealed).join(" ");
    ctx.fillText(wordsText, VIDEO_WIDTH / 2, startY);

    ctx.restore();
  }

  // ===== Scene 7 =====
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

    ctx.fillStyle = BRAND_WHITE;
    ctx.font = "900 96px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";

    ctx.fillText("It's like having", 0, -140);

    ctx.fillStyle = BRAND_LIGHT_BLUE;
    ctx.fillText("your personal trainer", 0, 0);

    ctx.fillStyle = BRAND_WHITE;
    ctx.fillText("ready every day", 0, 140);

    ctx.restore();
  }

  // ===== Scene 8 =====
  private drawScene8LogoOutro(ctx: CanvasRenderingContext2D, phase: Phase, phaseMs: number, phaseDur: number) {
    const a = this.applyPhaseAlpha(phase, phaseMs, phaseDur);

    const pulse = phase === "hold" ? 0.4 + 0.25 * (0.5 + 0.5 * Math.sin((phaseMs / 1000) * Math.PI * 2)) : 0.4;

    ctx.save();
    ctx.globalAlpha = a;

    this.drawLogo(ctx, VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.44, 230, pulse);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = MUTED_WHITE_80;
    ctx.font = "600 54px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Your Gym Re-imagined. Anywhere, Anytime.", VIDEO_WIDTH / 2, VIDEO_HEIGHT * 0.58);

    ctx.restore();
  }
}
