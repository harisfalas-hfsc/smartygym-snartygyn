import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// App Store text content
const APP_CONTENT = {
  appName: "SmartyGym - Expert Fitness",
  subtitle: "Expert Workouts & Training",
  shortDescription: "Professional fitness coaching with expert-designed workouts and training programs",
  keywords: "fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss",
  fullDescription: `🏋️ TRANSFORM YOUR FITNESS WITH EXPERT GUIDANCE

SmartyGym brings professional-grade fitness coaching directly to your device. Created by Sports Scientist Haris Falas, every workout is designed with scientific precision to maximize your results.

▸ WHY SMARTYGYM?

✓ 500+ Expert-Designed Workouts
Every exercise is crafted by certified fitness professionals—not AI. Real expertise, real results.

✓ Structured Training Programs
Follow 4-12 week programs designed for progressive overload and measurable improvements.

✓ Workout Generator
Get personalized workouts tailored to your available equipment, time, and fitness goals.

✓ Complete Exercise Library
Video demonstrations and detailed instructions for every movement.

✓ Professional Fitness Tools
• Calorie Calculator
• BMR Calculator  
• One Rep Max Calculator
• Progress Tracking

✓ Workout Logbook
Track every session, monitor progress, and stay accountable.

▸ MEMBERSHIP OPTIONS

FREE TIER
• Workout of the Day
• Basic fitness tools
• Exercise library access

GOLD MEMBERSHIP
• All 500+ premium workouts
• All training programs
• Advanced progress tracking
• €9.99/month

PLATINUM MEMBERSHIP  
• Everything in Gold
• Exclusive content
• Priority support
• €89.89/year (save 25%)

▸ ABOUT THE CREATOR

Haris Falas, Sports Scientist and certified fitness professional, brings over a decade of experience in strength training, athletic performance, and body transformation. Every program in SmartyGym reflects his commitment to evidence-based training.

▸ START TODAY

Download SmartyGym and experience the difference that expert coaching makes. Your transformation begins now.

Questions? Contact us at support@smartygym.com

---
Privacy Policy: https://smartygym.com/privacy-policy
Terms of Service: https://smartygym.com/terms-of-service`,
  whatsNew: `Version 1.0.0 - Initial Release

• 500+ expert-designed workouts
• 20+ structured training programs
• Workout generator with AI assistance
• Complete exercise library with videos
• Fitness calculators (BMR, Calories, 1RM)
• Workout logbook and progress tracking
• Daily Workout of the Day
• Gold & Platinum membership options`,
  promotionalText: "Professional workouts designed by Sports Scientist Haris Falas. 500+ expert programs. Real coaching, real results.",
  supportUrl: "https://smartygym.com/contact",
  marketingUrl: "https://smartygym.com",
  privacyPolicyUrl: "https://smartygym.com/privacy-policy",
  termsOfServiceUrl: "https://smartygym.com/terms-of-service",
  supportEmail: "support@smartygym.com",
  category: "Health & Fitness",
  contentRating: "4+ (Apple) / Everyone (Google)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[GENERATE-APP-STORE-PACKAGE] Generating package...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch all generated assets
    const { data: assets, error: assetsError } = await supabase
      .from("app_store_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (assetsError) {
      console.error("[GENERATE-APP-STORE-PACKAGE] Error fetching assets:", assetsError);
    }

    // Organize assets by type
    const organizedAssets = {
      icons: assets?.filter(a => a.asset_type === "icon" && a.storage_url) || [],
      featureGraphics: assets?.filter(a => a.asset_type === "feature-graphic" && a.storage_url) || [],
      screenshots: assets?.filter(a => a.asset_type === "screenshot" && a.storage_url) || [],
    };

    // Generate comprehensive text file for Appy Pie
    const submissionSheet = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    SMARTYGYM - APP STORE SUBMISSION SHEET                   ║
║                         For Appy Pie Submission                             ║
╚════════════════════════════════════════════════════════════════════════════╝

Generated: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════════════════════
                              BASIC INFORMATION
═══════════════════════════════════════════════════════════════════════════════

App Name: ${APP_CONTENT.appName}
Subtitle (iOS): ${APP_CONTENT.subtitle}
Short Description (Android): ${APP_CONTENT.shortDescription}
Category: ${APP_CONTENT.category}
Content Rating: ${APP_CONTENT.contentRating}

═══════════════════════════════════════════════════════════════════════════════
                                  KEYWORDS
═══════════════════════════════════════════════════════════════════════════════

${APP_CONTENT.keywords}

═══════════════════════════════════════════════════════════════════════════════
                              FULL DESCRIPTION
═══════════════════════════════════════════════════════════════════════════════

${APP_CONTENT.fullDescription}

═══════════════════════════════════════════════════════════════════════════════
                               WHAT'S NEW
═══════════════════════════════════════════════════════════════════════════════

${APP_CONTENT.whatsNew}

═══════════════════════════════════════════════════════════════════════════════
                            PROMOTIONAL TEXT
═══════════════════════════════════════════════════════════════════════════════

${APP_CONTENT.promotionalText}

═══════════════════════════════════════════════════════════════════════════════
                               LINKS & CONTACT
═══════════════════════════════════════════════════════════════════════════════

Privacy Policy URL: ${APP_CONTENT.privacyPolicyUrl}
Terms of Service URL: ${APP_CONTENT.termsOfServiceUrl}
Support URL: ${APP_CONTENT.supportUrl}
Marketing URL: ${APP_CONTENT.marketingUrl}
Support Email: ${APP_CONTENT.supportEmail}

═══════════════════════════════════════════════════════════════════════════════
                              GENERATED ASSETS
═══════════════════════════════════════════════════════════════════════════════

APP ICONS:
${organizedAssets.icons.length > 0 
  ? organizedAssets.icons.map(a => `  • ${a.file_name} (${a.width}x${a.height})\n    URL: ${a.storage_url}`).join('\n')
  : '  ⚠️ No icons generated yet. Run "Generate App Icons" first.'}

FEATURE GRAPHIC (Android):
${organizedAssets.featureGraphics.length > 0
  ? organizedAssets.featureGraphics.map(a => `  • ${a.file_name} (${a.width}x${a.height})\n    URL: ${a.storage_url}`).join('\n')
  : '  ⚠️ No feature graphic generated yet. Run "Generate Feature Graphic" first.'}

SCREENSHOTS:
${organizedAssets.screenshots.length > 0
  ? organizedAssets.screenshots.map(a => `  • ${a.file_name} (${a.width}x${a.height})\n    URL: ${a.storage_url}`).join('\n')
  : '  ℹ️ Screenshots need to be captured manually from the app.'}

═══════════════════════════════════════════════════════════════════════════════
                           SUBMISSION CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

iOS App Store:
□ App icon 1024x1024
□ Screenshots for iPhone 6.7" (1290x2796)
□ Screenshots for iPhone 6.5" (1284x2778)  
□ Screenshots for iPhone 5.5" (1242x2208)
□ App name, subtitle, keywords entered
□ Full description entered
□ Privacy policy URL added
□ Support URL added
□ Content rating questionnaire completed

Google Play Store:
□ App icon 512x512
□ Feature graphic 1024x500
□ Phone screenshots (1080x1920)
□ Short description (80 chars max)
□ Full description entered
□ Privacy policy URL added
□ Content rating questionnaire completed

═══════════════════════════════════════════════════════════════════════════════
                              NOTES FOR APPY PIE
═══════════════════════════════════════════════════════════════════════════════

1. All text content above is ready to copy-paste into app store listings.
2. Download assets from the URLs provided above.
3. If any assets are missing, generate them from the SmartyGym admin panel.
4. For resizing icons to all required sizes, use https://appicon.co/
5. Contact support@smartygym.com for any questions.

═══════════════════════════════════════════════════════════════════════════════
                               END OF DOCUMENT
═══════════════════════════════════════════════════════════════════════════════
`;

    // Upload the submission sheet as a text file
    const textEncoder = new TextEncoder();
    const submissionData = textEncoder.encode(submissionSheet);
    const fileName = `smartygym-appy-pie-submission-${Date.now()}.txt`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("app-store-assets")
      .upload(`packages/${fileName}`, submissionData, {
        contentType: "text/plain",
        upsert: true
      });

    if (uploadError) {
      console.error("[GENERATE-APP-STORE-PACKAGE] Upload error:", uploadError);
      throw new Error(`Failed to upload package: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("app-store-assets")
      .getPublicUrl(`packages/${fileName}`);

    console.log("[GENERATE-APP-STORE-PACKAGE] Package generated:", urlData.publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        packageUrl: urlData.publicUrl,
        fileName,
        content: APP_CONTENT,
        assets: organizedAssets,
        assetStatus: {
          hasIcons: organizedAssets.icons.length > 0,
          hasFeatureGraphic: organizedAssets.featureGraphics.length > 0,
          hasScreenshots: organizedAssets.screenshots.length > 0,
        },
        message: "Appy Pie submission package generated successfully!"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[GENERATE-APP-STORE-PACKAGE] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
