import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DurationAuditItem {
  id: string;
  name: string;
  category: string | null;
  oldDuration: string | null;
  newDuration: string;
  parsedSections: { section: string; minutes: number; source: string }[];
  totalMinutes: number;
  changed: boolean;
}

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[AUDIT-DURATIONS] ${step}`, details ? JSON.stringify(details) : '');
}

/**
 * Count <li> items in the <ul> immediately following a section header.
 */
function countExercisesAfterEmoji(html: string, emoji: string): number {
  const idx = html.indexOf(emoji);
  if (idx === -1) return 0;
  const afterEmoji = html.substring(idx);
  const ulMatch = afterEmoji.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!ulMatch) return 0;
  const liMatches = ulMatch[1].match(/<li/gi);
  return liMatches ? liMatches.length : 0;
}

/**
 * Parse section durations from workout HTML content.
 * Splits HTML into individual <p> tags and checks each for section emojis.
 */
function parseSectionDurations(html: string, category: string | null): {
  sections: { section: string; minutes: number; source: string }[];
  total: number;
  confidence: 'high' | 'medium' | 'low';
} {
  if (!html) return { sections: [], total: 0, confidence: 'low' };

  const sections: { section: string; minutes: number; source: string }[] = [];

  // Split HTML into individual paragraph blocks
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = pRegex.exec(html)) !== null) {
    paragraphs.push(m[0]);
  }

  const sectionConfig = [
    { emoji: '🧽', name: 'Soft Tissue', defaultMin: 5 },
    { emoji: '🔥', name: 'Activation', defaultMin: 10 },
    { emoji: '💪', name: 'Main Workout', defaultMin: 0 },
    { emoji: '⚡', name: 'Finisher', defaultMin: 0 },
    { emoji: '🧘', name: 'Cool Down', defaultMin: 10 },
  ];

  let parsedCount = 0;

  for (const config of sectionConfig) {
    // Find the specific paragraph containing this emoji
    const matchingP = paragraphs.find(p => p.includes(config.emoji));
    if (!matchingP) continue;

    const headerText = matchingP.replace(/<[^>]*>/g, '').trim();
    let minutes = 0;
    let source = '';

    // Pattern: "5'" or "10'" or "24'" (prime / apostrophe notation)
    const primeMatch = headerText.match(/(\d+)[\u2019'ʼ]/);
    if (primeMatch) {
      minutes = parseInt(primeMatch[1]);
      source = 'explicit';
    }

    // Pattern: "(8-minute AMRAP)" or "(15-minute EMOM)"
    if (!minutes) {
      const minuteWordMatch = headerText.match(/(\d+)\s*-?\s*minute/i);
      if (minuteWordMatch) {
        minutes = parseInt(minuteWordMatch[1]);
        source = 'explicit';
      }
    }

    // Pattern: "20 min"
    if (!minutes) {
      const minMatch = headerText.match(/(\d+)\s*min(?:ute)?s?\b/i);
      if (minMatch) {
        minutes = parseInt(minMatch[1]);
        source = 'explicit';
      }
    }

    // Pattern: range like "10-15'" → average
    if (!minutes) {
      const rangeMatch = headerText.match(/(\d+)\s*-\s*(\d+)\s*(?:[\u2019'ʼ]|min)/i);
      if (rangeMatch) {
        minutes = Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2);
        source = 'range_avg';
      }
    }

    // Fallback estimation for sections without explicit time
    if (!minutes) {
      if (config.name === 'Soft Tissue') {
        minutes = config.defaultMin;
        source = 'default';
      } else if (config.name === 'Activation') {
        minutes = config.defaultMin;
        source = 'default';
      } else if (config.name === 'Cool Down') {
        minutes = config.defaultMin;
        source = 'default';
      } else if (config.name === 'Main Workout') {
        const exerciseCount = countExercisesAfterEmoji(html, config.emoji);
        if (category === 'STRENGTH' || category === 'MOBILITY & STABILITY' || category === 'PILATES') {
          minutes = Math.max(15, Math.min(35, exerciseCount * 3));
        } else {
          minutes = Math.max(12, Math.min(30, exerciseCount * 2));
        }
        source = `estimated_${exerciseCount}_exercises`;
      } else if (config.name === 'Finisher') {
        if (/for\s*time/i.test(headerText)) {
          minutes = 12;
          source = 'for_time_estimate';
        } else {
          const exerciseCount = countExercisesAfterEmoji(html, config.emoji);
          minutes = Math.max(5, Math.min(15, exerciseCount * 2));
          source = `estimated_${exerciseCount}_exercises`;
        }
      }
    } else {
      parsedCount++;
    }

    if (minutes > 0) {
      sections.push({ section: config.name, minutes, source });
    }
  }

  const total = sections.reduce((sum, s) => sum + s.minutes, 0);
  const confidence: 'high' | 'medium' | 'low' =
    parsedCount >= 4 ? 'high' : parsedCount >= 2 && sections.length >= 4 ? 'medium' : 'low';

  return { sections, total, confidence };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let dryRun = false;
    let fixOnly: string[] | null = null;
    let minConfidence = 'medium';

    try {
      const body = await req.json();
      dryRun = body?.dryRun ?? false;
      fixOnly = body?.fixOnly ?? null;
      minConfidence = body?.minConfidence ?? 'medium';
    } catch {
      dryRun = true;
    }

    logStep("Starting duration audit", { dryRun, fixOnly: fixOnly?.length ?? "all", minConfidence });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from("admin_workouts")
      .select("id, name, category, duration, main_workout, format, is_workout_of_day")
      .not("category", "eq", "MICRO-WORKOUTS")
      .order("name");

    if (fixOnly && fixOnly.length > 0) {
      query = query.in("id", fixOnly);
    }

    const { data: workouts, error: fetchError } = await query;
    if (fetchError) throw new Error(`Failed to fetch workouts: ${fetchError.message}`);

    logStep("Fetched workouts", { count: workouts?.length || 0 });

    const auditResults: DurationAuditItem[] = [];
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let lowConfidenceSkipped = 0;
    const byCategory: Record<string, { total: number; updated: number }> = {};
    const confidenceOrder = { high: 3, medium: 2, low: 1 };
    const minLevel = confidenceOrder[minConfidence as keyof typeof confidenceOrder] || 2;

    for (const workout of workouts || []) {
      const cat = workout.category || "Unknown";
      if (!byCategory[cat]) byCategory[cat] = { total: 0, updated: 0 };
      byCategory[cat].total++;

      if (!workout.main_workout) { skippedCount++; continue; }

      const { sections, total, confidence } = parseSectionDurations(workout.main_workout, workout.category);

      if (sections.length < 3) { skippedCount++; continue; }
      if (confidenceOrder[confidence] < minLevel) { lowConfidenceSkipped++; continue; }

      const roundedTotal = Math.round(total / 5) * 5;
      const newDuration = `${roundedTotal} min`;
      const changed = workout.duration !== newDuration;

      auditResults.push({
        id: workout.id, name: workout.name, category: workout.category,
        oldDuration: workout.duration, newDuration,
        parsedSections: sections, totalMinutes: total, changed,
      });

      if (changed) {
        byCategory[cat].updated++;
        if (!dryRun) {
          const { error: updateError } = await supabase
            .from("admin_workouts")
            .update({ duration: newDuration })
            .eq("id", workout.id);

          if (updateError) {
            errorCount++;
            logStep("ERROR", { id: workout.id, error: updateError.message });
          } else {
            updatedCount++;
            logStep("Updated", {
              id: workout.id, name: workout.name,
              old: workout.duration, new: newDuration, confidence,
              sections: sections.map(s => `${s.section}:${s.minutes}'(${s.source})`).join(", ")
            });
          }
        } else {
          updatedCount++;
        }
      }
    }

    const report = {
      dryRun, minConfidence,
      totalScanned: workouts?.length || 0,
      totalChanged: updatedCount,
      skipped: skippedCount,
      lowConfidenceSkipped,
      errors: errorCount,
      unchanged: auditResults.filter(r => !r.changed).length,
      byCategory,
      changes: auditResults.filter(r => r.changed).map(r => ({
        id: r.id, name: r.name, category: r.category,
        oldDuration: r.oldDuration, newDuration: r.newDuration,
        sections: r.parsedSections, totalMinutes: r.totalMinutes,
      })),
      noChange: auditResults.filter(r => !r.changed).map(r => ({
        id: r.id, name: r.name, duration: r.newDuration,
      })),
      timestamp: new Date().toISOString(),
    };

    logStep("Audit complete", {
      dryRun, totalScanned: report.totalScanned,
      totalChanged: report.totalChanged, skipped: report.skipped,
      lowConfidenceSkipped, errors: report.errors,
    });

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
