import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Flame, Play, RefreshCw, Calendar, Dumbbell, Star, TrendingUp, Clock, ExternalLink, ImageIcon, BookOpen, Edit, Settings, HeartPulse, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { format, addDays } from "date-fns";
import { WODSchedulePreview } from "./WODSchedulePreview";
import { PeriodizationSystemDialog } from "./PeriodizationSystemDialog";
import { WODCycleCalendar } from "@/components/WODCycleCalendar";
import { WorkoutEditDialog } from "./WorkoutEditDialog";
import { GenerateWODDialog } from "./GenerateWODDialog";
import { CronTimeConfigDialog } from "./CronTimeConfigDialog";

// 7-DAY CATEGORY CYCLE
const CATEGORY_CYCLE_7DAY = [
  "CHALLENGE",
  "STRENGTH", 
  "CARDIO",
  "MOBILITY & STABILITY",
  "STRENGTH",
  "METABOLIC",
  "CALORIE BURNING"
];

export const WODManager = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSyncingImages, setIsSyncingImages] = useState(false);
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
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

  // Fetch total WOD count from admin_workouts
  const { data: totalWodCount } = useQuery({
    queryKey: ["total-wod-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("admin_workouts")
        .select("*", { count: "exact", head: true })
        .eq("is_workout_of_day", true);
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch current WODs (both bodyweight and equipment versions)
  const { data: currentWODs, isLoading: wodLoading } = useQuery({
    queryKey: ["current-wod"],
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("*")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", today);
      
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

  const handleGenerateWOD = async (targetDate?: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-workout-of-day", {
        body: { targetDate },
      });

      if (error) throw error;

      // Check if WOD was skipped (already exists)
      if (data?.skipped) {
        toast.info(data.message || "WOD already exists", {
          description: "No new WOD generated - use Edit to modify the existing one",
        });
      } else {
        const dateLabel = targetDate ? `for ${targetDate}` : "for today";
        toast.success(`Workout of the Day generated ${dateLabel}!`, {
          description: `${data?.workouts?.[0]?.name || 'New WOD'} - ${data?.shared?.category || 'Generated'}`,
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

  // Health Check: Verify WOD system integrity
  const handleHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const issues: string[] = [];
      const passed: string[] = [];

      // Check 1: Today's WODs exist
      const { data: todayWods, error: wodError } = await supabase
        .from("admin_workouts")
        .select("id, name, image_url, stripe_product_id, stripe_price_id, equipment, generated_for_date, is_workout_of_day, category")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", today);

      if (wodError) {
        issues.push(`Database error: ${wodError.message}`);
      } else if (!todayWods || todayWods.length === 0) {
        issues.push("No WODs found for today");
      } else if (todayWods.length < 2) {
        issues.push(`Only ${todayWods.length} WOD(s) found - expected 2 (bodyweight + equipment)`);
      } else {
        passed.push(`✅ Today's WODs exist: ${todayWods.length} workouts`);
      }

      // Check 2: All WODs have images
      if (todayWods && todayWods.length > 0) {
        const wodsWithoutImages = todayWods.filter(w => !w.image_url);
        if (wodsWithoutImages.length > 0) {
          issues.push(`${wodsWithoutImages.length} WOD(s) missing images: ${wodsWithoutImages.map(w => w.name).join(", ")}`);
        } else {
          passed.push("✅ All WODs have images in database");
        }
      }

      // Check 3: All WODs have Stripe products
      if (todayWods && todayWods.length > 0) {
        const wodsWithoutStripe = todayWods.filter(w => !w.stripe_product_id || !w.stripe_price_id);
        if (wodsWithoutStripe.length > 0) {
          issues.push(`${wodsWithoutStripe.length} WOD(s) missing Stripe products: ${wodsWithoutStripe.map(w => w.name).join(", ")}`);
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
        issues.push(`State error: ${stateError.message}`);
      } else if (!stateData) {
        issues.push("WOD state not found");
      } else {
        const dayInCycle = ((stateData.day_count || 0) % 7) + 1;
        const expectedCategory = CATEGORY_CYCLE_7DAY[(stateData.day_count - 1 + 7) % 7];
        passed.push(`✅ State valid: Day ${stateData.day_count} (${dayInCycle}/7), Week ${stateData.week_number}`);
        
        // Verify category matches
        if (todayWods && todayWods.length > 0) {
          const wodCategory = todayWods[0].category;
          if (wodCategory !== expectedCategory) {
            issues.push(`Category mismatch: WOD is ${wodCategory}, expected ${expectedCategory}`);
          } else {
            passed.push(`✅ Category matches: ${expectedCategory}`);
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
          issues.push(`${oldWods.length} old WOD(s) still marked as active: ${oldWods.map(w => `${w.name} (${w.generated_for_date})`).join(", ")}`);
        }
      } else {
        passed.push("✅ No duplicate active WODs from previous days");
      }

      // Display results
      if (issues.length === 0) {
        toast.success("WOD Health Check Passed!", {
          description: passed.join("\n"),
          duration: 8000,
        });
      } else {
        toast.error(`Health Check: ${issues.length} issue(s) found`, {
          description: issues.join("\n"),
          duration: 10000,
        });
        // Also log passed items
        if (passed.length > 0) {
          console.log("[WOD Health Check] Passed items:", passed);
        }
      }

      console.log("[WOD Health Check] Issues:", issues);
      console.log("[WOD Health Check] Passed:", passed);

    } catch (error: any) {
      console.error("Health check error:", error);
      toast.error("Health check failed", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  // Get tomorrow's category (what will be generated next)
  const getTomorrowCategory = () => {
    if (!wodState) return CATEGORY_CYCLE_7DAY[0];
    const tomorrowDayInCycle = ((wodState.day_count || 0) % 7);
    return CATEGORY_CYCLE_7DAY[tomorrowDayInCycle];
  };
  
  const getDayInCycle = () => {
    if (!wodState) return 1;
    return ((wodState.day_count || 0) % 7) + 1;
  };

  // Get current day's category (what was generated today)
  const getTodayCategory = () => {
    if (!wodState || !wodState.day_count) return null;
    const todayDayInCycle = ((wodState.day_count - 1 + 7) % 7);
    return CATEGORY_CYCLE_7DAY[todayDayInCycle];
  };

  const getDifficultyColor = (stars: number | null) => {
    if (!stars) return "bg-muted text-muted-foreground";
    if (stars <= 2) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (stars <= 4) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
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
            Generate, edit, and manage daily workouts. WODs auto-generate at 7:00 AM UTC (9:00 AM Cyprus).
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isRunningHealthCheck}
            onClick={handleHealthCheck}
          >
            {isRunningHealthCheck ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <HeartPulse className="h-4 w-4" />
            )}
            {isRunningHealthCheck ? "Checking..." : "Health Check"}
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setPeriodizationDialogOpen(true)}
          >
            <BookOpen className="h-4 w-4" />
            View Periodization
          </Button>
          
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            disabled={isSyncingImages}
            onClick={handleSyncStripeImages}
          >
            {isSyncingImages ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {isSyncingImages ? "Syncing..." : "Sync Stripe Images"}
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            disabled={isGenerating}
            onClick={() => setGenerateDialogOpen(true)}
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isGenerating ? "Generating..." : "Generate New WOD"}
          </Button>
          
          <GenerateWODDialog
            open={generateDialogOpen}
            onOpenChange={setGenerateDialogOpen}
            onGenerate={handleGenerateWOD}
            isGenerating={isGenerating}
            nextCategory={getTomorrowCategory()}
            dayInCycle={getDayInCycle()}
          />
        </div>
      </div>

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

        {/* Cron Status with Change Button */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Auto-Generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium">05:00 UTC</p>
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
            <p className="text-xs text-muted-foreground mt-1">07:00 Cyprus</p>
          </CardContent>
        </Card>
      </div>

      {/* 7-Day Cycle Calendar with Export */}
      <WODCycleCalendar 
        dayCount={wodState?.day_count || 0} 
        weekNumber={wodState?.week_number} 
        showExport={true} 
      />

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
                      if (!confirm("This will delete the current WODs and generate new ones. Continue?")) return;
                      
                      // Delete existing WODs for today
                      const today = format(new Date(), "yyyy-MM-dd");
                      await supabase
                        .from("admin_workouts")
                        .delete()
                        .eq("is_workout_of_day", true)
                        .eq("generated_for_date", today);
                      
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

      {/* Cron Time Configuration Dialog */}
      <CronTimeConfigDialog
        open={cronDialogOpen}
        onOpenChange={setCronDialogOpen}
        currentHour={5}
      />
    </div>
  );
};
