import { BRAND_IDENTITY } from "./brandingService";

interface AdConfig {
  platform: "Instagram" | "TikTok" | "Facebook";
  purpose: string;
  details: string;
  backgroundImage: string;
  customPrompt?: string;
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
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PERMANENT BRANDING ELEMENTS - NEVER REMOVE THESE
    // These MUST appear on every ad, regardless of user prompt
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 1. GOLD BORDER - Always around entire image
    this.drawGoldBorder(dimensions);
    
    // 2. LOGO - Always top right with adaptive visibility
    await this.drawLogo(dimensions);
    
    // 3. CONTENT - Platform-specific text and messaging
    this.drawContent(config, dimensions);
    
    // 4. WEBSITE URL - Always bottom center (smartgym.com)
    this.drawWebsite(dimensions);
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
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
    
    // Add moderate overlay for text readability without making it too dark
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
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

  private drawGoldBorder(dimensions: Dimensions): void {
    // PERMANENT ELEMENT: Gold border must ALWAYS appear around entire image
    const borderWidth = Math.max(12, dimensions.width * 0.012);
    this.ctx.strokeStyle = "#D4AF37"; // Brand gold color - NEVER CHANGE
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      dimensions.width - borderWidth,
      dimensions.height - borderWidth
    );
  }

  private async drawLogo(dimensions: Dimensions): Promise<void> {
    try {
      // PERMANENT ELEMENT: Logo must ALWAYS appear in top right
      const logoUrl = `${window.location.origin}${BRAND_IDENTITY.logo}`;
      const logo = await this.loadImage(logoUrl);
      const logoSize = dimensions.width * 0.12;
      const padding = Math.max(30, dimensions.width * 0.025);
      const x = dimensions.width - logoSize - padding;
      const y = padding;
      
      // Draw white background circle for contrast against any background
      const centerX = x + logoSize / 2;
      const centerY = y + logoSize / 2;
      const radius = logoSize / 2 + 8;
      
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add gold ring around logo for brand consistency
      this.ctx.strokeStyle = "#D4AF37";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Draw logo with strong shadow for depth
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
      this.ctx.drawImage(logo, x, y, logoSize, logoSize);
      
      // Reset shadow
      this.ctx.shadowColor = "transparent";
      this.ctx.shadowBlur = 0;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    } catch (error) {
      console.error("Failed to load logo:", error);
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
    const padding = Math.max(30, dimensions.width * 0.025);
    
    // Add text shadow for all text elements
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // Brand name at top
    this.ctx.font = `bold ${dimensions.width * 0.055}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#D4AF37"; // Gold
    this.ctx.fillText(BRAND_IDENTITY.name.toUpperCase(), centerX, centerY - 180);
    
    // Main headline - clean and prominent
    this.ctx.font = `bold ${dimensions.width * 0.068}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawMultilineText(details.toUpperCase(), centerX, centerY - 40, dimensions.width * 0.85, 90);
    
    // Purpose/category
    this.ctx.font = `${dimensions.width * 0.04}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(this.getPurposeLabel(purpose), centerX, centerY + 100);
    
    // Tagline - only once, positioned above website
    this.ctx.font = `italic ${dimensions.width * 0.032}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(BRAND_IDENTITY.tagline, centerX, dimensions.height - 110);
    
    // Reset shadow
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  private drawTikTokContent(
    centerX: number,
    dimensions: Dimensions,
    purpose: string,
    details: string
  ): void {
    const padding = Math.max(30, dimensions.width * 0.025);
    
    // Add text shadow for all text elements
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    // Brand name at top third
    const topY = dimensions.height * 0.28;
    this.ctx.font = `bold ${dimensions.width * 0.065}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(BRAND_IDENTITY.name.toUpperCase(), centerX, topY);
    
    // Main headline in middle - clean and prominent
    const middleY = dimensions.height * 0.48;
    this.ctx.font = `bold ${dimensions.width * 0.072}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.drawMultilineText(details.toUpperCase(), centerX, middleY, dimensions.width * 0.85, 95);
    
    // Purpose with emoji
    const bottomY = dimensions.height * 0.68;
    this.ctx.font = `${dimensions.width * 0.045}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#D4AF37";
    this.ctx.fillText(`🔥 ${this.getPurposeLabel(purpose)} 🔥`, centerX, bottomY);
    
    // Tagline - only once, positioned above website
    this.ctx.font = `italic ${dimensions.width * 0.038}px ${BRAND_IDENTITY.fonts.body}`;
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.fillText(BRAND_IDENTITY.tagline, centerX, dimensions.height - 130);
    
    // Reset shadow
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  private drawWebsite(dimensions: Dimensions): void {
    // PERMANENT ELEMENT: Website URL must ALWAYS appear at bottom center
    const centerX = dimensions.width / 2;
    const padding = Math.max(30, dimensions.width * 0.025);
    const bottomY = dimensions.height - padding - 15;
    
    // Add text shadow for visibility
    this.ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    this.ctx.shadowBlur = 8;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;
    
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.font = `bold ${dimensions.width * 0.04}px ${BRAND_IDENTITY.fonts.heading}`;
    this.ctx.fillStyle = "#D4AF37"; // Gold
    this.ctx.fillText("smartygym.com", centerX, bottomY);
    
    // Reset shadow
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
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
