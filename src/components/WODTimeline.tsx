import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Star, Flame, Clock } from "lucide-react";
import { format, subDays, addDays } from "date-fns";

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

// DIFFICULTY PATTERN BASE
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] },
  { level: "Advanced", range: [5, 6] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] },
  { level: "Intermediate", range: [3, 4] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] }
];

const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"]
};

const getDayInCycle = (dayCount: number): number => (dayCount % 7) + 1;
const getWeekNumber = (dayCount: number): number => Math.floor(dayCount / 7) + 1;

const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_7DAY[dayInCycle - 1];

const getDifficultyForDay = (dayInCycle: number, weekNumber: number): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 7;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 7;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: DIFFICULTY_PATTERN_BASE[shiftedIndex].range as [number, number]
  };
};

const getDifficultyColor = (level: string) => {
  if (level === "Beginner") return "text-green-500";
  if (level === "Intermediate") return "text-yellow-500";
  return "text-red-500";
};

export const WODTimeline = () => {
  const yesterday = subDays(new Date(), 1);
  const tomorrow = addDays(new Date(), 1);
  
  // Fetch yesterday's WOD
  const { data: yesterdayWOD, isLoading: loadingYesterday } = useQuery({
    queryKey: ["yesterday-wod"],
    queryFn: async () => {
      const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1).toISOString();
      
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .like("id", "WOD-%")
        .gte("created_at", startOfDay)
        .lt("created_at", endOfDay)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  // Fetch current WODs (today)
  const { data: todayWODs, isLoading: loadingToday } = useQuery({
    queryKey: ["today-wods-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .eq("is_workout_of_day", true)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  // Fetch WOD state for tomorrow calculation
  const { data: wodState, isLoading: loadingState } = useQuery({
    queryKey: ["wod-state-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("day_count, week_number, manual_overrides")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate tomorrow's WOD info
  const getTomorrowInfo = () => {
    if (!wodState) return null;
    
    const tomorrowDayCount = (wodState.day_count || 0) + 1;
    const tomorrowDayInCycle = getDayInCycle(tomorrowDayCount);
    const tomorrowWeekNumber = tomorrowDayInCycle === 1 
      ? (wodState.week_number || 1) + 1 
      : (wodState.week_number || 1);
    
    const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
    const overrides = (wodState.manual_overrides as Record<string, any>) || {};
    const override = overrides[tomorrowDateStr];
    
    const category = override?.category || getCategoryForDay(tomorrowDayInCycle);
    const difficultyInfo = getDifficultyForDay(tomorrowDayInCycle, tomorrowWeekNumber);
    const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
    
    return {
      category,
      difficultyLevel: override?.difficulty 
        ? (override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced")
        : difficultyInfo.level,
      difficultyRange: difficultyInfo.range,
      format: override?.format || formats[0]
    };
  };

  const tomorrowInfo = getTomorrowInfo();
  const isLoading = loadingYesterday || loadingToday || loadingState;

  if (isLoading) {
    return (
      <div className="mb-6 p-4 rounded-lg border border-primary/30 bg-primary/5">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-primary/30 bg-gradient-to-r from-muted/50 via-primary/5 to-muted/50 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Yesterday */}
        <div className="p-4 border-b md:border-b-0 md:border-r border-border/50 opacity-70">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Yesterday</span>
          </div>
          {yesterdayWOD ? (
            <div className="space-y-1">
              <p className="font-semibold text-sm">{yesterdayWOD.category}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {yesterdayWOD.format}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(yesterdayWOD.difficulty || "")}`}>
                  {yesterdayWOD.difficulty} ({yesterdayWOD.difficulty_stars}★)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{format(yesterday, "MMM d")}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data</p>
          )}
        </div>

        {/* Today - Highlighted */}
        <div className="p-4 bg-primary/10 border-b md:border-b-0 md:border-r border-border/50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-4 w-4 text-primary" />
            <span className="text-xs uppercase tracking-wide font-bold text-primary">Today</span>
            <Star className="h-4 w-4 text-primary" />
          </div>
          {todayWODs ? (
            <div className="text-center space-y-1">
              <p className="font-bold text-lg text-primary">{todayWODs.category}</p>
              <div className="flex flex-wrap justify-center gap-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {todayWODs.format}
                </Badge>
                <Badge className={`text-xs ${getDifficultyColor(todayWODs.difficulty || "")}`}>
                  {todayWODs.difficulty} ({todayWODs.difficulty_stars}★)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{format(new Date(), "MMM d")}</p>
            </div>
          ) : (
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Generating at 7:00 AM</p>
            </div>
          )}
        </div>

        {/* Tomorrow */}
        <div className="p-4 opacity-70">
          <div className="flex items-center justify-end gap-2 mb-2 text-muted-foreground">
            <span className="text-xs uppercase tracking-wide">Tomorrow</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          {tomorrowInfo ? (
            <div className="text-right space-y-1">
              <p className="font-semibold text-sm">{tomorrowInfo.category}</p>
              <div className="flex flex-wrap justify-end gap-1">
                <Badge variant="outline" className="text-xs">
                  {tomorrowInfo.format}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getDifficultyColor(tomorrowInfo.difficultyLevel)}`}>
                  {tomorrowInfo.difficultyLevel} ({tomorrowInfo.difficultyRange[0]}-{tomorrowInfo.difficultyRange[1]}★)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{format(tomorrow, "MMM d")} @ 7:00 AM</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-right">Calculating...</p>
          )}
        </div>
      </div>
    </div>
  );
};
