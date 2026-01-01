import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { format, subDays, addDays, parseISO } from "date-fns";
import {
  getWODInfoForDate,
  getDifficultyBadgeClass,
  getDifficultyBorderClass,
  starsToLevel,
  FORMATS_BY_CATEGORY
} from "@/lib/wodCycle";
import { getCyprusTodayStr } from "@/lib/cyprusDate";

/**
 * Helper to get Cyprus date strings for yesterday/today/tomorrow
 * Uses the shared Cyprus timezone utility for consistency
 */
const getCyprusDateStrings = () => {
  const todayStr = getCyprusTodayStr(); // YYYY-MM-DD in Cyprus timezone
  const today = parseISO(todayStr);
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  
  return {
    yesterdayStr: format(yesterday, "yyyy-MM-dd"),
    todayStr,
    tomorrowStr: format(tomorrow, "yyyy-MM-dd"),
    yesterdayDisplay: format(yesterday, "MMM d"),
    tomorrowDisplay: format(tomorrow, "MMM d"),
  };
};

export const WODTimeline = () => {
  const { yesterdayStr, todayStr, tomorrowStr, yesterdayDisplay, tomorrowDisplay } = getCyprusDateStrings();
  
  // Fetch yesterday's WOD using Cyprus date
  const { data: yesterdayWOD, isLoading: loadingYesterday } = useQuery({
    queryKey: ["yesterday-wod", yesterdayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .eq("generated_for_date", yesterdayStr)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch current WODs (today) using Cyprus date
  const { data: todayWODs, isLoading: loadingToday } = useQuery({
    queryKey: ["today-wods-timeline", todayStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .eq("generated_for_date", todayStr)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Fetch manual overrides for tomorrow
  const { data: wodState, isLoading: loadingState } = useQuery({
    queryKey: ["wod-state-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("manual_overrides")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Calculate tomorrow's WOD info using DATE-BASED calculation with Cyprus dates
  const getTomorrowInfo = () => {
    // Use date-based calculation with Cyprus timezone - always correct
    const wodInfo = getWODInfoForDate(tomorrowStr);
    
    // Check for manual overrides
    const overrides = (wodState?.manual_overrides as Record<string, any>) || {};
    const override = overrides[tomorrowStr];
    
    const category = override?.category || wodInfo.category;
    const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    
    return {
      category,
      difficultyLevel: override?.difficulty 
        ? starsToLevel(override.difficulty)
        : wodInfo.difficulty.level,
      difficultyRange: wodInfo.difficulty.range,
      format: override?.format || formats[0]
    };
  };

  const tomorrowInfo = getTomorrowInfo();
  const isLoading = loadingYesterday || loadingToday || loadingState;

  if (isLoading) {
    return (
      <div className="mb-4 p-2 rounded-lg border border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  // Get difficulty for border color
  const yesterdayDifficulty = yesterdayWOD?.difficulty || "Intermediate";
  const todayDifficulty = todayWODs?.difficulty || "Intermediate";

  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div className="grid grid-cols-3">
        {/* Yesterday */}
        <div className={`p-2 md:p-3 bg-primary/10 dark:bg-primary/20 border-2 ${getDifficultyBorderClass(yesterdayDifficulty)} opacity-80`}>
          <div className="flex items-center gap-1 mb-1 text-muted-foreground">
            <ChevronLeft className="h-3 w-3" />
            <span className="text-[10px] md:text-xs uppercase tracking-wide">Yesterday ({yesterdayDisplay})</span>
          </div>
          {yesterdayWOD ? (
            <div>
              <p className="font-semibold text-xs md:text-sm truncate">{yesterdayWOD.category}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge variant="outline" className="text-[10px] md:text-xs px-1 py-0">
                  {yesterdayWOD.format}
                </Badge>
                <Badge variant="outline" className={`text-[10px] md:text-xs px-1 py-0 ${getDifficultyBadgeClass(yesterdayWOD.difficulty || "")}`}>
                  {yesterdayWOD.difficulty_stars}★
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No data</p>
          )}
        </div>

        {/* Today - Highlighted */}
        <div className={`p-2 md:p-3 bg-primary/10 dark:bg-primary/20 border-2 shadow-sm ${getDifficultyBorderClass(todayDifficulty)}`}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[10px] md:text-xs uppercase tracking-wide font-bold text-primary">Today</span>
            <Star className="h-3 w-3 text-primary fill-primary" />
          </div>
          {todayWODs ? (
            <div className="text-center">
              <p className="font-bold text-sm md:text-base text-foreground truncate">{todayWODs.category}</p>
              <div className="flex flex-wrap justify-center gap-1 mt-1">
                <Badge className="bg-primary text-primary-foreground text-[10px] md:text-xs px-1 py-0">
                  {todayWODs.format}
                </Badge>
                <Badge className={`text-[10px] md:text-xs px-1 py-0 ${getDifficultyBadgeClass(todayWODs.difficulty || "")}`}>
                  {todayWODs.difficulty_stars}★
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">Being prepared...</p>
          )}
        </div>

        {/* Tomorrow */}
        <div className={`p-2 md:p-3 bg-primary/10 dark:bg-primary/20 border-2 opacity-80 ${getDifficultyBorderClass(tomorrowInfo.difficultyLevel)}`}>
          <div className="flex items-center justify-end gap-1 mb-1 text-muted-foreground">
            <span className="text-[10px] md:text-xs uppercase tracking-wide">Tomorrow ({tomorrowDisplay})</span>
            <ChevronRight className="h-3 w-3" />
          </div>
          <div className="text-right">
            <p className="font-semibold text-xs md:text-sm truncate">{tomorrowInfo.category}</p>
            <div className="flex flex-wrap justify-end gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] md:text-xs px-1 py-0">
                {tomorrowInfo.format}
              </Badge>
              <Badge variant="outline" className={`text-[10px] md:text-xs px-1 py-0 ${getDifficultyBadgeClass(tomorrowInfo.difficultyLevel)}`}>
                {tomorrowInfo.difficultyRange[0]}-{tomorrowInfo.difficultyRange[1]}★
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
