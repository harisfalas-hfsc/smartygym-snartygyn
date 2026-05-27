// Daily job: pings search engines that the sitemap has refreshed and
// re-queues any content updated in the last 24 hours into the IndexNow queue.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITEMAP_URL = "https://smartygym.com/sitemap.xml";

function workoutSlug(cat: string | null): string | null {
  if (!cat) return null;
  const u = cat.toUpperCase().trim();
  const map: Record<string, string> = {
    "STRENGTH": "strength",
    "CALORIE BURNING": "calorie-burning",
    "METABOLIC": "metabolic",
    "CARDIO": "cardio",
    "MOBILITY & STABILITY": "mobility",
    "CHALLENGE": "challenge",
    "PILATES": "pilates",
    "RECOVERY": "recovery",
    "MICRO-WORKOUTS": "micro-workouts",
  };
  return map[u] || null;
}
function programSlug(cat: string | null): string | null {
  if (!cat) return null;
  const u = cat.toUpperCase().trim();
  const map: Record<string, string> = {
    "CARDIO ENDURANCE": "cardio-endurance",
    "FUNCTIONAL STRENGTH": "functional-strength",
    "MUSCLE HYPERTROPHY": "muscle-hypertrophy",
    "WEIGHT LOSS": "weight-loss",
    "LOW BACK PAIN": "low-back-pain",
    "MOBILITY & STABILITY": "mobility-stability",
  };
  return map[u] || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const queued: { url: string; content_type: string; content_id: string }[] = [];

  const [w, p, b] = await Promise.all([
    supabase
      .from("admin_workouts")
      .select("id, category, updated_at, is_visible")
      .eq("is_visible", true)
      .gte("updated_at", since),
    supabase
      .from("admin_training_programs")
      .select("id, category, updated_at, is_visible")
      .eq("is_visible", true)
      .gte("updated_at", since),
    supabase
      .from("blog_articles")
      .select("id, slug, updated_at, is_published")
      .eq("is_published", true)
      .gte("updated_at", since),
  ]);

  for (const row of w.data || []) {
    const slug = workoutSlug(row.category);
    if (slug && row.id)
      queued.push({ url: `https://smartygym.com/workout/${slug}/${row.id}`, content_type: "workout", content_id: row.id });
  }
  for (const row of p.data || []) {
    const slug = programSlug(row.category);
    if (slug && row.id)
      queued.push({ url: `https://smartygym.com/trainingprogram/${slug}/${row.id}`, content_type: "program", content_id: row.id });
  }
  for (const row of b.data || []) {
    if (row.slug)
      queued.push({ url: `https://smartygym.com/blog/${row.slug}`, content_type: "article", content_id: String(row.id) });
  }

  if (queued.length > 0) {
    await supabase.from("indexnow_queue").insert(queued);
  }

  // Ping Google + Bing about the sitemap (legacy ping endpoints still accepted).
  const pings: Record<string, number> = {};
  for (const u of [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
  ]) {
    try {
      const r = await fetch(u, { method: "GET" });
      pings[u] = r.status;
    } catch (e) {
      pings[u] = 0;
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      queued_for_indexnow: queued.length,
      sitemap_pings: pings,
      window_since: since,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});