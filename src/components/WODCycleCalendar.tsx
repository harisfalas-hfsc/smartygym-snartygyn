import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, FileText, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, startOfDay } from "date-fns";
import { toast } from "sonner";

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

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "CHALLENGE": { bg: "bg-purple-500/20", text: "text-purple-700 dark:text-purple-400", border: "border-purple-500/50" },
  "STRENGTH": { bg: "bg-red-500/20", text: "text-red-700 dark:text-red-400", border: "border-red-500/50" },
  "CARDIO": { bg: "bg-blue-500/20", text: "text-blue-700 dark:text-blue-400", border: "border-blue-500/50" },
  "MOBILITY & STABILITY": { bg: "bg-teal-500/20", text: "text-teal-700 dark:text-teal-400", border: "border-teal-500/50" },
  "METABOLIC": { bg: "bg-orange-500/20", text: "text-orange-700 dark:text-orange-400", border: "border-orange-500/50" },
  "CALORIE BURNING": { bg: "bg-pink-500/20", text: "text-pink-700 dark:text-pink-400", border: "border-pink-500/50" }
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  "Beginner": { bg: "bg-green-500/20", text: "text-green-700 dark:text-green-400" },
  "Intermediate": { bg: "bg-yellow-500/20", text: "text-yellow-700 dark:text-yellow-400" },
  "Advanced": { bg: "bg-red-500/20", text: "text-red-700 dark:text-red-400" }
};

const getDayInCycle = (dayCount: number): number => (dayCount % 7) + 1;

const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_7DAY[dayInCycle - 1];

const getDifficultyForDay = (dayInCycle: number, weekNumber: number): { level: string; range: [number, number] } => {
  const shiftAmount = (weekNumber - 1) % 7;
  const shiftedIndex = ((dayInCycle - 1) + shiftAmount) % 7;
  return {
    level: DIFFICULTY_PATTERN_BASE[shiftedIndex].level,
    range: DIFFICULTY_PATTERN_BASE[shiftedIndex].range as [number, number]
  };
};

interface ScheduleDay {
  date: Date;
  dateStr: string;
  dayInCycle: number;
  category: string;
  difficultyLevel: string;
  difficultyRange: [number, number];
  formats: string[];
  isToday: boolean;
  isPast: boolean;
}

export const WODCycleCalendar = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  // Fetch WOD state
  const { data: wodState, isLoading } = useQuery({
    queryKey: ["wod-state-calendar"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_of_day_state")
        .select("day_count, week_number, manual_overrides")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  // Calculate 7-day schedule based on week offset
  const getWeekSchedule = (): ScheduleDay[] => {
    if (!wodState) return [];
    
    const schedule: ScheduleDay[] = [];
    const today = startOfDay(new Date());
    const currentDayCount = wodState.day_count || 0;
    const currentWeekNumber = wodState.week_number || 1;
    const manualOverrides = (wodState.manual_overrides as Record<string, any>) || {};
    
    // Start from first day of the offset week
    const weekStartOffset = weekOffset * 7;
    
    for (let i = 0; i < 7; i++) {
      const dayOffset = weekStartOffset + i;
      const targetDate = addDays(today, dayOffset);
      const dateStr = format(targetDate, "yyyy-MM-dd");
      
      const futureDayCount = currentDayCount + dayOffset;
      const dayInCycle = getDayInCycle(futureDayCount);
      
      // Calculate week number for this day
      let futureWeekNumber = currentWeekNumber;
      for (let d = 1; d <= dayOffset; d++) {
        if (getDayInCycle(currentDayCount + d) === 1) {
          futureWeekNumber++;
        }
      }
      
      const override = manualOverrides[dateStr];
      const category = override?.category || getCategoryForDay(dayInCycle);
      const difficultyInfo = getDifficultyForDay(dayInCycle, futureWeekNumber);
      const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
      
      schedule.push({
        date: targetDate,
        dateStr,
        dayInCycle,
        category,
        difficultyLevel: override?.difficulty 
          ? (override.difficulty <= 2 ? "Beginner" : override.difficulty <= 4 ? "Intermediate" : "Advanced")
          : difficultyInfo.level,
        difficultyRange: difficultyInfo.range,
        formats,
        isToday: dayOffset === 0,
        isPast: dayOffset < 0
      });
    }
    
    return schedule;
  };

  const weekSchedule = getWeekSchedule();

  // Generate CSV content
  const generateCSV = () => {
    const headers = ["Date", "Day", "Cycle Day", "Category", "Difficulty", "Stars Range", "Available Formats"];
    const rows = weekSchedule.map(day => [
      format(day.date, "yyyy-MM-dd"),
      format(day.date, "EEEE"),
      `Day ${day.dayInCycle}/7`,
      day.category,
      day.difficultyLevel,
      `${day.difficultyRange[0]}-${day.difficultyRange[1]}`,
      day.formats.join("; ")
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    return csvContent;
  };

  // Generate full 4-week schedule for export
  const generateFullScheduleCSV = () => {
    if (!wodState) return "";
    
    const headers = ["Date", "Day", "Cycle Day", "Category", "Difficulty", "Stars Range", "Available Formats"];
    const rows: string[][] = [];
    const today = startOfDay(new Date());
    const currentDayCount = wodState.day_count || 0;
    const currentWeekNumber = wodState.week_number || 1;
    
    for (let i = 0; i < 28; i++) {
      const targetDate = addDays(today, i);
      const futureDayCount = currentDayCount + i;
      const dayInCycle = getDayInCycle(futureDayCount);
      
      let futureWeekNumber = currentWeekNumber;
      for (let d = 1; d <= i; d++) {
        if (getDayInCycle(currentDayCount + d) === 1) {
          futureWeekNumber++;
        }
      }
      
      const category = getCategoryForDay(dayInCycle);
      const difficultyInfo = getDifficultyForDay(dayInCycle, futureWeekNumber);
      const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
      
      rows.push([
        format(targetDate, "yyyy-MM-dd"),
        format(targetDate, "EEEE"),
        `Day ${dayInCycle}/7`,
        category,
        difficultyInfo.level,
        `${difficultyInfo.range[0]}-${difficultyInfo.range[1]}`,
        formats.join("; ")
      ]);
    }
    
    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  };

  const handleDownloadCSV = (fullSchedule: boolean = false) => {
    const csvContent = fullSchedule ? generateFullScheduleCSV() : generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fullSchedule 
      ? `SmartyGym_WOD_Schedule_4Weeks_${format(new Date(), "yyyy-MM-dd")}.csv`
      : `SmartyGym_WOD_Schedule_Week_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Schedule downloaded", { description: fullSchedule ? "4-week schedule exported" : "Weekly schedule exported" });
  };

  const handleDownloadPDF = () => {
    // Generate printable HTML and trigger print dialog
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>SmartyGym WOD Schedule</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #666; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .category-challenge { background-color: #e9d5ff; }
          .category-strength { background-color: #fecaca; }
          .category-cardio { background-color: #bfdbfe; }
          .category-mobility { background-color: #99f6e4; }
          .category-metabolic { background-color: #fed7aa; }
          .category-calorie { background-color: #fbcfe8; }
          .today { font-weight: bold; background-color: #fef08a !important; }
          .difficulty-beginner { color: #16a34a; }
          .difficulty-intermediate { color: #ca8a04; }
          .difficulty-advanced { color: #dc2626; }
          .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🏋️ SmartyGym WOD Periodization Schedule</h1>
        <p style="text-align: center; color: #666;">Your Gym Re-imagined. Anywhere, Anytime.</p>
        <p style="text-align: center;">Generated: ${format(new Date(), "MMMM d, yyyy")}</p>
        
        <h2>Next 4 Weeks Schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Cycle</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Stars</th>
              <th>Formats</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              if (!wodState) return "";
              const today = startOfDay(new Date());
              const currentDayCount = wodState.day_count || 0;
              const currentWeekNumber = wodState.week_number || 1;
              let rows = "";
              
              for (let i = 0; i < 28; i++) {
                const targetDate = addDays(today, i);
                const futureDayCount = currentDayCount + i;
                const dayInCycle = getDayInCycle(futureDayCount);
                
                let futureWeekNumber = currentWeekNumber;
                for (let d = 1; d <= i; d++) {
                  if (getDayInCycle(currentDayCount + d) === 1) {
                    futureWeekNumber++;
                  }
                }
                
                const category = getCategoryForDay(dayInCycle);
                const difficultyInfo = getDifficultyForDay(dayInCycle, futureWeekNumber);
                const formats = FORMATS_BY_CATEGORY[category] || ["CIRCUIT"];
                
                const categoryClass = category.toLowerCase()
                  .replace("& stability", "")
                  .replace(" ", "-")
                  .replace("calorie burning", "calorie")
                  .replace("mobility", "mobility")
                  .trim();
                
                rows += `
                  <tr class="${i === 0 ? 'today' : ''} category-${categoryClass}">
                    <td>${format(targetDate, "MMM d, yyyy")}</td>
                    <td>${format(targetDate, "EEEE")}</td>
                    <td>Day ${dayInCycle}/7</td>
                    <td>${category}</td>
                    <td class="difficulty-${difficultyInfo.level.toLowerCase()}">${difficultyInfo.level}</td>
                    <td>${difficultyInfo.range[0]}-${difficultyInfo.range[1]}★</td>
                    <td>${formats.join(", ")}</td>
                  </tr>
                `;
              }
              return rows;
            })()}
          </tbody>
        </table>
        
        <div class="footer">
          <p>SmartyGym - Expert Fitness | smartygym.com</p>
          <p>100% Human. 0% AI. | Designed by Coach Haris Falas</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      toast.success("PDF ready", { description: "Use print dialog to save as PDF" });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            7-Day Periodization Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              7-Day Periodization Cycle
            </CardTitle>
            <CardDescription>
              Color-coded workout categories with difficulty levels
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadCSV(false)}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Week CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDownloadCSV(true)}
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">4-Week CSV</span>
              <span className="sm:hidden">4W</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownloadPDF}
            >
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(prev => prev - 1)}
            disabled={weekOffset <= -2}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          <span className="text-sm font-medium">
            {weekOffset === 0 ? "This Week" : weekOffset > 0 ? `${weekOffset} Week${weekOffset > 1 ? "s" : ""} Ahead` : `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? "s" : ""} Ago`}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setWeekOffset(prev => prev + 1)}
            disabled={weekOffset >= 3}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weekSchedule.map((day) => {
            const categoryColor = CATEGORY_COLORS[day.category] || CATEGORY_COLORS["CHALLENGE"];
            const difficultyColor = DIFFICULTY_COLORS[day.difficultyLevel] || DIFFICULTY_COLORS["Intermediate"];
            
            return (
              <div
                key={day.dateStr}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${categoryColor.bg} ${categoryColor.border}
                  ${day.isToday ? 'ring-2 ring-primary ring-offset-2 shadow-lg' : ''}
                  ${day.isPast ? 'opacity-60' : ''}
                `}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${day.isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day.date, "EEE")}
                  </span>
                  <span className={`text-sm font-bold ${day.isToday ? 'text-primary' : categoryColor.text}`}>
                    {format(day.date, "d")}
                  </span>
                </div>
                
                {/* Day in Cycle Badge */}
                <Badge variant="outline" className="mb-2 text-[10px] w-full justify-center">
                  Day {day.dayInCycle}/7
                </Badge>
                
                {/* Category */}
                <p className={`text-xs font-semibold ${categoryColor.text} mb-2 text-center leading-tight`}>
                  {day.category}
                </p>
                
                {/* Difficulty Badge */}
                <div className={`${difficultyColor.bg} rounded px-2 py-1 text-center`}>
                  <div className="flex items-center justify-center gap-1">
                    <Star className={`h-3 w-3 ${difficultyColor.text}`} />
                    <span className={`text-[10px] font-medium ${difficultyColor.text}`}>
                      {day.difficultyLevel}
                    </span>
                  </div>
                  <span className={`text-[10px] ${difficultyColor.text}`}>
                    {day.difficultyRange[0]}-{day.difficultyRange[1]}★
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Category Colors:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, colors]) => (
              <Badge 
                key={category} 
                variant="outline" 
                className={`${colors.bg} ${colors.text} ${colors.border} text-[10px]`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
