// Drains public.indexnow_queue and submits URLs to IndexNow (Bing/Yandex).
// Triggered every 5 minutes by pg_cron.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const HOST = "smartygym.com";
const INDEXNOW_KEY = Deno.env.get("INDEXNOW_KEY") || "smartygym-indexnow-key";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const BATCH_SIZE = 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { data: rows, error } = await supabase
      .from("indexnow_queue")
      .select("id, url")
      .is("processed_at", null)
      .order("queued_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) throw error;
    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "Queue empty" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // De-dup URLs in the batch
    const urlMap = new Map<string, number[]>();
    for (const r of rows) {
      const arr = urlMap.get(r.url) || [];
      arr.push(r.id);
      urlMap.set(r.url, arr);
    }
    const urlList = Array.from(urlMap.keys());

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    };

    const results: Record<string, { ok: boolean; status: number; error?: string }> = {};
    for (const endpoint of [
      "https://www.bing.com/indexnow",
      "https://yandex.com/indexnow",
    ]) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body: JSON.stringify(payload),
        });
        results[endpoint] = { ok: res.ok, status: res.status };
        if (!res.ok) results[endpoint].error = await res.text();
      } catch (e) {
        results[endpoint] = { ok: false, status: 0, error: String(e) };
      }
    }

    const succeeded = Object.values(results).some((r) => r.ok);
    const allIds = rows.map((r) => r.id);
    const lastError = succeeded
      ? null
      : Object.values(results).map((r) => r.error || `status ${r.status}`).join(" | ");

    const { error: updErr } = await supabase
      .from("indexnow_queue")
      .update({
        processed_at: succeeded ? new Date().toISOString() : null,
        attempts: succeeded ? undefined : (rows[0] as any).attempts + 1 || 1,
        last_error: lastError,
      })
      .in("id", allIds);
    if (updErr) console.error("queue update error", updErr);

    return new Response(
      JSON.stringify({
        success: true,
        processed: succeeded ? urlList.length : 0,
        urls: urlList.length,
        rows: rows.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("process-indexnow-queue error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});