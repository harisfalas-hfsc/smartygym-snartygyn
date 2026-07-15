export function requireServiceRole(req: Request, corsHeaders: Record<string, string>): Response | null {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const cronSecret = Deno.env.get("CRON_INVOKE_SECRET") || "";
  const providedCronSecret = (req.headers.get("x-cron-secret") || "").trim();

  const serviceOk = serviceRoleKey && token === serviceRoleKey;
  const cronOk = cronSecret && providedCronSecret && providedCronSecret === cronSecret;

  if (!serviceOk && !cronOk) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return null;
}