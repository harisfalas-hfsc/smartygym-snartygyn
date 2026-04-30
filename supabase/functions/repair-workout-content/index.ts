import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { sanitizeProtocolBlocks, validateProtocolBlocks } from "../_shared/protocol-sanitizer.ts";
import { injectProtocolExplanations } from "../_shared/protocol-explanations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: unknown) => {
  const extra = details ? ` ${JSON.stringify(details)}` : "";
  console.log(`[REPAIR-WORKOUT-CONTENT] ${step}${extra}`);
};

interface SweepStats {
  scanned: number;
  changed: number;
  flagged: number;
  perBug: Record<string, number>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase environment configuration");
    }

    // Service-role client used to bypass RLS for admin sweep + audit log writes.
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Auth gate: caller must be an admin.
    const authHeader = req.headers.get("Authorization") || "";
    const userToken = authHeader.replace(/^Bearer\s+/i, "");
    if (!userToken) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await supabase.auth.getUser(userToken);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { dryRun?: boolean; workoutIds?: string[] } = {};
    try { body = await req.json(); } catch { /* empty body ok */ }
    const dryRun = body.dryRun === true;
    const idFilter = Array.isArray(body.workoutIds) ? body.workoutIds : null;

    log("Starting sweep", { dryRun, idFilter: idFilter?.length || "ALL" });

    let query = supabase
      .from("admin_workouts")
      .select("id, name, format, main_workout, finisher, warm_up, cool_down, activation, instructions");
    if (idFilter && idFilter.length > 0) query = query.in("id", idFilter);

    const { data: rows, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    const stats: SweepStats = { scanned: 0, changed: 0, flagged: 0, perBug: {} };
    const reports: Array<Record<string, unknown>> = [];

    for (const row of rows || []) {
      stats.scanned += 1;

      const sweepMain = sanitizeProtocolBlocks(row.main_workout || "");
      const sweepFin = sanitizeProtocolBlocks(row.finisher || "");
      const allBugs = [...sweepMain.bugsFound, ...sweepFin.bugsFound];
      const allFixes = [...sweepMain.fixesApplied, ...sweepFin.fixesApplied];
      const allFlagged = [...sweepMain.flaggedForReview, ...sweepFin.flaggedForReview];
      const blockingIssues = validateProtocolBlocks(`${sweepMain.cleaned || ""} ${sweepFin.cleaned || ""}`);
      for (const issue of blockingIssues) {
        if (/Naked exercise prescription/i.test(issue)) {
          allFlagged.push({
            type: "naked_exercise_prescription",
            detail: issue,
          });
        }
      }

      // Auto-inject protocol explanations into instructions if missing.
      const enriched = injectProtocolExplanations(
        row.instructions || "",
        `${row.main_workout || ""} ${row.finisher || ""}`,
        row.format,
      );
      const instructionsChanged = enriched.injected.length > 0;
      if (instructionsChanged) {
        allFixes.push(`Injected protocol explanations: ${enriched.injected.join(", ")}`);
      }

      const mainChanged = sweepMain.cleaned !== (row.main_workout || "");
      const finChanged = sweepFin.cleaned !== (row.finisher || "");
      const changed = mainChanged || finChanged || instructionsChanged;

      for (const b of allBugs) {
        stats.perBug[b.type] = (stats.perBug[b.type] || 0) + 1;
      }
      for (const b of allFlagged) {
        const type = String((b as { type?: unknown }).type || "flagged_for_review");
        stats.perBug[type] = (stats.perBug[type] || 0) + 1;
      }

      if (changed) stats.changed += 1;
      if (allFlagged.length > 0) stats.flagged += 1;

      const report = {
        workout_id: row.id,
        workout_name: row.name,
        bugs_found: allBugs,
        fixes_applied: allFixes,
        flagged_for_review: allFlagged,
        changed,
      };
      reports.push(report);

      if (!dryRun && changed) {
        const update: Record<string, unknown> = {};
        if (mainChanged) update.main_workout = sweepMain.cleaned;
        if (finChanged) update.finisher = sweepFin.cleaned;
        if (instructionsChanged) update.instructions = enriched.html;
        const { error: upErr } = await supabase
          .from("admin_workouts")
          .update(update)
          .eq("id", row.id);
        if (upErr) {
          log("Update failed", { id: row.id, error: upErr.message });
          report.fixes_applied = [...allFixes, `UPDATE_FAILED: ${upErr.message}`];
        }
      }

      if (!dryRun && (allBugs.length > 0 || allFlagged.length > 0 || changed)) {
        await supabase.from("workout_repair_log").insert({
          workout_id: row.id,
          workout_name: row.name,
          bugs_found: allBugs,
          fixes_applied: allFixes,
          flagged_for_review: allFlagged,
          changed,
        });
      }
    }

    log("Sweep complete", stats);

    return new Response(
      JSON.stringify({ success: true, dryRun, stats, reports }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});