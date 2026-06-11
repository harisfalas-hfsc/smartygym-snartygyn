import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Allows the request only if the caller is:
 *  1. Server-to-server using the service role key (cron jobs, DB triggers, other edge functions), OR
 *  2. A logged-in user with the 'admin' role.
 * Returns a 401 Response to send back, or null if authorized.
 */
export async function requireAdminOrServiceRole(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  const unauthorized = () =>
    new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return unauthorized();

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (serviceRoleKey && token === serviceRoleKey) return null;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey,
    );
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return unauthorized();

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) return unauthorized();
    return null;
  } catch (_e) {
    return unauthorized();
  }
}