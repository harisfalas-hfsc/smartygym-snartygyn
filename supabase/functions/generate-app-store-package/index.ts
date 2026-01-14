import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Fetch app store settings from database
    const { data: settingsData, error: settingsError } = await supabase
      .from("app_store_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error("[GENERATE-APP-STORE-PACKAGE] Error fetching settings:", settingsError);
    }

    // Use settings from database or defaults
    const settings = settingsData || {
      app_name: "SmartyGym",
      subtitle: "Your Gym Re-Imagined Anywhere, Anytime",
      short_description: "Professional fitness coaching with expert-designed workouts and training programs.",
      keywords: "fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss",
      full_description: "SmartyGym - Professional fitness coaching",
      whats_new: "Version 1.0.0 - Initial Release",
      promotional_text: "Professional workouts designed by Sports Scientist Haris Falas.",
      support_url: "https://smartygym.com/contact",
      marketing_url: "https://smartygym.com",
      privacy_policy_url: "https://smartygym.com/privacy-policy",
      terms_of_service_url: "https://smartygym.com/terms-of-service",
      support_email: "smartygym@outlook.com",
      category: "Health & Fitness",
      content_rating: "4+ (Apple) / Everyone (Google)",
    };

    // Fetch all generated assets
    const { data: assets, error: assetsError } = await supabase
      .from("app_store_assets")
      .select("*")
      .not("storage_url", "is", null)
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

    // Generate a clean, properly formatted Word document
    const generateWordDocument = () => {
      const escapeXml = (str: string) => {
        if (!str) return '';
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const createParagraph = (text: string, bold = false, fontSize = 24) => {
        const boldTag = bold ? '<w:b/>' : '';
        return `
          <w:p>
            <w:pPr><w:spacing w:after="200"/></w:pPr>
            <w:r>
              <w:rPr>${boldTag}<w:sz w:val="${fontSize}"/></w:rPr>
              <w:t xml:space="preserve">${escapeXml(text)}</w:t>
            </w:r>
          </w:p>`;
      };

      const createHeading = (text: string, level = 1) => {
        const fontSize = level === 1 ? 48 : level === 2 ? 36 : 28;
        return `
          <w:p>
            <w:pPr><w:spacing w:before="400" w:after="200"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:sz w:val="${fontSize}"/><w:color w:val="0EA5E9"/></w:rPr>
              <w:t>${escapeXml(text)}</w:t>
            </w:r>
          </w:p>`;
      };

      const createField = (label: string, value: string) => {
        return `
          <w:p>
            <w:pPr><w:spacing w:after="100"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t xml:space="preserve">${escapeXml(label)}: </w:t>
            </w:r>
            <w:r>
              <w:rPr><w:sz w:val="22"/></w:rPr>
              <w:t xml:space="preserve">${escapeXml(value)}</w:t>
            </w:r>
          </w:p>`;
      };

      const createMultilineField = (label: string, value: string) => {
        const lines = value.split('\n').filter(l => l.trim());
        let content = `
          <w:p>
            <w:pPr><w:spacing w:before="200" w:after="100"/></w:pPr>
            <w:r>
              <w:rPr><w:b/><w:sz w:val="22"/></w:rPr>
              <w:t>${escapeXml(label)}:</w:t>
            </w:r>
          </w:p>`;
        
        lines.forEach(line => {
          content += `
            <w:p>
              <w:pPr><w:ind w:left="360"/><w:spacing w:after="60"/></w:pPr>
              <w:r>
                <w:rPr><w:sz w:val="22"/></w:rPr>
                <w:t xml:space="preserve">${escapeXml(line)}</w:t>
              </w:r>
            </w:p>`;
        });
        
        return content;
      };

      const dateStr = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      });

      return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
                xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint"
                xmlns:o="urn:schemas-microsoft-com:office:office">
  <w:body>
    ${createHeading("SMARTYGYM")}
    ${createHeading("App Store Submission Package", 2)}
    ${createParagraph("Generated: " + dateStr)}
    ${createParagraph("")}
    
    ${createHeading("Basic Information", 2)}
    ${createField("App Name", settings.app_name)}
    ${createField("Subtitle (iOS)", settings.subtitle)}
    ${createField("Short Description (Android, max 80 chars)", settings.short_description)}
    ${createField("Category", settings.category)}
    ${createField("Content Rating", settings.content_rating)}
    ${createParagraph("")}
    
    ${createHeading("Keywords", 2)}
    ${createParagraph(settings.keywords)}
    ${createParagraph("")}
    
    ${createHeading("Full Description", 2)}
    ${createMultilineField("Description", settings.full_description)}
    ${createParagraph("")}
    
    ${createHeading("What's New", 2)}
    ${createMultilineField("Release Notes", settings.whats_new)}
    ${createParagraph("")}
    
    ${createHeading("Promotional Text", 2)}
    ${createParagraph(settings.promotional_text)}
    ${createParagraph("")}
    
    ${createHeading("Links & Contact", 2)}
    ${createField("Privacy Policy URL", settings.privacy_policy_url)}
    ${createField("Terms of Service URL", settings.terms_of_service_url)}
    ${createField("Support URL", settings.support_url)}
    ${createField("Marketing URL", settings.marketing_url)}
    ${createField("Support Email", settings.support_email)}
    ${createParagraph("")}
    
    ${createHeading("Generated Assets", 2)}
    ${createParagraph("APP ICONS:", true)}
    ${organizedAssets.icons.length > 0 
      ? organizedAssets.icons.map(a => createParagraph(`• ${a.file_name} (${a.width}x${a.height})`)).join('')
      : createParagraph("⚠️ No icons generated yet. Run 'Generate App Icons' first.")}
    ${createParagraph("")}
    
    ${createParagraph("FEATURE GRAPHIC (Android):", true)}
    ${organizedAssets.featureGraphics.length > 0
      ? organizedAssets.featureGraphics.map(a => createParagraph(`• ${a.file_name} (${a.width}x${a.height})`)).join('')
      : createParagraph("⚠️ No feature graphic yet. Run 'Generate Feature Graphic' first.")}
    ${createParagraph("")}
    
    ${createHeading("Submission Checklist", 2)}
    ${createParagraph("iOS App Store:", true)}
    ${createParagraph("□ App icon 1024x1024")}
    ${createParagraph("□ Screenshots for iPhone 6.7\" (1290x2796)")}
    ${createParagraph("□ Screenshots for iPhone 6.5\" (1284x2778)")}
    ${createParagraph("□ Screenshots for iPhone 5.5\" (1242x2208)")}
    ${createParagraph("□ App name, subtitle, keywords entered")}
    ${createParagraph("□ Full description entered")}
    ${createParagraph("□ Privacy policy URL added")}
    ${createParagraph("")}
    
    ${createParagraph("Google Play Store:", true)}
    ${createParagraph("□ App icon 512x512")}
    ${createParagraph("□ Feature graphic 1024x500")}
    ${createParagraph("□ Phone screenshots (1080x1920)")}
    ${createParagraph("□ Short description (80 chars max)")}
    ${createParagraph("□ Full description entered")}
    ${createParagraph("□ Privacy policy URL added")}
    ${createParagraph("")}
    
    ${createHeading("Notes for Appy Pie", 2)}
    ${createParagraph("1. All text content above is ready to copy-paste into app store listings.")}
    ${createParagraph("2. Download assets from the Admin panel.")}
    ${createParagraph("3. For resizing icons to all required sizes, use https://appicon.co/")}
    ${createParagraph("4. Contact support@smartygym.com for any questions.")}
  </w:body>
</w:wordDocument>`;
    };

    // Upload as Word XML document
    const documentContent = generateWordDocument();
    const textEncoder = new TextEncoder();
    const documentData = textEncoder.encode(documentContent);
    const fileName = `SmartyGym-AppyPie-Submission-${new Date().toISOString().split('T')[0]}.doc`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("app-store-assets")
      .upload(`packages/${fileName}`, documentData, {
        contentType: "application/msword",
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
        fileType: "doc",
        content: {
          appName: settings.app_name,
          subtitle: settings.subtitle,
          shortDescription: settings.short_description,
          keywords: settings.keywords,
          fullDescription: settings.full_description,
          whatsNew: settings.whats_new,
          promotionalText: settings.promotional_text,
          supportUrl: settings.support_url,
          marketingUrl: settings.marketing_url,
          privacyPolicyUrl: settings.privacy_policy_url,
          termsOfServiceUrl: settings.terms_of_service_url,
          supportEmail: settings.support_email,
          category: settings.category,
          contentRating: settings.content_rating,
        },
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
