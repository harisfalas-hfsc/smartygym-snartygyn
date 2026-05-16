import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Flame, Play, RefreshCw, Calendar, Dumbbell, Star, TrendingUp, Clock, ExternalLink, ImageIcon, BookOpen, Edit, Settings, HeartPulse, CheckCircle, AlertTriangle, XCircle, Archive, Rocket, Library, Shield } from "lucide-react";
import { format, addDays } from "date-fns";
import { WODSchedulePreview } from "./WODSchedulePreview";
import { PeriodizationSystemDialog } from "./PeriodizationSystemDialog";
import { WorkoutEditDialog } from "./WorkoutEditDialog";
import { GenerateWODDialog } from "./GenerateWODDialog";
import { WODAutoGenConfigDialog } from "./WODAutoGenConfigDialog";
import { getWODInfoForDate, getDayIn84Cycle, getCategoryForDay } from "@/lib/wodCycle";
import { getCyprusTodayStr, utcToCyprus } from "@/lib/cyprusDate";

export const WODManager = () => {
  // 🏥 DIAGNOSTIC: v3 - Health Check button should be visible
  console.log("🏥 WODManager v3 loaded - Health Check button should be visible");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncingImages, setIsSyncingImages] = useState(false);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [isCheckingTomorrow, setIsCheckingTomorrow] = useState(false);
  const [isRunningWatchdog, setIsRunningWatchdog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [periodizationDialogOpen, setPeriodizationDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [cronDialogOpen, setCronDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch WOD state
  const { data: wodState, isLoading: stateLoading } = useQuery({
    queryKey: ["wod-state"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("*")
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching WOD state:", error);
        return null;
      }
      return data;
    },
  });

  // Fetch total WOD count from admin_workouts - count ALL WODs ever generated (by id pattern)
  const { data: totalWodCount } = useQuery({
    queryKey: ["total-wod-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("admin_workouts")
        .select("*", { count: "exact", head: true })
        .like("id", "WOD-%");
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch current WODs (both bodyweight and equipment versions) using Cyprus date
  const cyprusTodayForWods = getCyprusTodayStr();
  const { data: currentWODs, isLoading: wodLoading } = useQuery({
    queryKey: ["current-wod", cyprusTodayForWods],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", cyprusTodayForWods);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch WOD history
  const { data: wodHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["wod-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .like("id", "WOD-%")
        .order("created_at", { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch WOD auto-generation config
  const { data: wodAutoGenConfig } = useQuery({
    queryKey: ["wod-auto-gen-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wod_auto_generation_config")
        .select("*")
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching WOD auto-gen config:", error);
        return null;
      }
      return data;
    },
  });

  // Fetch cron job metadata for schedule consistency check
  const { data: cronJobMetadata } = useQuery({
    queryKey: ["cron-job-generate-wod"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cron_job_metadata")
        .select("schedule, is_active")
        .eq("job_name", "generate-workout-of-day")
        .single();
      
      if (error) {
        console.error("Error fetching cron job metadata:", error);
        return null;
      }
      return data;
    },
  });

  // Check if schedule is out of sync
  const isScheduleOutOfSync = (() => {
    if (!wodAutoGenConfig || !cronJobMetadata?.schedule) return false;
    const configHour = wodAutoGenConfig.generation_hour_utc ?? 6;
    const configMinute = (wodAutoGenConfig as any).generation_minute_utc ?? 30;
    const expectedCron = `${configMinute} ${configHour} * * *`;
    return cronJobMetadata.schedule !== expectedCron;
  })();

  // Archive current WODs
  const handleArchiveCurrentWODs = async () => {
    setIsArchiving(true);
    try {
      const { data, error } = await supabase.functions.invoke("archive-old-wods", {});

      if (error) throw error;

      const archivedCount = data?.archived || 0;
      if (archivedCount > 0) {
        toast.success(`Archived ${archivedCount} WOD(s)`, {
          description: "WODs moved to their categories. 'Preparing' message now showing.",
        });
      } else {
        toast.info("No WODs to archive", {
          description: "No active WODs found for archival",
        });
      }

      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
      queryClient.invalidateQueries({ queryKey: ["current-wod"] });
      queryClient.invalidateQueries({ queryKey: ["wod-history"] });
      queryClient.invalidateQueries({ queryKey: ["workoutOfDay"] });
      queryClient.invalidateQueries({ queryKey: ["wod-schedule"] });
    } catch (error: any) {
      console.error("Archive error:", error);
      toast.error("Failed to archive WODs", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleGenerateWOD = async (targetDate?: string, archiveFirst?: boolean) => {
    setIsGenerating(true);
    try {
      // If archiveFirst is true, archive existing WODs first
      if (archiveFirst) {
        const { error: archiveError } = await supabase.functions.invoke("archive-old-wods", {});
        if (archiveError) {
          console.warn("Archive before generate failed:", archiveError);
          // Continue with generation even if archive fails
        }
      }

      // Resolve effective Cyprus date for verification + slot decision
      const effectiveDate = targetDate || getCyprusTodayStr();
      const dayInCycle = getDayIn84Cycle(effectiveDate);
      const category = getCategoryForDay(dayInCycle);
      const isRecovery = category === "RECOVERY";
      const slots: Array<"BODYWEIGHT" | "EQUIPMENT" | "VARIOUS"> = isRecovery
        ? ["VARIOUS"]
        : ["BODYWEIGHT", "EQUIPMENT"];

      toast.message(`Generating ${slots.join(" + ")} for ${effectiveDate}…`, {
        description: "Each slot runs separately. Please wait — this can take 1–3 minutes per slot.",
      });

      const slotResults: Array<{ slot: string; ok: boolean; error?: string }> = [];
      for (const slot of slots) {
        const { data: orchData, error: orchError } = await supabase.functions.invoke(
          "wod-generation-orchestrator",
          {
            body: {
              triggerSource: "admin",
              slot,
              targetDate: effectiveDate,
            },
          },
        );
        if (orchError) {
          slotResults.push({ slot, ok: false, error: orchError.message || "invoke failed" });
          continue;
        }
        const ok = !!orchData?.success;
        slotResults.push({
          slot,
          ok,
          error: ok ? undefined : (orchData?.error || JSON.stringify(orchData?.missing || orchData)),
        });
      }

      // Verify in DB what is actually live for the effective date
      const { data: liveWods } = await supabase
        .from("admin_workouts")
        .select("id, name, equipment")
        .eq("generated_for_date", effectiveDate)
        .eq("is_workout_of_day", true)
        .eq("is_visible", true);

      const liveSlots = new Set((liveWods || []).map((w: any) => w.equipment));
      const missing = slots.filter((s) => !liveSlots.has(s));

      if (missing.length === 0) {
        toast.success(`Workout of the Day published for ${effectiveDate}`, {
          description: (liveWods || [])
            .map((w: any) => `${w.equipment}: ${w.name}`)
            .join(" • "),
        });
      } else {
        const failedDetail = slotResults
          .filter((r) => !r.ok)
          .map((r) => `${r.slot}: ${r.error || "failed"}`)
          .join(" | ");
        toast.error(`Missing slot(s): ${missing.join(", ")}`, {
          description: failedDetail || "Generator did not produce all required slots. Try again.",
        });
      }

      // Refresh all queries
      queryClient.invalidateQueries({ queryKey: ["wod-state"] });
      queryClient.invalidateQueries({ queryKey: ["current-wod"] });
      queryClient.invalidateQueries({ queryKey: ["wod-history"] });
      queryClient.invalidateQueries({ queryKey: ["workoutOfDay"] });
      queryClient.invalidateQueries({ queryKey: ["wod-schedule"] });
    } catch (error: any) {
      console.error("WOD generation error:", error);
      toast.error("Failed to generate WOD", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncStripeImages = async () => {
    setIsSyncingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke("sync-stripe-images", {
        body: {},
      });

      if (error) throw error;

      const results = data.results;
      const totalUpdated = results.workouts.updated + results.programs.updated;
      const totalSkipped = results.workouts.skipped + results.programs.skipped;
      const totalFailed = results.workouts.failed + results.programs.failed;

      if (totalUpdated > 0) {
        toast.success(`Synced ${totalUpdated} Stripe product images`, {
          description: `${totalSkipped} already up-to-date, ${totalFailed} failed`,
        });
      } else if (totalSkipped > 0) {
        toast.info("All Stripe images already up-to-date", {
          description: `${totalSkipped} products checked`,
        });
      } else {
        toast.warning("No products to sync", {
          description: "No workouts or programs with Stripe products found",
        });
      }

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["wod-history"] });
      queryClient.invalidateQueries({ queryKey: ["current-wod"] });
    } catch (error: any) {
      console.error("Stripe image sync error:", error);
      toast.error("Failed to sync Stripe images", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsSyncingImages(false);
    }
  };

  // Helper: Get Cyprus date (timezone-aware) - uses shared utility
  const getCyprusDate = () => getCyprusTodayStr();

  // Health Check: Verify WOD system integrity
  const handleHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    try {
      const today = getCyprusDate(); // Use Cyprus date
      const expectedInfo = getWODInfoForDate(today);
      const dayIn84 = getDayIn84Cycle(today);
      const issues: { issue: string; reason: string; solution: string }[] = [];
      const passed: string[] = [];

      // Check 1: Today's WODs exist
      const { data: todayWods, error: wodError } = await supabase
        .from("admin_workouts")
        .select("id, name, image_url, stripe_product_id, stripe_price_id, equipment, generated_for_date, is_workout_of_day, category, difficulty, difficulty_stars")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", today);

      if (wodError) {
        issues.push({
          issue: `Database error: ${wodError.message}`,
          reason: "Could not query the database for today's WODs.",
          solution: "Check Supabase connection and try again."
        });
      } else if (!todayWods || todayWods.length === 0) {
        // Get dynamic generation time from config
        const genHour = wodAutoGenConfig?.generation_hour_utc ?? 6;
        const genMinute = (wodAutoGenConfig as any)?.generation_minute_utc ?? 30;
        const cyprusHour = utcToCyprus(genHour);
        const isRecovery = expectedInfo.category === "RECOVERY";
        const expectedCount = isRecovery ? 1 : 2;
        issues.push({
          issue: `No WODs found for today (${today} Cyprus)`,
          reason: `The automatic generation at ${genHour.toString().padStart(2, '0')}:${genMinute.toString().padStart(2, '0')} UTC (${cyprusHour.toString().padStart(2, '0')}:${genMinute.toString().padStart(2, '0')} Cyprus) may have failed, or workouts were created but not correctly tagged with is_workout_of_day=true and generated_for_date='${today}'.`,
          solution: "Click 'Generate New WOD' → select 'Generate for Today' to create today's workout manually."
        });
      } else {
        // Check expected count based on day type
        const isRecovery = expectedInfo.category === "RECOVERY";
        const expectedCount = isRecovery ? 1 : 2;
        
        if (todayWods.length < expectedCount) {
          issues.push({
            issue: `Only ${todayWods.length} WOD found - expected ${expectedCount} (${isRecovery ? 'VARIOUS recovery' : 'bodyweight + equipment'})`,
            reason: isRecovery 
              ? "Recovery WOD may not have been generated correctly."
              : "The generation might have partially failed, creating only one variant instead of both.",
            solution: "Check edge function logs or regenerate today's WOD."
          });
        } else if (todayWods.length > expectedCount) {
          issues.push({
            issue: `${todayWods.length} WODs found - expected ${expectedCount}`,
            reason: "Old WODs may not have been archived properly.",
            solution: "Click 'Archive Current WODs' to clean up."
          });
        } else {
          passed.push(`✅ Today's WODs exist: ${todayWods.length} workout${todayWods.length > 1 ? 's' : ''} for ${today}${isRecovery ? ' (Recovery day)' : ''}`);
        }
      }

      // Check 2: All WODs have images
      if (todayWods && todayWods.length > 0) {
        const wodsWithoutImages = todayWods.filter(w => !w.image_url);
        if (wodsWithoutImages.length > 0) {
          issues.push({
            issue: `${wodsWithoutImages.length} WOD(s) missing images: ${wodsWithoutImages.map(w => w.name).join(", ")}`,
            reason: "Image generation may have failed or timed out during WOD creation.",
            solution: "Edit the WOD and manually add an image, or click 'Sync Stripe Images' to pull images from Stripe."
          });
        } else {
          passed.push("✅ All WODs have images in database");
        }
      }

      // Check 3: All WODs have Stripe products
      if (todayWods && todayWods.length > 0) {
        const wodsWithoutStripe = todayWods.filter(w => !w.stripe_product_id || !w.stripe_price_id);
        if (wodsWithoutStripe.length > 0) {
          issues.push({
            issue: `${wodsWithoutStripe.length} WOD(s) missing Stripe products: ${wodsWithoutStripe.map(w => w.name).join(", ")}`,
            reason: "Stripe product creation failed during WOD generation (API error or timeout).",
            solution: "Edit the WOD or regenerate it to create Stripe products."
          });
        } else {
          passed.push("✅ All WODs have Stripe products");
        }
      }

      // Check 4: WOD State integrity
      const { data: stateData, error: stateError } = await supabase
        .from("workout_of_day_state")
        .select("*")
        .limit(1)
        .single();

      if (stateError) {
        issues.push({
          issue: `State error: ${stateError.message}`,
          reason: "The workout_of_day_state table might be empty or inaccessible.",
          solution: "Check database tables in the backend settings."
        });
      } else if (!stateData) {
        issues.push({
          issue: "WOD state not found",
          reason: "No tracking record exists for WOD generation.",
          solution: "Generate a WOD to initialize the state tracking."
        });
      } else {
        passed.push(`✅ State valid: Day ${dayIn84}/84 in cycle, expected ${expectedInfo.category}`);
        
        // Verify category matches
        if (todayWods && todayWods.length > 0) {
          const wodCategory = todayWods[0].category;
          if (wodCategory && wodCategory.toUpperCase() !== expectedInfo.category.toUpperCase()) {
            issues.push({
              issue: `Category mismatch: WOD is ${wodCategory}, expected ${expectedInfo.category}`,
              reason: "The WOD was generated with a different category than the periodization schedule expects.",
              solution: "This may be intentional (manual override). If not, regenerate the WOD."
            });
          } else if (wodCategory) {
            passed.push(`✅ Category matches: ${expectedInfo.category}`);
          }
          
          // Check 4b: Verify difficulty matches expected range
          const expectedRange = expectedInfo.difficulty.range;
          const expectedLevel = expectedInfo.difficulty.level;
          
          if (expectedRange && expectedLevel) {
            // Check all WODs for difficulty validation
            const difficultyMismatches = todayWods.filter(wod => {
              if (!wod.difficulty_stars) return false;
              return wod.difficulty_stars < expectedRange[0] || wod.difficulty_stars > expectedRange[1];
            });
            
            if (difficultyMismatches.length > 0) {
              const mismatchDetails = difficultyMismatches.map(w => 
                `${w.name}: ${w.difficulty_stars} stars (${w.difficulty})`
              ).join(", ");
              issues.push({
                issue: `Difficulty mismatch: Expected ${expectedLevel} (${expectedRange[0]}-${expectedRange[1]} stars), got: ${mismatchDetails}`,
                reason: "The WOD was generated with a difficulty level outside the expected range for today's periodization schedule.",
                solution: "Click 'Generate New WOD' → 'Regenerate Today (Archive first)' to create a correctly-difficulty WOD."
              });
            } else {
              const actualStars = todayWods[0].difficulty_stars;
              passed.push(`✅ Difficulty matches: ${expectedLevel} (${actualStars} stars, expected ${expectedRange[0]}-${expectedRange[1]})`);
            }
          } else if (!expectedRange && todayWods[0].difficulty_stars) {
            // Recovery day should have no difficulty
            issues.push({
              issue: `Unexpected difficulty on Recovery day: ${todayWods[0].difficulty_stars} stars`,
              reason: "Recovery days should not have a difficulty rating.",
              solution: "This is unusual - consider regenerating the WOD."
            });
          } else if (!expectedRange) {
            passed.push(`✅ Recovery day: No difficulty expected`);
          }
        }
      }

      // Check 5: No duplicate active WODs from previous days
      const { data: allActiveWods } = await supabase
        .from("admin_workouts")
        .select("id, name, generated_for_date")
        .eq("is_workout_of_day", true);

      if (allActiveWods && allActiveWods.length > 2) {
        const oldWods = allActiveWods.filter(w => w.generated_for_date !== today);
        if (oldWods.length > 0) {
          issues.push({
            issue: `${oldWods.length} old WOD(s) still marked as active: ${oldWods.map(w => `${w.name} (${w.generated_for_date})`).join(", ")}`,
            reason: "The archiving job at 00:00 UTC may have failed to mark old WODs as inactive.",
            solution: "Click 'Archive Current WODs' to manually archive old workouts."
          });
        }
      } else {
        passed.push("✅ No duplicate active WODs from previous days");
      }

      // Display results
      if (issues.length === 0) {
        toast.success("WOD Health Check Passed!", {
          description: `All ${passed.length} checks passed. System is healthy.`,
          duration: 8000,
        });
      } else {
        // Format issues with reasons and solutions
        const issueMessages = issues.map((i, idx) => 
          `${idx + 1}. ${i.issue}\n   WHY: ${i.reason}\n   FIX: ${i.solution}`
        ).join("\n\n");
        
        toast.error(`WOD Health Check: ${issues.length} issue(s) found`, {
          description: issues[0].issue + (issues.length > 1 ? ` (+${issues.length - 1} more)` : ""),
          duration: 10000,
        });
        
        // Show detailed modal or console for full info
        console.log("=== WOD HEALTH CHECK RESULTS ===");
        console.log("ISSUES:");
        issues.forEach((i, idx) => {
          console.log(`\n${idx + 1}. ${i.issue}`);
          console.log(`   WHY: ${i.reason}`);
          console.log(`   FIX: ${i.solution}`);
        });
        console.log("\nPASSED:", passed);
        
        // Also show in alert for visibility
        alert(`WOD Health Check Issues:\n\n${issueMessages}\n\nFor full system check, go to Settings → System Health Audit`);
      }

    } catch (error: any) {
      console.error("Health check error:", error);
      toast.error("Health check failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  // ===========================================================================
  // FUTURE READY? — Comprehensive audit of the entire WOD generation pipeline
  // ---------------------------------------------------------------------------
  // Covers: cron infrastructure (Plan C+D split), last-7-day generation history,
  // today's WOD integrity, next-7-day periodization, exercise library health,
  // Stripe & image pipelines, auto-gen config consistency.
  // Persists every run to wod_readiness_audits and flags RECURRING issues by
  // matching stable check-keys against the previous 7 audits.
  // ===========================================================================
  // WOD WATCHDOG — manually triggers the verify-only safety net that confirms
  // today's WODs exist + re-kicks Stripe linking and image generation if any
  // assets are missing. Same function the daily watchdog cron calls.
  const handleRunWatchdog = async () => {
    setIsRunningWatchdog(true);
    try {
      const { data, error } = await supabase.functions.invoke("watchdog-wod-check");
      if (error) throw error;
      const result: any = data || {};
      const found = (result?.found || []) as string[];
      const missing = (result?.missing || []) as string[];
      if (result?.success && missing.length === 0) {
        toast.success("WOD Watchdog: all healthy ✅", {
          description: `Today's slots present: ${found.join(", ") || "(verified)"}. Asset re-kick scan complete.`,
          duration: 6000,
        });
      } else if (missing.length > 0) {
        toast.warning("WOD Watchdog: missing slots", {
          description: `Missing: ${missing.join(", ")}. Admin alert dispatched.`,
          duration: 8000,
        });
      } else {
        toast.info("WOD Watchdog ran", {
          description: JSON.stringify(result).slice(0, 200),
        });
      }
    } catch (err: any) {
      console.error("WOD Watchdog error:", err);
      toast.error("WOD Watchdog failed", { description: err?.message || String(err) });
    } finally {
      setIsRunningWatchdog(false);
    }
  };

  const handleFutureReadinessCheck = async () => {
    setIsCheckingTomorrow(true);
    type CheckResult = {
      key: string;
      section: string;
      status: "pass" | "warn" | "fail";
      title: string;
      detail?: string;
      fix?: string;
    };
    const results: CheckResult[] = [];
    const add = (r: CheckResult) => results.push(r);

    try {
      const todayStr = getCyprusTodayStr();
      const todayInfo = getWODInfoForDate(todayStr);

      // === SECTION A: Cron infrastructure (Plan C+D split jobs) ===
      const expectedCrons = [
        { name: "generate-wod-bodyweight-daily", label: "Bodyweight WOD generator", critical: true, key: "cron_bodyweight_inactive" },
        { name: "generate-wod-equipment-daily", label: "Equipment WOD generator", critical: true, key: "cron_equipment_inactive" },
        { name: "archive-old-wods", label: "Archive old WODs", critical: true, key: "cron_archive_inactive" },
        { name: "verify-wod-rollover", label: "Midnight rollover verifier (21:05)", critical: true, key: "cron_rollover_inactive" },
        { name: "backup-wod-generation", label: "Backup WOD generator (02:00)", critical: false, key: "cron_backup_inactive" },
        { name: "watchdog-wod-check", label: "Watchdog WOD check (02:15)", critical: false, key: "cron_watchdog_inactive" },
        { name: "send-morning-notifications-job", label: "Morning notifications", critical: false, key: "cron_morning_notif_inactive" },
        { name: "daily-system-health-audit-after-generation", label: "Daily system health audit", critical: false, key: "cron_health_audit_inactive" },
        { name: "sync-stripe-images-weekly", label: "Stripe images weekly sync", critical: false, key: "cron_stripe_sync_inactive" },
      ];
      // Cross-check BOTH the metadata table and the actual scheduler so the
      // audit can't be fooled by metadata that drifts from real cron.job rows.
      const { data: cronRows } = await supabase
        .from("cron_job_metadata")
        .select("job_name, schedule, is_active");
      const { data: realCronRows } = await supabase.rpc("get_cron_jobs");
      const realCronMap = new Map((realCronRows || []).map((c: any) => [c.jobname, c]));
      const cronMap = new Map(
        (cronRows || []).map((c: any) => {
          const real = realCronMap.get(c.job_name);
          return [c.job_name, {
            ...c,
            schedule: real?.schedule || c.schedule,
            is_active: !!real?.active && !!c.is_active,
            registered_in_scheduler: !!real,
          }];
        })
      );
      // Also surface jobs that exist in the real scheduler but are missing
      // from metadata (silent additions).
      for (const [name, real] of realCronMap.entries()) {
        if (!cronMap.has(name) && expectedCrons.some(e => e.name === name)) {
          cronMap.set(name, { job_name: name, schedule: (real as any).schedule, is_active: !!(real as any).active, registered_in_scheduler: true });
        }
      }
      for (const c of expectedCrons) {
        const row = cronMap.get(c.name);
        if (!row) {
          add({ key: c.key, section: "Cron", status: c.critical ? "fail" : "warn",
            title: `${c.label} not registered`,
            detail: `Job "${c.name}" missing from BOTH cron_job_metadata and the actual scheduler.`,
            fix: "Re-run the cron registration migration." });
        } else if (!(row as any).registered_in_scheduler) {
          add({ key: c.key, section: "Cron", status: c.critical ? "fail" : "warn",
            title: `${c.label} missing from real scheduler`,
            detail: `Listed in admin metadata but no matching row in cron.job (schedule: ${row.schedule}).`,
            fix: "Re-run the cron registration migration." });
        } else if (!row.is_active) {
          add({ key: c.key, section: "Cron", status: c.critical ? "fail" : "warn",
            title: `${c.label} is INACTIVE`,
            detail: `Job "${c.name}" exists but is_active=false (schedule: ${row.schedule}).`,
            fix: "Re-enable in admin Cron Manager." });
        } else {
          add({ key: c.key + "_ok", section: "Cron", status: "pass",
            title: `${c.label} active`,
            detail: `${c.name} — ${row.schedule}` });
        }
      }
      // Sequencing check: bodyweight must run before equipment (avoids 150s timeout overlap)
      const bw = cronMap.get("generate-wod-bodyweight-daily");
      const eq = cronMap.get("generate-wod-equipment-daily");
      if (bw?.schedule && eq?.schedule) {
        const parseMin = (s: string) => {
          const [m, h] = s.split(" ");
          return parseInt(h) * 60 + parseInt(m);
        };
        const gap = parseMin(eq.schedule) - parseMin(bw.schedule);
        if (gap < 10) {
          add({ key: "cron_sequence_too_tight", section: "Cron", status: "warn",
            title: "Bodyweight & equipment crons too close together",
            detail: `Gap is ${gap} minutes; recommend ≥15 min to prevent overlap with the 150s edge timeout.`,
            fix: "Stagger schedules (e.g. 06:30 and 06:50)." });
        } else {
          add({ key: "cron_sequence_ok", section: "Cron", status: "pass",
            title: `Cron sequencing healthy (${gap} min gap)` });
        }
      }

      // === SECTION B: Generation history (last 7 days) ===
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: runs } = await supabase
        .from("wod_generation_runs")
        .select("cyprus_date, status, found_count, expected_count, error_message, created_at, trigger_source")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: false });
      if (!runs || runs.length === 0) {
        add({ key: "history_no_runs", section: "History", status: "warn",
          title: "No generation runs logged in last 7 days",
          fix: "If WODs are being generated, the run-tracker may be skipping inserts." });
      } else {
        // SLOT-AWARE rollup: each cron handles a single slot, so each
        // individual run row naturally reports 1/2 found. Group by Cyprus
        // date and consider the day complete if BOTH slots succeeded (or 1
        // for recovery days).
        const dayBuckets: Record<string, { runs: any[]; foundSlots: Set<string> }> = {};
        for (const r of runs as any[]) {
          const key = r.cyprus_date;
          if (!dayBuckets[key]) dayBuckets[key] = { runs: [], foundSlots: new Set() };
          dayBuckets[key].runs.push(r);
          if (r.status === "success" && r.trigger_source) {
            if (r.trigger_source.includes("bodyweight")) dayBuckets[key].foundSlots.add("BODYWEIGHT");
            else if (r.trigger_source.includes("equipment")) dayBuckets[key].foundSlots.add("EQUIPMENT");
            else if ((r.found_count ?? 0) >= (r.expected_count ?? 2)) {
              dayBuckets[key].foundSlots.add("BODYWEIGHT");
              dayBuckets[key].foundSlots.add("EQUIPMENT");
            }
          }
        }
        const failed: any[] = [];
        const partial: any[] = [];
        for (const [date, bucket] of Object.entries(dayBuckets)) {
          const expected = bucket.runs[0]?.expected_count ?? 2;
          const allFinal = bucket.runs.every((r: any) => r.status !== "running");
          const anyFailed = bucket.runs.some((r: any) => r.status === "failed");
          const slotCount = bucket.foundSlots.size;
          if (allFinal && slotCount < expected) {
            if (anyFailed && slotCount === 0) failed.push({ cyprus_date: date, error_message: bucket.runs.find((r: any) => r.status === "failed")?.error_message });
            else partial.push({ cyprus_date: date, found_count: slotCount, expected_count: expected });
          }
        }
        const successDays = Object.keys(dayBuckets).length - failed.length - partial.length;
        if (failed.length > 0) {
          add({ key: "history_failed_runs", section: "History", status: "fail",
            title: `${failed.length} day(s) with no successful WOD generation in last 7 days`,
            detail: failed.slice(0, 3).map((r: any) => `${r.cyprus_date}: ${r.error_message || "unknown"}`).join(" | "),
            fix: "Inspect failed runs and rerun manually if needed." });
        }
        if (partial.length > 0) {
          add({ key: "history_partial_runs", section: "History", status: "warn",
            title: `${partial.length} day(s) with only one slot generated`,
            detail: partial.slice(0, 3).map((r: any) => `${r.cyprus_date}: ${r.found_count}/${r.expected_count}`).join(" | "),
            fix: "Backfill missing variants via Generate New WOD." });
        }
        if (failed.length === 0 && partial.length === 0) {
          add({ key: "history_all_ok", section: "History", status: "pass",
            title: `All ${successDays} day(s) had complete WOD generation in last 7 days` });
        }
      }

      // === SECTION C: Today's WOD integrity ===
      const { data: todayWods } = await supabase
        .from("admin_workouts")
        .select("id, name, image_url, stripe_product_id, stripe_price_id, category, difficulty_stars")
        .eq("generated_for_date", todayStr)
        .eq("is_workout_of_day", true);
      const todayExpected = todayInfo.category === "RECOVERY" ? 1 : 2;
      const todayCount = todayWods?.length || 0;
      if (todayCount < todayExpected) {
        add({ key: "today_wod_missing", section: "Today", status: "fail",
          title: `Today's WODs missing or incomplete (${todayCount}/${todayExpected})`,
          fix: "Click 'Generate New WOD' for today." });
      } else {
        add({ key: "today_wod_count_ok", section: "Today", status: "pass",
          title: `Today's WOD count correct (${todayCount}/${todayExpected})` });
      }
      if (todayWods && todayWods.length > 0) {
        const noImage = todayWods.filter((w: any) => !w.image_url);
        if (noImage.length > 0) {
          add({ key: "today_image_missing", section: "Today", status: "warn",
            title: `${noImage.length} of today's WODs missing image`,
            detail: noImage.map((w: any) => w.name).join(", "),
            fix: "Auto-image trigger should retry; if not, run Sync Stripe Images." });
        } else {
          add({ key: "today_images_ok", section: "Today", status: "pass", title: "All today's WODs have images" });
        }
        const noStripe = todayWods.filter((w: any) => !w.stripe_product_id || !w.stripe_price_id);
        if (noStripe.length > 0) {
          add({ key: "today_stripe_missing", section: "Today", status: "warn",
            title: `${noStripe.length} of today's WODs missing Stripe link`,
            detail: noStripe.map((w: any) => w.name).join(", "),
            fix: "Run Sync Stripe Images to backfill product/price IDs." });
        } else {
          add({ key: "today_stripe_ok", section: "Today", status: "pass", title: "All today's WODs have Stripe linked" });
        }
      }

      // === SECTION D: Next 7 days periodization ===
      const upcoming: string[] = [];
      for (let i = 1; i <= 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const ds = format(d, "yyyy-MM-dd");
        const info = getWODInfoForDate(ds);
        upcoming.push(`${ds} (Day ${getDayIn84Cycle(ds)}): ${info.category}`);
      }
      add({ key: "future_periodization", section: "Future", status: "pass",
        title: "Next 7 days periodization plan",
        detail: upcoming.join(" • ") });

      // === SECTION E: Exercise library health ===
      const { count: bodyweightCount } = await supabase
        .from("exercises").select("*", { count: "exact", head: true }).ilike("equipment", "body weight");
      const { count: totalExercises } = await supabase
        .from("exercises").select("*", { count: "exact", head: true });
      if ((bodyweightCount ?? 0) < 30) {
        add({ key: "library_bodyweight_low", section: "Library", status: "warn",
          title: `Only ${bodyweightCount ?? 0} bodyweight exercises in library`,
          fix: "Add more bodyweight exercises to support Micro-Workouts and Plan C." });
      } else {
        add({ key: "library_bodyweight_ok", section: "Library", status: "pass",
          title: `Bodyweight library healthy (${bodyweightCount} exercises)` });
      }
      add({ key: "library_total", section: "Library", status: "pass",
        title: `Total exercise library: ${totalExercises ?? 0} exercises` });

      // === SECTION F: Stripe & image pipeline (last 7 days of WODs) ===
      const { data: weekWods } = await supabase
        .from("admin_workouts")
        .select("name, generated_for_date, image_url, stripe_product_id")
        .like("id", "WOD-%")
        .gte("generated_for_date", format(sevenDaysAgo, "yyyy-MM-dd"));
      if (weekWods && weekWods.length > 0) {
        const missingImg = weekWods.filter((w: any) => !w.image_url);
        const missingStripe = weekWods.filter((w: any) => !w.stripe_product_id);
        if (missingImg.length > 0) {
          add({ key: "week_images_missing", section: "Pipelines", status: "warn",
            title: `${missingImg.length} WODs in last 7 days missing image`,
            fix: "Image-repair trigger should fix; manually run Sync if persists." });
        } else {
          add({ key: "week_images_ok", section: "Pipelines", status: "pass", title: "All last-7-day WODs have images" });
        }
        if (missingStripe.length > 0) {
          add({ key: "week_stripe_missing", section: "Pipelines", status: "warn",
            title: `${missingStripe.length} WODs in last 7 days missing Stripe link`,
            fix: "Run Sync Stripe Images." });
        } else {
          add({ key: "week_stripe_ok", section: "Pipelines", status: "pass", title: "All last-7-day WODs have Stripe linked" });
        }
      }

      // === SECTION G: Auto-gen config consistency ===
      const { data: autoCfg } = await supabase
        .from("wod_auto_generation_config").select("*").limit(1).maybeSingle();
      if (autoCfg) {
        add({ key: "config_present", section: "Config", status: "pass",
          title: `Auto-gen config present`,
          detail: `Generation hour ${(autoCfg as any).generation_hour_utc}:${String((autoCfg as any).generation_minute_utc ?? 0).padStart(2, "0")} UTC` });
      } else {
        add({ key: "config_missing", section: "Config", status: "warn",
          title: "wod_auto_generation_config row missing",
          fix: "Insert default row in admin." });
      }

      // === RECURRENCE MEMORY: compare against previous 7 audits ===
      const { data: prevAudits } = await supabase
        .from("wod_readiness_audits")
        .select("audit_date, failed_check_keys, warning_check_keys")
        .order("audit_date", { ascending: false })
        .limit(7);

      const failedKeys = results.filter(r => r.status === "fail").map(r => r.key);
      const warningKeys = results.filter(r => r.status === "warn").map(r => r.key);
      const recurringNotes: string[] = [];
      const resolvedNotes: string[] = [];

      for (const k of [...failedKeys, ...warningKeys]) {
        const occurrences = (prevAudits || []).filter((a: any) =>
          (a.failed_check_keys || []).includes(k) || (a.warning_check_keys || []).includes(k)
        );
        if (occurrences.length >= 1) {
          recurringNotes.push(`🔁 RECURRING: "${k}" also flagged on ${occurrences.length} of last ${prevAudits?.length || 0} audits.`);
          const r = results.find(rr => rr.key === k);
          if (r) r.detail = (r.detail ? r.detail + " " : "") + `[Recurring ${occurrences.length + 1}× incl. today]`;
        }
      }
      // Detect resolved issues
      if (prevAudits && prevAudits.length > 0) {
        const lastAudit: any = prevAudits[0];
        const lastFailed: string[] = [...(lastAudit.failed_check_keys || []), ...(lastAudit.warning_check_keys || [])];
        for (const k of lastFailed) {
          if (!failedKeys.includes(k) && !warningKeys.includes(k) && !k.endsWith("_ok") && !k.startsWith("library_total") && !k.startsWith("future_") && !k.startsWith("config_present")) {
            resolvedNotes.push(`✅ RESOLVED: "${k}" no longer failing.`);
          }
        }
      }

      const passedCount = results.filter(r => r.status === "pass").length;
      const warnCount = warningKeys.length;
      const failCount = failedKeys.length;
      const overall = failCount > 0 ? "critical" : warnCount > 0 ? "warnings" : "healthy";

      // Save to memory table
      await supabase.from("wod_readiness_audits").insert({
        triggered_by: "manual",
        overall_status: overall,
        total_checks: results.length,
        passed_count: passedCount,
        warning_count: warnCount,
        failed_count: failCount,
        results: results as any,
        failed_check_keys: failedKeys,
        warning_check_keys: warningKeys,
        notes: [...recurringNotes, ...resolvedNotes].join("\n") || null,
      });

      // Build the report
      const sections = ["Cron", "History", "Today", "Future", "Library", "Pipelines", "Config"];
      const reportLines: string[] = [];
      for (const s of sections) {
        const sectionResults = results.filter(r => r.section === s);
        if (sectionResults.length === 0) continue;
        reportLines.push(`\n━━━ ${s.toUpperCase()} ━━━`);
        for (const r of sectionResults) {
          const icon = r.status === "pass" ? "✅" : r.status === "warn" ? "⚠️" : "❌";
          reportLines.push(`${icon} ${r.title}`);
          if (r.detail) reportLines.push(`   ${r.detail}`);
          if (r.fix && r.status !== "pass") reportLines.push(`   FIX: ${r.fix}`);
        }
      }
      if (recurringNotes.length || resolvedNotes.length) {
        reportLines.push(`\n━━━ MEMORY ━━━`);
        recurringNotes.forEach(n => reportLines.push(n));
        resolvedNotes.forEach(n => reportLines.push(n));
      }
      const fullReport = reportLines.join("\n");

      console.log("=== FUTURE READY? AUDIT ===" + fullReport);

      const summary = `${passedCount} ✅, ${warnCount} ⚠️, ${failCount} ❌` +
        (recurringNotes.length ? `, ${recurringNotes.length} 🔁 recurring` : "");
      if (overall === "healthy") {
        toast.success(`Future Ready: ALL SYSTEMS GO ✅`, { description: summary, duration: 6000 });
      } else if (overall === "warnings") {
        toast.warning(`Future Ready: warnings detected`, { description: summary, duration: 8000 });
      } else {
        toast.error(`Future Ready: critical issues`, { description: summary, duration: 10000 });
      }
      if (failCount > 0 || warnCount > 0) {
        alert(`FUTURE READY? AUDIT\n${summary}\n${fullReport}`);
      } else {
        alert(`FUTURE READY? AUDIT — ALL HEALTHY\n${summary}\n${fullReport}`);
      }
    } catch (error: any) {
      console.error("Future readiness check error:", error);
      toast.error("Future Ready check failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsCheckingTomorrow(false);
    }
  };

  // Get tomorrow's category using 84-day cycle
  const getTomorrowCategory = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
    return getWODInfoForDate(tomorrowStr).category;
  };
  
  // Get today's day in 84-day cycle
  const getDayInCycle = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return getDayIn84Cycle(today);
  };

  // Get current day's category using 84-day cycle
  const getTodayCategory = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    return getWODInfoForDate(today).category;
  };

  const getDifficultyColor = (stars: number | null) => {
    if (!stars) return "bg-blue-500/20 text-blue-400 border-blue-500/30"; // Recovery = Blue
    if (stars <= 2) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"; // Beginner = Yellow
    if (stars <= 4) return "bg-green-500/20 text-green-400 border-green-500/30"; // Intermediate = Green
    return "bg-red-500/20 text-red-400 border-red-500/30"; // Advanced = Red
  };

  const getDifficultyLabel = (stars: number | null) => {
    if (!stars) return "Unknown";
    if (stars <= 2) return "Beginner";
    if (stars <= 4) return "Intermediate";
    return "Advanced";
  };

  // Calculate percentages for progress bars
  const totalEquipment = (wodState?.equipment_bodyweight_count || 0) + (wodState?.equipment_with_count || 0);
  const bodyweightPercent = totalEquipment > 0 ? ((wodState?.equipment_bodyweight_count || 0) / totalEquipment) * 100 : 50;
  
  const totalDifficulty = (wodState?.difficulty_beginner_count || 0) + (wodState?.difficulty_intermediate_count || 0) + (wodState?.difficulty_advanced_count || 0);
  const beginnerPercent = totalDifficulty > 0 ? ((wodState?.difficulty_beginner_count || 0) / totalDifficulty) * 100 : 33;
  const intermediatePercent = totalDifficulty > 0 ? ((wodState?.difficulty_intermediate_count || 0) / totalDifficulty) * 100 : 33;
  const advancedPercent = totalDifficulty > 0 ? ((wodState?.difficulty_advanced_count || 0) / totalDifficulty) * 100 : 33;

  return (
    <div className="space-y-6">
      {/* Header with Generate Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Workout of the Day Management
          </h3>
          <p className="text-sm text-muted-foreground">
            {(() => {
              const utcHour = wodAutoGenConfig?.generation_hour_utc ?? 6;
              const utcMinute = (wodAutoGenConfig as any)?.generation_minute_utc ?? 30;
              const cyprusHour = utcToCyprus(utcHour);
              return `Generate, edit, and manage daily workouts. WODs auto-generate at ${cyprusHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} Cyprus (${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} UTC).`;
            })()}
          </p>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 border-green-500 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isRunningHealthCheck}
            onClick={handleHealthCheck}
          >
            {isRunningHealthCheck ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <HeartPulse className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            )}
            <span className="hidden sm:inline">{isRunningHealthCheck ? "Checking..." : "WOD Health Check"}</span>
            <span className="sm:hidden">{isRunningHealthCheck ? "..." : "Health"}</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 border-purple-500 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isCheckingTomorrow}
            onClick={handleFutureReadinessCheck}
          >
            {isCheckingTomorrow ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Rocket className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
            )}
            <span className="hidden sm:inline">{isCheckingTomorrow ? "Auditing..." : "Future Ready?"}</span>
            <span className="sm:hidden">{isCheckingTomorrow ? "..." : "Future?"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 border-cyan-500 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isRunningWatchdog}
            onClick={handleRunWatchdog}
            title="Verify today's WODs exist and re-kick Stripe/image pipelines if assets are missing"
          >
            {isRunningWatchdog ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-cyan-500" />
            )}
            <span className="hidden sm:inline">{isRunningWatchdog ? "Running..." : "WOD Watchdog"}</span>
            <span className="sm:hidden">{isRunningWatchdog ? "..." : "Watchdog"}</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => setPeriodizationDialogOpen(true)}
          >
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">View Periodization</span>
            <span className="sm:hidden">Period.</span>
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isSyncingImages}
            onClick={handleSyncStripeImages}
          >
            {isSyncingImages ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">{isSyncingImages ? "Syncing..." : "Sync Stripe Images"}</span>
            <span className="sm:hidden">{isSyncingImages ? "..." : "Sync"}</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 border-orange-500 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isArchiving}
            onClick={handleArchiveCurrentWODs}
          >
            {isArchiving ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Archive className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
            )}
            <span className="hidden sm:inline">{isArchiving ? "Archiving..." : "Archive Current WODs"}</span>
            <span className="sm:hidden">{isArchiving ? "..." : "Archive"}</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            onClick={() => setCronDialogOpen(true)}
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </Button>
          
          <Button 
            size="sm"
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            disabled={isGenerating}
            onClick={() => setGenerateDialogOpen(true)}
          >
            {isGenerating ? (
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
            <span className="hidden sm:inline">{isGenerating ? "Generating..." : "Generate New WOD"}</span>
            <span className="sm:hidden">{isGenerating ? "..." : "Generate"}</span>
          </Button>
          
          <GenerateWODDialog
            open={generateDialogOpen}
            onOpenChange={setGenerateDialogOpen}
            onGenerate={handleGenerateWOD}
            isGenerating={isGenerating}
            todayCategory={getTodayCategory()}
            nextCategory={getTomorrowCategory()}
            dayInCycle={getDayInCycle()}
            hasTodayWOD={currentWODs && currentWODs.length > 0}
          />
          
        </div>
      </div>

      {/* Library Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg">
        <div className="flex items-center gap-3">
          <Library className="h-5 w-5 text-primary" />
          <div>
            <Label className="text-sm font-medium">Library Mode</Label>
            <p className="text-xs text-muted-foreground">
              Pick from existing workouts (no AI credits)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {(wodAutoGenConfig as any)?.wod_mode === 'select' ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Library Mode Active</Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">AI Generation</Badge>
          )}
          <Switch
            checked={(wodAutoGenConfig as any)?.wod_mode === 'select'}
            onCheckedChange={async (checked) => {
              const newMode = checked ? 'select' : 'generate';
              const { error } = await supabase
                .from("wod_auto_generation_config")
                .update({ wod_mode: newMode } as any)
                .eq("id", wodAutoGenConfig?.id);
              
              if (error) {
                toast.error("Failed to update WOD mode");
              } else {
                toast.success(checked ? "Library Mode enabled" : "AI Generation mode restored", {
                  description: checked 
                    ? "System will pick from existing workouts (zero AI credits)" 
                    : "System will generate new workouts daily using AI",
                });
                queryClient.invalidateQueries({ queryKey: ["wod-auto-gen-config"] });
              }
            }}
          />
        </div>
      </div>

      {/* Schedule Consistency Warning */}
      {isScheduleOutOfSync && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-500">Schedule Out of Sync</p>
            <p className="text-xs text-muted-foreground">
              The cron scheduler and config are showing different times. Click "Schedule" to fix.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCronDialogOpen(true)}>
            Fix Now
          </Button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Generated */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total WODs Generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stateLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-2xl font-bold">{totalWodCount || 0}</p>
            )}
          </CardContent>
        </Card>

        {/* Tomorrow's Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tomorrow's Category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stateLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="space-y-1">
                <Badge variant="outline" className="text-sm font-semibold">
                  {getTomorrowCategory()}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {format(addDays(new Date(), 1), "EEE, MMM d")} • Day {getDayInCycle()}/7
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Generated */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stateLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {wodState?.last_generated_at 
                    ? format(new Date(wodState.last_generated_at), "MMM d, yyyy HH:mm")
                    : "Never"}
                </p>
                {getTodayCategory() && (
                  <p className="text-xs text-muted-foreground">
                    Today: {getTodayCategory()}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* WOD Auto-Generation Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              WOD Auto-Generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {wodAutoGenConfig?.is_enabled && !wodAutoGenConfig?.paused_until ? (
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                )}
                <p className="text-sm font-medium">
                  {(() => {
                    const utcHour = wodAutoGenConfig?.generation_hour_utc ?? 6;
                    const utcMinute = (wodAutoGenConfig as any)?.generation_minute_utc ?? 30;
                    return `${utcHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} UTC`;
                  })()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2"
                onClick={() => setCronDialogOpen(true)}
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(() => {
                const utcHour = wodAutoGenConfig?.generation_hour_utc ?? 6;
                const utcMinute = (wodAutoGenConfig as any)?.generation_minute_utc ?? 30;
                const cyprusHour = utcToCyprus(utcHour);
                return `${cyprusHour.toString().padStart(2, '0')}:${utcMinute.toString().padStart(2, '0')} Cyprus`;
              })()}
            </p>
            {wodAutoGenConfig?.paused_until && (
              <p className="text-xs text-orange-500 mt-1">
                Paused until {format(new Date(wodAutoGenConfig.paused_until), "MMM dd")}
              </p>
            )}
            {!wodAutoGenConfig?.is_enabled && !wodAutoGenConfig?.paused_until && (
              <p className="text-xs text-orange-500 mt-1">Disabled</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming WOD Schedule Preview */}
      <WODSchedulePreview />

      {/* Distribution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Equipment Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Equipment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Bodyweight</span>
                <span>{wodState?.equipment_bodyweight_count || 0} ({bodyweightPercent.toFixed(0)}%)</span>
              </div>
              <Progress value={bodyweightPercent} className="h-2" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Equipment</span>
                <span>{wodState?.equipment_with_count || 0} ({(100 - bodyweightPercent).toFixed(0)}%)</span>
              </div>
              <Progress value={100 - bodyweightPercent} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Beginner</span>
                <span>{wodState?.difficulty_beginner_count || 0} ({beginnerPercent.toFixed(0)}%)</span>
              </div>
              <Progress value={beginnerPercent} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">Intermediate</span>
                <span>{wodState?.difficulty_intermediate_count || 0} ({intermediatePercent.toFixed(0)}%)</span>
              </div>
              <Progress value={intermediatePercent} className="h-2 [&>div]:bg-yellow-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-red-400">Advanced</span>
                <span>{wodState?.difficulty_advanced_count || 0} ({advancedPercent.toFixed(0)}%)</span>
              </div>
              <Progress value={advancedPercent} className="h-2 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current WOD */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Flame className="h-5 w-5" />
                Today's Active WOD — {format(new Date(), "EEEE, MMMM d, yyyy")}
              </CardTitle>
              <CardDescription className="mt-1">
                This is what users see at <strong>/workout/wod</strong> right now
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/workout/wod" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Site
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {wodLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="w-48 h-32 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : !currentWODs || currentWODs.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <Flame className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">No Active WOD</p>
                <p className="text-sm text-muted-foreground">
                  Click "Generate New WOD" above to create today's workout
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show both WOD versions */}
              <div className="grid gap-4 md:grid-cols-2">
                {currentWODs.map((wod) => {
                  const isBodyweight = wod.equipment === "Bodyweight";
                  return (
                    <div key={wod.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        {isBodyweight ? (
                          <span className="text-lg">🤸</span>
                        ) : (
                          <span className="text-lg">🏋️</span>
                        )}
                        <span className="font-semibold text-sm">
                          {isBodyweight ? "Bodyweight Version" : "Equipment Version"}
                        </span>
                      </div>
                      
                      {wod.image_url && (
                        <img 
                          src={wod.image_url} 
                          alt={wod.name}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                      
                      <h4 className="font-semibold">{wod.name}</h4>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">{wod.category}</Badge>
                        <Badge variant="outline" className="text-xs">{wod.format}</Badge>
                        <Badge className={`text-xs ${getDifficultyColor(wod.difficulty_stars)}`}>
                          {wod.difficulty_stars}★
                        </Badge>
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                          €{wod.price?.toFixed(2)}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={`/workout/${wod.type}/${wod.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setEditingWorkout(wod);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Regenerate option */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Want to regenerate today's WODs with new content?
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      if (!confirm("This will archive the current WODs and generate new ones. Continue?")) return;
                      
                      // Archive existing WODs (never delete - preserves Stripe products & purchase records)
                      await supabase.functions.invoke("archive-old-wods", {});
                      
                      // Generate new WODs
                      await handleGenerateWOD();
                    }}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Regenerate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Generation History</CardTitle>
          <CardDescription>
            Last 30 generated WODs. Past WODs remain in the workout library and can be edited anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : wodHistory && wodHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wodHistory.map((wod) => (
                    <TableRow key={wod.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(wod.created_at || ""), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {wod.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {wod.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {wod.format}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {wod.equipment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${getDifficultyColor(wod.difficulty_stars)}`}>
                          {getDifficultyLabel(wod.difficulty_stars)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {wod.is_workout_of_day ? (
                          <Badge className="bg-primary/20 text-primary border-primary/30">
                            🔥 Current
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-400 border-green-500/30">
                            ✅ In Library
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingWorkout(wod);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No workouts generated yet. Click "Generate New WOD" to create the first one.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Periodization System Dialog */}
      <PeriodizationSystemDialog 
        open={periodizationDialogOpen} 
        onOpenChange={setPeriodizationDialogOpen}
        wodState={wodState}
      />

      {/* Edit WOD Dialog */}
      <WorkoutEditDialog
        workout={editingWorkout}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingWorkout(null);
        }}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ["current-wod"] });
          queryClient.invalidateQueries({ queryKey: ["wod-history"] });
          queryClient.invalidateQueries({ queryKey: ["workoutOfDay"] });
          setEditDialogOpen(false);
          setEditingWorkout(null);
        }}
      />

      {/* WOD Auto-Generation Configuration Dialog */}
      <WODAutoGenConfigDialog
        open={cronDialogOpen}
        onOpenChange={setCronDialogOpen}
      />
    </div>
  );
};
