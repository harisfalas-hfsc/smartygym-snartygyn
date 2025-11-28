import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all articles with broken image paths
    const { data: articles, error: fetchError } = await supabase
      .from("blog_articles")
      .select("id, title, category, slug, image_url")
      .or("image_url.like./src/%,image_url.is.null");

    if (fetchError) throw fetchError;

    console.log(`Found ${articles?.length || 0} articles to fix`);

    const results: any[] = [];

    for (const article of articles || []) {
      try {
        console.log(`Processing article: ${article.title}`);

        // Create category-specific prompt
        let categoryContext = "";
        switch (article.category?.toLowerCase()) {
          case "fitness":
            categoryContext = "fitness, strength training, athletic performance, gym equipment, exercise, muscular athlete";
            break;
          case "nutrition":
            categoryContext = "healthy food, nutrition, meal prep, vitamins, supplements, balanced diet, fresh ingredients";
            break;
          case "wellness":
            categoryContext = "wellness, meditation, sleep, recovery, mental health, peaceful, relaxation, balance";
            break;
          default:
            categoryContext = "fitness, health, wellness";
        }

        const prompt = `Professional blog article featured image for an article titled "${article.title}". 
The image should visually represent: ${categoryContext}.
Create a high-quality, professional photograph suitable for a fitness blog.
Style: Modern, clean, vibrant colors, excellent lighting.
NO TEXT OR WORDS in the image - just the visual scene.
Horizontal aspect ratio (16:9).
Ultra high resolution.`;

        // Generate image
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image-preview",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!response.ok) {
          console.error(`Failed to generate image for ${article.title}: ${response.status}`);
          results.push({ id: article.id, title: article.title, status: "failed", error: `API error: ${response.status}` });
          continue;
        }

        const data = await response.json();
        const base64ImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (!base64ImageUrl) {
          results.push({ id: article.id, title: article.title, status: "failed", error: "No image generated" });
          continue;
        }

        // Extract base64 data
        const base64Data = base64ImageUrl.split(",")[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Generate unique filename
        const timestamp = Date.now();
        const safeSlug = (article.slug || article.title)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .substring(0, 50);
        const fileName = `${safeSlug}-${timestamp}.jpg`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, bytes, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload failed for ${article.title}:`, uploadError);
          results.push({ id: article.id, title: article.title, status: "failed", error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        const publicUrl = urlData.publicUrl;

        // Update article in database
        const { error: updateError } = await supabase
          .from("blog_articles")
          .update({ image_url: publicUrl })
          .eq("id", article.id);

        if (updateError) {
          results.push({ id: article.id, title: article.title, status: "failed", error: updateError.message });
          continue;
        }

        results.push({ id: article.id, title: article.title, status: "success", imageUrl: publicUrl });
        console.log(`Successfully updated: ${article.title}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error(`Error processing ${article.title}:`, error);
        results.push({ id: article.id, title: article.title, status: "failed", error: error.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} articles`,
        results 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error fixing blog images:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
