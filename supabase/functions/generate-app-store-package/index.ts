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
      subtitle: "Your gym reimagined anywhere, anytime",
      short_description: "Professional fitness coaching with expert-designed workouts and training programs.",
      keywords: "fitness,workout,gym,training,exercise,strength,personal trainer,HIIT,muscle,weight loss",
      full_description: "SmartyGym - Professional fitness coaching",
      whats_new: "Version 1.0.0 - Initial Release",
      promotional_text: "Professional workouts designed by Sports Scientist Haris Falas.",
      support_url: "https://smartygym.com/contact",
      marketing_url: "https://smartygym.com",
      privacy_policy_url: "https://smartygym.com/privacy-policy",
      terms_of_service_url: "https://smartygym.com/terms-of-service",
      support_email: "support@smartygym.com",
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

    // Generate Word document content as XML (Office Open XML format)
    const generateWordXml = () => {
      const escapeXml = (str: string) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');
      };

      const addParagraph = (text: string, style: string = "Normal") => {
        return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
      };

      const addHeading = (text: string, level: number = 1) => {
        return `<w:p><w:pPr><w:pStyle w:val="Heading${level}"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(text)}</w:t></w:r></w:p>`;
      };

      const addLink = (text: string, url: string) => {
        return `<w:p><w:r><w:t>${escapeXml(text)}: </w:t></w:r><w:hyperlink r:id="rId1"><w:r><w:rPr><w:color w:val="0000FF"/><w:u w:val="single"/></w:rPr><w:t>${escapeXml(url)}</w:t></w:r></w:hyperlink></w:p>`;
      };

      const documentContent = `
        ${addHeading("SMARTYGYM - APP STORE SUBMISSION PACKAGE")}
        ${addParagraph("Generated: " + new Date().toISOString())}
        ${addParagraph("")}
        
        ${addHeading("BASIC INFORMATION", 2)}
        ${addParagraph("App Name: " + settings.app_name)}
        ${addParagraph("Subtitle (iOS): " + settings.subtitle)}
        ${addParagraph("Short Description (Android): " + settings.short_description)}
        ${addParagraph("Category: " + settings.category)}
        ${addParagraph("Content Rating: " + settings.content_rating)}
        ${addParagraph("")}
        
        ${addHeading("KEYWORDS", 2)}
        ${addParagraph(settings.keywords)}
        ${addParagraph("")}
        
        ${addHeading("FULL DESCRIPTION", 2)}
        ${settings.full_description.split('\n').map((line: string) => addParagraph(line)).join('')}
        ${addParagraph("")}
        
        ${addHeading("WHAT'S NEW", 2)}
        ${settings.whats_new.split('\n').map((line: string) => addParagraph(line)).join('')}
        ${addParagraph("")}
        
        ${addHeading("PROMOTIONAL TEXT", 2)}
        ${addParagraph(settings.promotional_text)}
        ${addParagraph("")}
        
        ${addHeading("LINKS & CONTACT", 2)}
        ${addParagraph("Privacy Policy URL: " + settings.privacy_policy_url)}
        ${addParagraph("Terms of Service URL: " + settings.terms_of_service_url)}
        ${addParagraph("Support URL: " + settings.support_url)}
        ${addParagraph("Marketing URL: " + settings.marketing_url)}
        ${addParagraph("Support Email: " + settings.support_email)}
        ${addParagraph("")}
        
        ${addHeading("GENERATED ASSETS", 2)}
        ${addParagraph("APP ICONS:")}
        ${organizedAssets.icons.length > 0 
          ? organizedAssets.icons.map(a => addParagraph(`  • ${a.file_name} (${a.width}x${a.height}) - ${a.storage_url}`)).join('')
          : addParagraph("  ⚠️ No icons generated yet. Run 'Generate App Icons' first.")}
        ${addParagraph("")}
        ${addParagraph("FEATURE GRAPHIC (Android):")}
        ${organizedAssets.featureGraphics.length > 0
          ? organizedAssets.featureGraphics.map(a => addParagraph(`  • ${a.file_name} (${a.width}x${a.height}) - ${a.storage_url}`)).join('')
          : addParagraph("  ⚠️ No feature graphic generated yet. Run 'Generate Feature Graphic' first.")}
        ${addParagraph("")}
        
        ${addHeading("SUBMISSION CHECKLIST", 2)}
        ${addParagraph("iOS App Store:")}
        ${addParagraph("□ App icon 1024x1024")}
        ${addParagraph("□ Screenshots for iPhone 6.7\" (1290x2796)")}
        ${addParagraph("□ Screenshots for iPhone 6.5\" (1284x2778)")}
        ${addParagraph("□ Screenshots for iPhone 5.5\" (1242x2208)")}
        ${addParagraph("□ App name, subtitle, keywords entered")}
        ${addParagraph("□ Full description entered")}
        ${addParagraph("□ Privacy policy URL added")}
        ${addParagraph("")}
        ${addParagraph("Google Play Store:")}
        ${addParagraph("□ App icon 512x512")}
        ${addParagraph("□ Feature graphic 1024x500")}
        ${addParagraph("□ Phone screenshots (1080x1920)")}
        ${addParagraph("□ Short description (80 chars max)")}
        ${addParagraph("□ Full description entered")}
        ${addParagraph("□ Privacy policy URL added")}
        ${addParagraph("")}
        
        ${addHeading("NOTES FOR APPY PIE", 2)}
        ${addParagraph("1. All text content above is ready to copy-paste into app store listings.")}
        ${addParagraph("2. Download assets from the URLs provided above.")}
        ${addParagraph("3. For resizing icons to all required sizes, use https://appicon.co/")}
        ${addParagraph("4. Contact support@smartygym.com for any questions.")}
      `;

      return documentContent;
    };

    // Create the DOCX package (simplified - single file XML)
    const wordXmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<?mso-application progid="Word.Document"?>
<w:wordDocument xmlns:w="http://schemas.microsoft.com/office/word/2003/wordml"
                xmlns:v="urn:schemas-microsoft-com:vml"
                xmlns:w10="urn:schemas-microsoft-com:office:word"
                xmlns:sl="http://schemas.microsoft.com/schemaLibrary/2003/core"
                xmlns:aml="http://schemas.microsoft.com/aml/2001/core"
                xmlns:wx="http://schemas.microsoft.com/office/word/2003/auxHint"
                xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:dt="uuid:C2F41010-65B3-11d1-A29F-00AA00C14882">
  <w:body>
    ${generateWordXml()}
  </w:body>
</w:wordDocument>`;

    // Upload as Word XML document
    const textEncoder = new TextEncoder();
    const documentData = textEncoder.encode(wordXmlContent);
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
