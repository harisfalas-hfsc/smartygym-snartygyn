import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { 
  classifyWorkoutFormat, 
  shouldFixFormat,
  FormatClassificationResult 
} from "../_shared/format-classifier.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkoutAuditItem {
  id: string;
  name: string;
  category: string | null;
  currentFormat: string | null;
  inferredFormat: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
  reason: string;
  mainWorkoutExtract: string;
  isWod: boolean;
  isVisible: boolean;
}

interface AuditReport {
  totalScanned: number;
  totalMismatches: number;
  highConfidenceMismatches: number;
  mismatches: WorkoutAuditItem[];
  correctFormats: number;
  byCategory: Record<string, { total: number; mismatches: number }>;
  timestamp: string;
}

function logStep(step: string, details?: Record<string, unknown>) {
  console.log(`[AUDIT-FORMATS] ${step}`, details ? JSON.stringify(details) : '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting comprehensive format audit");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: workouts, error: fetchError } = await supabase
      .from("admin_workouts")
      .select("id, name, category, format, main_workout, is_workout_of_day, is_visible")
      .order("name");

    if (fetchError) {
      throw new Error(`Failed to fetch workouts: ${fetchError.message}`);
    }

    logStep("Fetched workouts", { count: workouts?.length || 0 });

    const mismatches: WorkoutAuditItem[] = [];
    const byCategory: Record<string, { total: number; mismatches: number }> = {};

    for (const workout of workouts || []) {
      const category = workout.category || "Unknown";
      
      if (!byCategory[category]) {
        byCategory[category] = { total: 0, mismatches: 0 };
      }
      byCategory[category].total++;

      if (!workout.main_workout) {
        logStep("Skipping workout with no main_workout content", { id: workout.id, name: workout.name });
        continue;
      }

      const classification: FormatClassificationResult = classifyWorkoutFormat(workout.category, workout.main_workout);

      // Only report as mismatch if we're confident enough to suggest a fix
      const needsFix = shouldFixFormat(workout.category, workout.format, classification);

      if (needsFix && classification.inferredFormat) {
        byCategory[category].mismatches++;
        
        const auditItem: WorkoutAuditItem = {
          id: workout.id,
          name: workout.name,
          category: workout.category,
          currentFormat: workout.format,
          inferredFormat: classification.inferredFormat,
          confidence: classification.confidence,
          reason: classification.reason,
          mainWorkoutExtract: classification.mainWorkoutExtract,
          isWod: workout.is_workout_of_day || false,
          isVisible: workout.is_visible !== false
        };

        mismatches.push(auditItem);

        logStep("Found mismatch", {
          id: workout.id,
          name: workout.name,
          current: workout.format,
          inferred: classification.inferredFormat,
          confidence: classification.confidence
        });
      }
    }

    // Count high-confidence mismatches only
    const highConfidenceMismatches = mismatches.filter(m => m.confidence === 'high').length;

    const report: AuditReport = {
      totalScanned: workouts?.length || 0,
      totalMismatches: mismatches.length,
      highConfidenceMismatches,
      mismatches,
      correctFormats: (workouts?.length || 0) - mismatches.length,
      byCategory,
      timestamp: new Date().toISOString()
    };

    logStep("Audit complete", {
      totalScanned: report.totalScanned,
      totalMismatches: report.totalMismatches,
      highConfidenceMismatches: report.highConfidenceMismatches,
      correctFormats: report.correctFormats
    });

    if (mismatches.length > 0) {
      logStep("Mismatch Summary:");
      for (const mismatch of mismatches) {
        logStep(`  - ${mismatch.name}`, {
          current: mismatch.currentFormat,
          inferred: mismatch.inferredFormat,
          confidence: mismatch.confidence
        });
      }
    }

    return new Response(JSON.stringify(report), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Error during audit", { error: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
