import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // AI image generation is intentionally disabled.
  // Upload your exact brand assets via the Admin UI instead.
  return new Response(
    JSON.stringify({
      success: false,
      error: "Feature graphic AI generation is disabled. Please upload your feature graphic file instead.",
    }),
    {
      status: 410,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
