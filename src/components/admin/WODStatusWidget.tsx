import { useEffect, useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Flame, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { getCyprusTodayStr } from "@/lib/cyprusDate";
import { fetchVisibleWorkoutMetadata, normalizeWodEquipment } from "@/hooks/useTodayWods";

interface WodStatus {
  date: string;
  found: number;
  expected: number;
  variants: string[];
  lastRunStatus: string | null;
  lastRunTime: string | null;
  lastRunSource: string | null;
}

export const WODStatusWidget = () => {
  const [status, setStatus] = useState<WodStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const cyprusDate = getCyprusTodayStr();

      // Use the canonical visibility RPC (same source the public site uses)
      const allWorkouts = await fetchVisibleWorkoutMetadata(null);
      const todayWods = allWorkouts.filter(
        (w: any) => w.is_workout_of_day === true && w.generated_for_date === cyprusDate
      );

      // Fetch latest run for today
      const { data: runs } = await supabase
        .from("wod_generation_runs" as any)
        .select("status, completed_at, trigger_source, expected_count")
        .eq("cyprus_date", cyprusDate)
        .order("created_at", { ascending: false })
        .limit(1);

      const latestRun = runs?.[0] as any;
      const variants = todayWods
        .map((w: any) => normalizeWodEquipment(w.equipment))
        .filter(Boolean);

      // Determine expected count from run or default to 2
      const expected = latestRun?.expected_count || 2;

      setStatus({
        date: cyprusDate,
        found: variants.length,
        expected,
        variants,
        lastRunStatus: latestRun?.status || null,
        lastRunTime: latestRun?.completed_at || null,
        lastRunSource: latestRun?.trigger_source || null,
      });
      setLastChecked(new Date());
    } catch (error) {
      console.error("Error fetching WOD status:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleManualRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();

    // Auto-refresh every 60 seconds
    intervalRef.current = setInterval(fetchStatus, 60_000);

    // Refresh when the tab regains focus
    const onFocus = () => fetchStatus();
    window.addEventListener("focus", onFocus);

    // Realtime: react instantly to WOD publish/archive changes
    const channel = supabase
      .channel("admin-wod-status-widget")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_workouts" },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [fetchStatus]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse text-sm text-muted-foreground">Loading WOD status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const isHealthy = status.found >= status.expected;
  const missingVariants = ["BODYWEIGHT", "EQUIPMENT"].filter(
    (v) => !status.variants.includes(v)
  );

  return (
    <Card className={`border-2 ${isHealthy ? "border-green-500/30" : "border-destructive/50"}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Today's WODs — {status.date}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="h-7 px-2"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main status */}
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive" />
          )}
          <span className="text-lg font-bold">
            {status.found}/{status.expected}
          </span>
          <Badge variant={isHealthy ? "default" : "destructive"}>
            {isHealthy ? "All Live" : "Missing"}
          </Badge>
        </div>

        {/* Variants */}
        <div className="flex gap-2">
          {status.variants.map((v) => (
            <Badge key={v} variant="outline" className="text-xs">
              ✅ {v}
            </Badge>
          ))}
          {missingVariants
            .filter(() => !isHealthy)
            .map((v) =>
              !status.variants.includes(v) ? (
                <Badge key={v} variant="destructive" className="text-xs">
                  ❌ {v}
                </Badge>
              ) : null
            )}
        </div>

        {/* Last run info */}
        {status.lastRunStatus && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>
              Last run: {status.lastRunStatus}
              {status.lastRunSource ? ` (${status.lastRunSource})` : ""}
              {status.lastRunTime
                ? ` at ${new Date(status.lastRunTime).toLocaleTimeString()}`
                : ""}
            </span>
          </div>
        )}

        {lastChecked && (
          <div className="text-[10px] text-muted-foreground/70">
            Last checked: {lastChecked.toLocaleTimeString()} (auto-refresh every 60s)
          </div>
        )}
      </CardContent>
    </Card>
  );
};
