import { BRAND_IDENTITY } from "./brandingService";

interface AdConfig {
  platform: "Instagram" | "TikTok" | "Facebook";
  purpose: string;
  details: string;
  backgroundImage: string;
}

interface Dimensions {
  width: number;
  height: number;
}

const PLATFORM_DIMENSIONS: Record<string, Dimensions> = {
  Instagram: { width: 1080, height: 1080 },
  TikTok: { width: 1080, height: 1920 },
  Facebook: { width: 1200, height: 628 },
};

export class AdComposer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    this.ctx = context;
  }

  async composeAd(config: AdConfig): Promise<string> {
    const dimensions = PLATFORM_DIMENSIONS[config.platform];
    this.canvas.width = dimensions.width;
    this.canvas.height = dimensions.height;

    // Load background image
    const bgImage = await this.loadImage(config.backgroundImage);
    
    // Draw darkened background
    this.drawBackground(bgImage, dimensions);
    
    // Add gradient overlay for better text contrast
    this.addGradientOverlay(dimensions);
    
    // Draw logo
    await this.drawLogo(dimensions);
    
    // Draw content based on platform and purpose
    this.drawContent(config, dimensions);
    
    // Convert to base64
    return this.canvas.toDataURL("image/jpeg", 0.9);
  }

  private drawBackground(image: HTMLImageElement, dimensions: Dimensions): void {
    // Calculate scaling to cover entire canvas
    const scale = Math.max(
      dimensions.width / image.width,
      dimensions.height / image.height
    );
    
    const scaledWidth = image.width * scale;
    const scaledHeight = image.height * scale;
    const x = (dimensions.width - scaledWidth) / 2;
    const y = (dimensions.height - scaledHeight) / 2;
    
    this.ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // Add dark overlay for text readability
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  private addGradientOverlay(dimensions: Dimensions): void {
    const gradient = this.ctx.createLinearGradient(
      0,
      0,
      0,
      dimensions.height
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
    gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.6)");
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }

  private async drawLogo(dimensions: Dimensions): Promise<void> {
    try {
      // Use window.location.origin to ensure proper URL resolution
      const logoUrl = `${window.location.origin}${BRAND_IDENTITY.logo}`;
      const logo = await this.loadImage(logoUrl);
      const logoSize = dimensions.width * 0.15;
      const x = dimensions.width - logoSize - 40;
      const y = 40;
      
      // Draw logo with slight shadow
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      this.ctx.shadowBlur = 10;
      this.ctx.drawImage(logo, x, y, logoSize, logoSize);
      this.ctx.shadowBlur = 0;
    } catch (error) {
      console.error("Failed to load logo:", error);
      // Continue without logo if it fails to load
    }
  }

  private drawContent(config: AdConfig, dimensions: Dimensions): void {
    const { platform, purpose, details } = config;
    
    // Set text styling
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    if (platform === "Instagram" || platform === "Facebook") {
      this.drawInstagramFacebookContent(centerX, centerY, purpose, details, dimensions);
    } else if (platform === "TikTok") {
      this.drawTikTokContent(centerX, dimensions, purpose, details);
    }
  }

  private drawInstagramFacebookContent(
    centerX: number,
    centerY: number,
    purpose: string,
    details: string,
    dimensions: Dimensions
  ): void {
    // Brand name at top
    this.ctx.font = `bold ${dimensions.width * 0.05}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#D4AF37"; // Gold
    this.ctx.fillText(BRAND_IDENTITY.name.toUpperCase(), centerX, centerY - 200);
    
    // Main headline
    this.ctx.font = `bold ${dimensions.width * 0.06}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawMultilineText(details.toUpperCase(), centerX, centerY - 80, dimensions.width * 0.9, 80);
    
    // Purpose/category
    this.ctx.font = `${dimensions.width * 0.035}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(this.getPurposeLabel(purpose), centerX, centerY + 80);
    
    // Tagline at bottom
    this.ctx.font = `italic ${dimensions.width * 0.03}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(BRAND_IDENTITY.tagline, centerX, dimensions.height - 80);
  }

  private drawTikTokContent(
    centerX: number,
    dimensions: Dimensions,
    purpose: string,
    details: string
  ): void {
    // Brand name at top third
    const topY = dimensions.height * 0.3;
    this.ctx.font = `bold ${dimensions.width * 0.06}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(BRAND_IDENTITY.name.toUpperCase(), centerX, topY);
    
    // Main headline in middle
    const middleY = dimensions.height * 0.5;
    this.ctx.font = `bold ${dimensions.width * 0.065}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawMultilineText(details.toUpperCase(), centerX, middleY, dimensions.width * 0.9, 90);
    
    // Purpose with emoji
    const bottomY = dimensions.height * 0.7;
    this.ctx.font = `${dimensions.width * 0.04}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(`🔥 ${this.getPurposeLabel(purpose)} 🔥`, centerX, bottomY);
    
    // Tagline at bottom
    this.ctx.font = `italic ${dimensions.width * 0.035}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(BRAND_IDENTITY.tagline, centerX, dimensions.height - 100);
  }

  private drawMultilineText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(" ");
    let line = "";
    let lineY = y;
    const lines: string[] = [];
    
    // Build lines
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== "") {
        lines.push(line);
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);
    
    // Draw centered lines
    const startY = lineY - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      this.ctx.fillText(line.trim(), x, startY + index * lineHeight);
    });
  }

  private getPurposeLabel(purpose: string): string {
    const labels: Record<string, string> = {
      new_workout: "NEW WORKOUT",
      new_program: "NEW PROGRAM",
      awareness: "JOIN US TODAY",
      special_offer: "LIMITED OFFER",
      personal_training: "PERSONAL TRAINING",
    };
    return labels[purpose] || "SMARTY GYM";
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }
}
