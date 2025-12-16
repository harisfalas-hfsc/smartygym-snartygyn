import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("EXERCISEDB_API_KEY");
    if (!apiKey) {
      throw new Error("EXERCISEDB_API_KEY not configured");
    }

    const body = await req.json().catch(() => ({}));
    const exerciseId = String(body?.exerciseId ?? "").trim();
    const resolution = Number(body?.resolution ?? 360);

    if (!exerciseId) {
      return new Response(JSON.stringify({ error: "Missing exerciseId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeResolution = Number.isFinite(resolution) && resolution > 0 ? resolution : 360;
    const url = `https://exercisedb.p.rapidapi.com/image?exerciseId=${encodeURIComponent(
      exerciseId
    )}&resolution=${encodeURIComponent(String(safeResolution))}`;

    console.log("Fetching ExerciseDB image", { exerciseId, resolution: safeResolution });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        "x-rapidapi-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ExerciseDB image error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `ExerciseDB image error: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = await response.arrayBuffer();

    // IMPORTANT: supabase-js FunctionsClient treats `application/octet-stream` as Blob.
    // This lets the frontend create an object URL for <img> without exposing API keys.
    return new Response(bytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in fetch-exercisedb-image:", error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
