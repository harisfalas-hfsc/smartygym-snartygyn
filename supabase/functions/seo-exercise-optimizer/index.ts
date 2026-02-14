import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BRANDED_KEYWORDS = [
  "SmartyGym Haris Falas",
  "SmartyGym Online Exercise",
  "SmartyGym Online Workout",
  "smartygym.com Online Fitness Platform",
  "SmartyGym Online Coaching",
  "SmartyGym Online Personal Training",
  "Haris Falas Coach",
  "Haris Falas Personal Training",
];

function buildKeywordBlock(exerciseName: string): string {
  return [`SmartyGym ${exerciseName}`, ...BRANDED_KEYWORDS].join(", ");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { offset = 0, limit = 100 } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: exercises, error: fetchError } = await supabase
      .from("exercises")
      .select("id, name, body_part, equipment, target, description")
      .range(offset, offset + limit - 1)
      .order("name");

    if (fetchError) throw new Error(fetchError.message);
    if (!exercises || exercises.length === 0) {
      return new Response(JSON.stringify({ done: true, updated: 0, seo: 0, skipped: 0, fetched: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updated = 0, seoCount = 0, skipped = 0;
    const errors: string[] = [];

    for (const ex of exercises) {
      const block = buildKeywordBlock(ex.name);

      if (ex.description && ex.description.includes("SmartyGym")) {
        skipped++;
      } else {
        const base = ex.description?.trim()
          ? ex.description
          : `${ex.name} is a ${ex.body_part} exercise using ${ex.equipment} that targets the ${ex.target}.`;
        const { error } = await supabase
          .from("exercises")
          .update({ description: `${base} | ${block}` })
          .eq("id", ex.id);
        if (error) { errors.push(`${ex.name}: ${error.message}`); continue; }
        updated++;
      }

      // Upsert SEO metadata
      const metaTitle = `SmartyGym ${ex.name} - Online Exercise Library`;
      const metaDesc = `${ex.name} exercise on SmartyGym by Haris Falas. Target: ${ex.target}. Equipment: ${ex.equipment}. Body part: ${ex.body_part}. Online fitness platform smartygym.com.`.slice(0, 160);
      const keywords = [`SmartyGym ${ex.name}`, ...BRANDED_KEYWORDS, ex.body_part, ex.equipment, ex.target, ex.name].filter(Boolean);
      const altText = `SmartyGym ${ex.name} exercise demonstration - Haris Falas online fitness platform smartygym.com`;

      const { error: seoErr } = await supabase.from("seo_metadata").upsert(
        { content_type: "exercise", content_id: ex.id, meta_title: metaTitle, meta_description: metaDesc, keywords, image_alt_text: altText, last_refreshed_at: new Date().toISOString() },
        { onConflict: "content_type,content_id" }
      );
      if (seoErr) { errors.push(`SEO ${ex.name}: ${seoErr.message}`); continue; }
      seoCount++;
    }

    return new Response(JSON.stringify({ done: exercises.length < limit, fetched: exercises.length, updated, seo: seoCount, skipped, errors: errors.slice(0, 10) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
