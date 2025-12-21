import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { format, subDays, addDays } from "date-fns";

// 8-DAY CATEGORY CYCLE (with PILATES as Day 8)
const CATEGORY_CYCLE_8DAY = [
  "CHALLENGE",
  "STRENGTH", 
  "CARDIO",
  "MOBILITY & STABILITY",
  "STRENGTH",
  "METABOLIC",
  "CALORIE BURNING",
  "PILATES"
];

// DIFFICULTY PATTERN BASE
const DIFFICULTY_PATTERN_BASE = [
  { level: "Intermediate", range: [3, 4] },
  { level: "Advanced", range: [5, 6] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] },
  { level: "Intermediate", range: [3, 4] },
  { level: "Beginner", range: [1, 2] },
  { level: "Advanced", range: [5, 6] },
  { level: "Intermediate", range: [3, 4] }
];

const FORMATS_BY_CATEGORY: Record<string, string[]> = {
  "STRENGTH": ["REPS & SETS"],
  "MOBILITY & STABILITY": ["REPS & SETS"],
  "PILATES": ["REPS & SETS"],
  "CARDIO": ["CIRCUIT", "EMOM", "FOR TIME", "AMRAP", "TABATA"],
  "METABOLIC": ["CIRCUIT", "AMRAP", "EMOM", "FOR TIME", "TABATA"],
  "CALORIE BURNING": ["CIRCUIT", "TABATA", "AMRAP", "FOR TIME", "EMOM"],
  "CHALLENGE": ["CIRCUIT", "TABATA", "AMRAP", "EMOM", "FOR TIME", "MIX"]
};

// Match backend formula: (dayCount % 8) + 1, where dayCount starts at 0
const getDayInCycle = (dayCount: number): number => (dayCount % 8) + 1;

const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_8DAY[dayInCycle - 1];

const getDifficultyForDay = (dayInCycle: number, weekNumber: number): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 8;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 8;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: DIFFICULTY_PATTERN_BASE[shiftedIndex].range as [number, number]
  };
};

const getDifficultyBadgeClass = (level: string) => {
  if (level === "Beginner") return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30";
  if (level === "Intermediate") return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30";
  return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30";
};

// Get border color based on difficulty
const getDifficultyBorderClass = (level: string) => {
  if (level === "Beginner") return "border-yellow-500";
  if (level === "Intermediate") return "border-green-500";
  return "border-red-500";
};

export const WODTimeline = () => {
  const yesterday = subDays(new Date(), 1);
  const tomorrow = addDays(new Date(), 1);
  
  // Fetch yesterday's WOD using generated_for_date (no is_workout_of_day filter since past WODs get flag cleared)
  const { data: yesterdayWOD, isLoading: loadingYesterday } = useQuery({
    queryKey: ["yesterday-wod", format(yesterday, "yyyy-MM-dd")],
    queryFn: async () => {
      const yesterdayDateStr = format(yesterday, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .eq("generated_for_date", yesterdayDateStr)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Fetch current WODs (today) with longer cache - FILTER BY generated_for_date
  const { data: todayWODs, isLoading: loadingToday } = useQuery({
    queryKey: ["today-wods-timeline", format(new Date(), "yyyy-MM-dd")],
    queryFn: async () => {
      const todayDateStr = format(new Date(), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("category, format, difficulty, difficulty_stars")
        .eq("generated_for_date", todayDateStr)
        .limit(1);
      
      if (error) throw error;
      return data?.[0] || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Fetch WOD state for tomorrow calculation with longer cache
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
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Calculate tomorrow's WOD info - always returns data
  // CRITICAL: day_count in state represents AFTER today's generation was completed
  // So for tomorrow, we use the CURRENT day_count (which will be tomorrow's day)
  const getTomorrowInfo = () => {
    const dayCount = wodState?.day_count ?? 0;
    const weekNumber = wodState?.week_number ?? 1;
    
    // day_count is already incremented after today's generation
    // So day_count represents tomorrow's position in the cycle
    const tomorrowDayInCycle = getDayInCycle(dayCount);
    const tomorrowWeekNumber = tomorrowDayInCycle === 1 
      ? weekNumber + 1 
      : weekNumber;
    
    const tomorrowDateStr = format(tomorrow, "yyyy-MM-dd");
    const overrides = (wodState?.manual_overrides as Record<string, any>) || {};
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
      <div className="mb-4 p-2 rounded-lg border border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  // Get yesterday's difficulty for border color
  const yesterdayDifficulty = yesterdayWOD?.difficulty || "Intermediate";
  const todayDifficulty = todayWODs?.difficulty || "Intermediate";

  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/30 overflow-hidden">
      <div className="grid grid-cols-3">
        {/* Yesterday */}
        <div className={`p-2 md:p-3 bg-primary/10 dark:bg-primary/20 border-2 ${getDifficultyBorderClass(yesterdayDifficulty)} opacity-80`}>
          <div className="flex items-center gap-1 mb-1 text-muted-foreground">
            <ChevronLeft className="h-3 w-3" />
            <span className="text-[10px] md:text-xs uppercase tracking-wide">Yesterday ({format(yesterday, "MMM d")})</span>
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
            <p className="text-xs text-muted-foreground text-center">@ 7:00 AM</p>
          )}
        </div>

        {/* Tomorrow */}
        <div className={`p-2 md:p-3 bg-primary/10 dark:bg-primary/20 border-2 opacity-80 ${getDifficultyBorderClass(tomorrowInfo.difficultyLevel)}`}>
          <div className="flex items-center justify-end gap-1 mb-1 text-muted-foreground">
            <span className="text-[10px] md:text-xs uppercase tracking-wide">Tomorrow</span>
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
