import { format, subDays, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getWODInfoForDate, getDifficultyBadgeClass, getDifficultyBorderClass } from "@/lib/wodCycle";

/**
 * Compact Periodization Calendar - 84-Day Cycle
 * Shows Yesterday, Today, Tomorrow with category and difficulty level
 */
const WODPeriodizationCalendar = () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);

  const yesterdayStr = format(yesterday, "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

  const yesterdayInfo = getWODInfoForDate(yesterdayStr);
  const todayInfo = getWODInfoForDate(todayStr);
  const tomorrowInfo = getWODInfoForDate(tomorrowStr);

  const renderDayCell = (
    label: string,
    dateStr: string,
    info: ReturnType<typeof getWODInfoForDate>,
    isToday: boolean = false
  ) => {
    const fullDate = format(new Date(dateStr), "EEEE, MMMM d");
    const borderColor = getDifficultyBorderClass(info.difficulty.level);

    return (
      <div
        className={`flex flex-col items-center p-2 rounded-md transition-all ${borderColor} ${
          isToday
            ? "bg-primary/10 border-2"
            : "bg-muted/30 border"
        }`}
      >
        {/* Day Label */}
        <div className="flex items-center gap-0.5">
          {label === "Yesterday" && <ChevronLeft className="w-2.5 h-2.5 text-muted-foreground" />}
          <span className={`text-[10px] font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
            {label}
          </span>
          {label === "Tomorrow" && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />}
        </div>

        {/* Date */}
        <div className={`text-[9px] sm:text-xs font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
          {fullDate}
        </div>

        {/* Day in 84-day cycle */}
        <div className="text-[9px] text-muted-foreground mt-0.5">
          Day {info.dayIn84}/84
        </div>

        {/* Category */}
        <div className={`text-[10px] font-bold mt-1 text-center ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
          {info.category}
        </div>

        {/* Strength Focus if applicable */}
        {info.strengthFocus && (
          <div className="text-[8px] text-primary/80 mt-0.5">
            {info.strengthFocus}
          </div>
        )}

        {/* Difficulty Badge */}
        {info.isRecoveryDay ? (
          <Badge variant="outline" className="mt-1 text-[9px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-400/30">
            All Levels
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className={`mt-1 text-[9px] px-1.5 py-0 ${getDifficultyBadgeClass(info.difficulty.level)}`}
          >
            {info.difficulty.level}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-4 border-border/50 bg-gradient-to-r from-muted/20 via-background to-muted/20">
      <CardContent className="p-2 sm:p-3">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {renderDayCell("Yesterday", yesterdayStr, yesterdayInfo)}
          {renderDayCell("Today", todayStr, todayInfo, true)}
          {renderDayCell("Tomorrow", tomorrowStr, tomorrowInfo)}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 text-[9px]">
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">Beginner</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Intermediate</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Advanced</span>
          </div>
          <div className="flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Recovery</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WODPeriodizationCalendar;
