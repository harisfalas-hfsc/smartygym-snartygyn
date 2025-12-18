import { VideoScript } from "@/data/socialMediaVideoScripts";

// Video dimensions - 9:16 vertical for TikTok/Reels
const VIDEO_WIDTH = 1080;
const VIDEO_HEIGHT = 1920;
const FPS = 30;
const TOTAL_DURATION_MS = 25000; // 25 seconds exactly

// Brand colors (from website)
const BG_COLOR = "#0a0a0a";
const PRIMARY_BLUE = "#64B5F6";
const TEXT_WHITE = "#FFFFFF";
const MUTED_WHITE = "rgba(255, 255, 255, 0.8)";

// Scene timings (in milliseconds)
const LOGO_INTRO_END = 2000;
const CARD_DURATION = 5250; // ~5.25 seconds each
const LOGO_OUTRO_START = 23000;

// Animation timings
const ENTRY_DURATION = 300;
const EXIT_DURATION = 200;

// Easing functions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number): number {
  return t * t * t;
}

export class SocialMediaVideoRenderer {
  private logoImg: HTMLImageElement | null = null;
  private coachImg: HTMLImageElement | null = null;
  private logoLoaded = false;
  private coachLoaded = false;
  private script: VideoScript;

  constructor(script: VideoScript, logoUrl: string, coachUrl?: string) {
    this.script = script;
    
    // Load logo
    this.logoImg = new Image();
    this.logoImg.crossOrigin = "anonymous";
    this.logoImg.onload = () => {
      this.logoLoaded = true;
    };
    this.logoImg.onerror = () => {
      console.error("Failed to load logo");
      this.logoLoaded = true; // Continue anyway
    };
    this.logoImg.src = logoUrl;

    // Load coach photo if needed (Day 2)
    if (script.hasCoachPhoto && coachUrl) {
      this.coachImg = new Image();
      this.coachImg.crossOrigin = "anonymous";
      this.coachImg.onload = () => {
        this.coachLoaded = true;
      };
      this.coachImg.onerror = () => {
        console.error("Failed to load coach photo");
        this.coachLoaded = true;
      };
      this.coachImg.src = coachUrl;
    } else {
      this.coachLoaded = true;
    }
  }

  isReady(): boolean {
    return this.logoLoaded && this.coachLoaded;
  }

  async waitForAssets(timeoutMs = 5000): Promise<boolean> {
    const start = Date.now();
    while (!this.isReady() && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 50));
    }
    return this.isReady();
  }

  static getVideoDimensions() {
    return { width: VIDEO_WIDTH, height: VIDEO_HEIGHT };
  }

  static getFPS() {
    return FPS;
  }

  static getTotalDurationMs() {
    return TOTAL_DURATION_MS;
  }

  drawFrame(ctx: CanvasRenderingContext2D, tMs: number) {
    // Clear and fill background
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    // Determine which scene we're in
    if (tMs < LOGO_INTRO_END) {
      // Logo Intro (0-2s)
      this.drawLogoScene(ctx, tMs, true);
    } else if (tMs >= LOGO_OUTRO_START) {
      // Logo Outro (23-25s)
      this.drawLogoScene(ctx, tMs - LOGO_OUTRO_START, false);
    } else {
      // Content cards (2-23s)
      const cardTime = tMs - LOGO_INTRO_END;
      const cardIndex = Math.floor(cardTime / CARD_DURATION);
      const timeInCard = cardTime - cardIndex * CARD_DURATION;
      
      if (cardIndex < 4 && cardIndex < this.script.cards.length) {
        this.drawCard(ctx, cardIndex, timeInCard);
      }
    }

    // Always draw URL at bottom
    this.drawBottomUrl(ctx);
  }

  private drawLogoScene(ctx: CanvasRenderingContext2D, tMs: number, isIntro: boolean) {
    ctx.save();
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2);

    // Animation: scale up and fade
    let progress: number;
    let alpha: number;

    if (isIntro) {
      // Intro: start small, scale up, fade out at end
      progress = Math.min(1, tMs / 1500);
      const scaleProgress = easeOutCubic(progress);
      const scale = 0.5 + scaleProgress * 0.5; // 0.5 to 1.0
      
      // Fade out in last 500ms
      if (tMs > 1500) {
        alpha = 1 - (tMs - 1500) / 500;
      } else {
        alpha = Math.min(1, tMs / 300); // Fade in first 300ms
      }
      
      ctx.scale(scale, scale);
    } else {
      // Outro: same animation
      progress = Math.min(1, tMs / 1500);
      const scaleProgress = easeOutCubic(progress);
      const scale = 0.5 + scaleProgress * 0.5;
      
      if (tMs > 1500) {
        alpha = 1 - (tMs - 1500) / 500;
      } else {
        alpha = Math.min(1, tMs / 300);
      }
      
      ctx.scale(scale, scale);
    }

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Draw logo
    if (this.logoImg && this.logoLoaded && this.logoImg.complete && this.logoImg.naturalWidth > 0) {
      const logoSize = 400;
      ctx.drawImage(this.logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
    }

    ctx.restore();
  }

  private drawCard(ctx: CanvasRenderingContext2D, cardIndex: number, timeInCard: number) {
    const card = this.script.cards[cardIndex];
    if (!card) return;

    // Calculate animation phase
    let alpha = 1;
    let yOffset = 0;

    // Entry animation (slide up + fade in)
    if (timeInCard < ENTRY_DURATION) {
      const progress = easeOutCubic(timeInCard / ENTRY_DURATION);
      alpha = progress;
      yOffset = 50 * (1 - progress); // Slide up 50px
    }
    // Exit animation (fade out only)
    else if (timeInCard > CARD_DURATION - EXIT_DURATION) {
      const exitProgress = (timeInCard - (CARD_DURATION - EXIT_DURATION)) / EXIT_DURATION;
      alpha = 1 - easeInCubic(exitProgress);
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(0, yOffset);

    // Special handling for Day 2 Card 2 (coach photo)
    if (this.script.hasCoachPhoto && cardIndex === 1) {
      this.drawCoachCard(ctx, card);
    } else {
      this.drawTextCard(ctx, card);
    }

    ctx.restore();
  }

  private drawTextCard(ctx: CanvasRenderingContext2D, card: { line1: string; line2?: string }) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerY = VIDEO_HEIGHT / 2;

    // Line 1 - Headline (bold, larger)
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "700 64px Arial, sans-serif";
    
    if (card.line2) {
      // Two lines
      ctx.fillText(card.line1, VIDEO_WIDTH / 2, centerY - 50);
      
      // Line 2 - Supporting text (regular, smaller)
      ctx.fillStyle = MUTED_WHITE;
      ctx.font = "400 48px Arial, sans-serif";
      ctx.fillText(card.line2, VIDEO_WIDTH / 2, centerY + 50);
    } else {
      // Single line - center it
      ctx.fillText(card.line1, VIDEO_WIDTH / 2, centerY);
    }
  }

  private drawCoachCard(ctx: CanvasRenderingContext2D, card: { line1: string; line2?: string }) {
    const centerY = VIDEO_HEIGHT / 2;

    // Draw coach photo if available
    if (this.coachImg && this.coachLoaded && this.coachImg.complete && this.coachImg.naturalWidth > 0) {
      const photoSize = 300;
      const photoY = centerY - 150;
      
      // Draw circular photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(VIDEO_WIDTH / 2, photoY, photoSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        this.coachImg,
        VIDEO_WIDTH / 2 - photoSize / 2,
        photoY - photoSize / 2,
        photoSize,
        photoSize
      );
      ctx.restore();

      // Draw border around photo
      ctx.strokeStyle = PRIMARY_BLUE;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(VIDEO_WIDTH / 2, photoY, photoSize / 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw text below photo
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textY = centerY + 120;

    // Line 1 - Name
    ctx.fillStyle = TEXT_WHITE;
    ctx.font = "700 56px Arial, sans-serif";
    ctx.fillText(card.line1, VIDEO_WIDTH / 2, textY);

    // Line 2 - Title
    if (card.line2) {
      ctx.fillStyle = MUTED_WHITE;
      ctx.font = "400 40px Arial, sans-serif";
      ctx.fillText(card.line2, VIDEO_WIDTH / 2, textY + 60);
    }
  }

  private drawBottomUrl(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = MUTED_WHITE;
    ctx.font = "500 32px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("smartygym.com", VIDEO_WIDTH / 2, VIDEO_HEIGHT - 60);
    ctx.restore();
  }
}
