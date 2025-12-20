import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { Download, CalendarIcon, Dumbbell, Calendar as CalendarIconLucide, ClipboardCheck, Calculator, TrendingUp, TrendingDown, Star, Heart, CheckCircle, Eye, Loader2, Minus, Scale } from "lucide-react";
import html2canvas from "html2canvas";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface MyRecordsReportProps {
  userId: string | undefined;
}

type TimePeriod = "week" | "month" | "quarter" | "6months" | "year" | "custom";

export function MyRecordsReport({ userId }: MyRecordsReportProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    switch (timePeriod) {
      case "week":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "month":
        startDate = startOfDay(subMonths(now, 1));
        break;
      case "quarter":
        startDate = startOfDay(subMonths(now, 3));
        break;
      case "6months":
        startDate = startOfDay(subMonths(now, 6));
        break;
      case "year":
        startDate = startOfDay(subMonths(now, 12));
        break;
      case "custom":
        startDate = customStartDate ? startOfDay(customStartDate) : startOfDay(subMonths(now, 1));
        endDate = customEndDate ? endOfDay(customEndDate) : endOfDay(now);
        break;
      default:
        startDate = startOfDay(subMonths(now, 1));
    }

    return { startDate, endDate };
  };

  const getPreviousPeriodDateRange = () => {
    const { startDate, endDate } = getDateRange();
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStart = new Date(startDate.getTime() - periodLength);
    const previousEnd = new Date(startDate.getTime() - 1);
    return { previousStart, previousEnd };
  };

  const { startDate, endDate } = getDateRange();
  const { previousStart, previousEnd } = getPreviousPeriodDateRange();

  // Fetch workout interactions - current period
  const { data: workoutData } = useQuery({
    queryKey: ["records-workouts", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!userId) return { viewed: 0, favorited: 0, completed: 0, rated: 0 };
      
      const { data, error } = await supabase
        .from("workout_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString());

      if (error) return { viewed: 0, favorited: 0, completed: 0, rated: 0 };

      return {
        viewed: data?.filter(w => w.has_viewed).length || 0,
        favorited: data?.filter(w => w.is_favorite).length || 0,
        completed: data?.filter(w => w.is_completed).length || 0,
        rated: data?.filter(w => w.rating && w.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch workout interactions - previous period
  const { data: prevWorkoutData } = useQuery({
    queryKey: ["records-workouts-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      if (!userId) return { viewed: 0, favorited: 0, completed: 0, rated: 0 };
      
      const { data, error } = await supabase
        .from("workout_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", previousStart.toISOString())
        .lte("updated_at", previousEnd.toISOString());

      if (error) return { viewed: 0, favorited: 0, completed: 0, rated: 0 };

      return {
        viewed: data?.filter(w => w.has_viewed).length || 0,
        favorited: data?.filter(w => w.is_favorite).length || 0,
        completed: data?.filter(w => w.is_completed).length || 0,
        rated: data?.filter(w => w.rating && w.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch program interactions - current period
  const { data: programData } = useQuery({
    queryKey: ["records-programs", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!userId) return { viewed: 0, favorited: 0, completed: 0, rated: 0, ongoing: 0 };
      
      const { data, error } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString());

      if (error) return { viewed: 0, favorited: 0, completed: 0, rated: 0, ongoing: 0 };

      return {
        viewed: data?.filter(p => p.has_viewed).length || 0,
        favorited: data?.filter(p => p.is_favorite).length || 0,
        completed: data?.filter(p => p.is_completed).length || 0,
        rated: data?.filter(p => p.rating && p.rating > 0).length || 0,
        ongoing: data?.filter(p => p.is_ongoing).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch program interactions - previous period
  const { data: prevProgramData } = useQuery({
    queryKey: ["records-programs-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      if (!userId) return { viewed: 0, favorited: 0, completed: 0, rated: 0, ongoing: 0 };
      
      const { data, error } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", previousStart.toISOString())
        .lte("updated_at", previousEnd.toISOString());

      if (error) return { viewed: 0, favorited: 0, completed: 0, rated: 0, ongoing: 0 };

      return {
        viewed: data?.filter(p => p.has_viewed).length || 0,
        favorited: data?.filter(p => p.is_favorite).length || 0,
        completed: data?.filter(p => p.is_completed).length || 0,
        rated: data?.filter(p => p.rating && p.rating > 0).length || 0,
        ongoing: data?.filter(p => p.is_ongoing).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch check-ins - current period
  const { data: checkInData } = useQuery({
    queryKey: ["records-checkins", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!userId) return { morning: 0, night: 0, total: 0, avgScore: 0 };
      
      const { data, error } = await supabase
        .from("smarty_checkins")
        .select("*")
        .eq("user_id", userId)
        .gte("checkin_date", format(startDate, "yyyy-MM-dd"))
        .lte("checkin_date", format(endDate, "yyyy-MM-dd"));

      if (error) return { morning: 0, night: 0, total: 0, avgScore: 0 };

      const morningCount = data?.filter(c => c.morning_completed).length || 0;
      const nightCount = data?.filter(c => c.night_completed).length || 0;
      const scores = data?.filter(c => c.daily_smarty_score).map(c => c.daily_smarty_score as number) || [];
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        morning: morningCount,
        night: nightCount,
        total: morningCount + nightCount,
        avgScore: Math.round(avgScore),
      };
    },
    enabled: !!userId,
  });

  // Fetch check-ins - previous period
  const { data: prevCheckInData } = useQuery({
    queryKey: ["records-checkins-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      if (!userId) return { morning: 0, night: 0, total: 0, avgScore: 0 };
      
      const { data, error } = await supabase
        .from("smarty_checkins")
        .select("*")
        .eq("user_id", userId)
        .gte("checkin_date", format(previousStart, "yyyy-MM-dd"))
        .lte("checkin_date", format(previousEnd, "yyyy-MM-dd"));

      if (error) return { morning: 0, night: 0, total: 0, avgScore: 0 };

      const morningCount = data?.filter(c => c.morning_completed).length || 0;
      const nightCount = data?.filter(c => c.night_completed).length || 0;
      const scores = data?.filter(c => c.daily_smarty_score).map(c => c.daily_smarty_score as number) || [];
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

      return {
        morning: morningCount,
        night: nightCount,
        total: morningCount + nightCount,
        avgScore: Math.round(avgScore),
      };
    },
    enabled: !!userId,
  });

  // Fetch calculator usage - current period
  const { data: calculatorData } = useQuery({
    queryKey: ["records-calculators", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!userId) return { oneRM: 0, bmr: 0, calories: 0 };
      
      const [oneRM, bmr, calories] = await Promise.all([
        supabase.from("onerm_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString()),
        supabase.from("bmr_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString()),
        supabase.from("calorie_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString()),
      ]);

      return {
        oneRM: oneRM.count || 0,
        bmr: bmr.count || 0,
        calories: calories.count || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch calculator usage - previous period
  const { data: prevCalculatorData } = useQuery({
    queryKey: ["records-calculators-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      if (!userId) return { oneRM: 0, bmr: 0, calories: 0 };
      
      const [oneRM, bmr, calories] = await Promise.all([
        supabase.from("onerm_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", previousStart.toISOString()).lte("created_at", previousEnd.toISOString()),
        supabase.from("bmr_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", previousStart.toISOString()).lte("created_at", previousEnd.toISOString()),
        supabase.from("calorie_history").select("id", { count: "exact" }).eq("user_id", userId)
          .gte("created_at", previousStart.toISOString()).lte("created_at", previousEnd.toISOString()),
      ]);

      return {
        oneRM: oneRM.count || 0,
        bmr: bmr.count || 0,
        calories: calories.count || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch measurements - current period
  const { data: measurementData } = useQuery({
    queryKey: ["records-measurements", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!userId) return { weightLogs: 0, bodyFatLogs: 0, muscleMassLogs: 0, totalLogs: 0, latestWeight: null, latestBodyFat: null, latestMuscleMass: null };
      
      const { data, error } = await supabase
        .from("user_activity_log")
        .select("*")
        .eq("user_id", userId)
        .eq("content_type", "measurement")
        .gte("activity_date", format(startDate, "yyyy-MM-dd"))
        .lte("activity_date", format(endDate, "yyyy-MM-dd"))
        .order("activity_date", { ascending: false });

      if (error) return { weightLogs: 0, bodyFatLogs: 0, muscleMassLogs: 0, totalLogs: 0, latestWeight: null, latestBodyFat: null, latestMuscleMass: null };

      const weightLogs = data?.filter(m => (m.tool_result as any)?.weight).length || 0;
      const bodyFatLogs = data?.filter(m => (m.tool_result as any)?.body_fat).length || 0;
      const muscleMassLogs = data?.filter(m => (m.tool_result as any)?.muscle_mass).length || 0;
      
      const latestWeight = data?.find(m => (m.tool_result as any)?.weight);
      const latestBodyFat = data?.find(m => (m.tool_result as any)?.body_fat);
      const latestMuscleMass = data?.find(m => (m.tool_result as any)?.muscle_mass);

      return {
        weightLogs,
        bodyFatLogs,
        muscleMassLogs,
        totalLogs: data?.length || 0,
        latestWeight: latestWeight ? (latestWeight.tool_result as any).weight : null,
        latestBodyFat: latestBodyFat ? (latestBodyFat.tool_result as any).body_fat : null,
        latestMuscleMass: latestMuscleMass ? (latestMuscleMass.tool_result as any).muscle_mass : null,
      };
    },
    enabled: !!userId,
  });

  // Fetch measurements - previous period
  const { data: prevMeasurementData } = useQuery({
    queryKey: ["records-measurements-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      if (!userId) return { totalLogs: 0 };
      
      const { data, error } = await supabase
        .from("user_activity_log")
        .select("id")
        .eq("user_id", userId)
        .eq("content_type", "measurement")
        .gte("activity_date", format(previousStart, "yyyy-MM-dd"))
        .lte("activity_date", format(previousEnd, "yyyy-MM-dd"));

      if (error) return { totalLogs: 0 };

      return {
        totalLogs: data?.length || 0,
      };
    },
    enabled: !!userId,
  });

  // Comparison badge component
  const ComparisonBadge = ({ current, previous }: { current: number; previous: number }) => {
    const diff = current - previous;
    if (diff === 0) {
      return (
        <div className="text-xs mt-1 flex items-center justify-center gap-1 text-gray-400">
          <Minus className="h-3 w-3" />
          <span>same</span>
        </div>
      );
    }
    const isPositive = diff > 0;
    return (
      <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{isPositive ? '+' : ''}{diff} vs prev</span>
      </div>
    );
  };

  // Generate motivational message based on activity
  const getMotivationalMessage = () => {
    const totalWorkouts = workoutData?.completed || 0;
    const totalPrograms = programData?.completed || 0;
    const totalCheckins = checkInData?.total || 0;
    const avgScore = checkInData?.avgScore || 0;

    if (totalWorkouts >= 20) {
      return `Outstanding! You've crushed ${totalWorkouts} workouts this period. You're on fire! 🔥`;
    } else if (totalWorkouts >= 10) {
      return `Great progress! ${totalWorkouts} workouts completed. Keep up the momentum! 💪`;
    } else if (totalWorkouts >= 5) {
      return `Good start with ${totalWorkouts} workouts! Consistency is key - you're building great habits.`;
    } else if (totalCheckins >= 10) {
      return `You've completed ${totalCheckins} check-ins with an average score of ${avgScore}. Tracking is the first step to improvement!`;
    } else if (totalPrograms > 0) {
      return `You've completed ${totalPrograms} program${totalPrograms > 1 ? 's' : ''}. Structured training leads to lasting results!`;
    } else {
      return "Every journey starts with a single step. Start tracking your workouts today and watch your progress grow!";
    }
  };

  const handleExport = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    try {
      const images = reportRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const link = document.createElement("a");
      link.download = `SmartyGym-Activity-Report-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "week": return "Last 7 Days";
      case "month": return "Last Month";
      case "quarter": return "Last 3 Months";
      case "6months": return "Last 6 Months";
      case "year": return "Last 12 Months";
      case "custom": 
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, "MMM d, yyyy")} - ${format(customEndDate, "MMM d, yyyy")}`;
        }
        return "Custom Period";
      default: return "Last Month";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>

          {timePeriod === "custom" && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "MMM d, yyyy") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[130px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "MMM d, yyyy") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <Button onClick={handleExport} disabled={exporting} className="cta-button">
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export Report
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className={`p-6 rounded-lg ${exporting ? 'bg-white' : 'bg-card'}`}>
        {/* Header with Logo - Only visible during export */}
        <div className={`text-center mb-8 ${exporting ? '' : 'hidden'}`} id="export-header">
          <img 
            src={smartyGymLogo} 
            alt="SmartyGym" 
            className="h-24 mx-auto mb-4"
            crossOrigin="anonymous"
          />
          <p className="text-sm font-medium mb-4" style={{ color: '#29B6D2' }}>Your Gym Re-imagined. Anywhere, Anytime.</p>
          <h2 className="text-2xl font-bold text-gray-900">Activity Report</h2>
          <p className="text-gray-600">{getPeriodLabel()}</p>
        </div>

        {/* Activity Summary Table */}
        <div className="border-2 border-primary rounded-lg overflow-hidden mb-8">
          {/* Workouts Section */}
          <div className="border-b border-primary/30">
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Smarty Workouts</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/20">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Viewed</span>
                </div>
                <p className="text-2xl font-bold">{workoutData?.viewed || 0}</p>
                {prevWorkoutData && <ComparisonBadge current={workoutData?.viewed || 0} previous={prevWorkoutData.viewed} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Favorited</span>
                </div>
                <p className="text-2xl font-bold">{workoutData?.favorited || 0}</p>
                {prevWorkoutData && <ComparisonBadge current={workoutData?.favorited || 0} previous={prevWorkoutData.favorited} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{workoutData?.completed || 0}</p>
                {prevWorkoutData && <ComparisonBadge current={workoutData?.completed || 0} previous={prevWorkoutData.completed} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rated</span>
                </div>
                <p className="text-2xl font-bold">{workoutData?.rated || 0}</p>
                {prevWorkoutData && <ComparisonBadge current={workoutData?.rated || 0} previous={prevWorkoutData.rated} />}
              </div>
            </div>
          </div>

          {/* Programs Section */}
          <div className="border-b border-primary/30">
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
              <CalendarIconLucide className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Smarty Programs</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-primary/20">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">Viewed</span>
                </div>
                <p className="text-2xl font-bold">{programData?.viewed || 0}</p>
                {prevProgramData && <ComparisonBadge current={programData?.viewed || 0} previous={prevProgramData.viewed} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Heart className="h-4 w-4" />
                  <span className="text-sm">Favorited</span>
                </div>
                <p className="text-2xl font-bold">{programData?.favorited || 0}</p>
                {prevProgramData && <ComparisonBadge current={programData?.favorited || 0} previous={prevProgramData.favorited} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm">Ongoing</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{programData?.ongoing || 0}</p>
                {prevProgramData && <ComparisonBadge current={programData?.ongoing || 0} previous={prevProgramData.ongoing} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Completed</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{programData?.completed || 0}</p>
                {prevProgramData && <ComparisonBadge current={programData?.completed || 0} previous={prevProgramData.completed} />}
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Rated</span>
                </div>
                <p className="text-2xl font-bold">{programData?.rated || 0}</p>
                {prevProgramData && <ComparisonBadge current={programData?.rated || 0} previous={prevProgramData.rated} />}
              </div>
            </div>
          </div>

          {/* Check-ins Section */}
          <div className="border-b border-primary/30">
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Smarty Check-ins</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/20">
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Morning</div>
                <p className="text-2xl font-bold">{checkInData?.morning || 0}</p>
                {prevCheckInData && <ComparisonBadge current={checkInData?.morning || 0} previous={prevCheckInData.morning} />}
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Night</div>
                <p className="text-2xl font-bold">{checkInData?.night || 0}</p>
                {prevCheckInData && <ComparisonBadge current={checkInData?.night || 0} previous={prevCheckInData.night} />}
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Total</div>
                <p className="text-2xl font-bold text-primary">{checkInData?.total || 0}</p>
                {prevCheckInData && <ComparisonBadge current={checkInData?.total || 0} previous={prevCheckInData.total} />}
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Avg Score</div>
                <p className="text-2xl font-bold">{checkInData?.avgScore || 0}</p>
                {prevCheckInData && <ComparisonBadge current={checkInData?.avgScore || 0} previous={prevCheckInData.avgScore} />}
              </div>
            </div>
          </div>

          {/* Calculators Section */}
          <div className="border-b border-primary/30">
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Smarty Tools</h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-primary/20">
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">1RM Calculations</div>
                <p className="text-2xl font-bold">{calculatorData?.oneRM || 0}</p>
                {prevCalculatorData && <ComparisonBadge current={calculatorData?.oneRM || 0} previous={prevCalculatorData.oneRM} />}
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">BMR Calculations</div>
                <p className="text-2xl font-bold">{calculatorData?.bmr || 0}</p>
                {prevCalculatorData && <ComparisonBadge current={calculatorData?.bmr || 0} previous={prevCalculatorData.bmr} />}
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Macro Calculations</div>
                <p className="text-2xl font-bold">{calculatorData?.calories || 0}</p>
                {prevCalculatorData && <ComparisonBadge current={calculatorData?.calories || 0} previous={prevCalculatorData.calories} />}
              </div>
            </div>
          </div>

          {/* Measurements Section */}
          <div>
            <div className="bg-primary/10 px-4 py-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Body Measurements</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary/20">
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Weight Logs</div>
                <p className="text-2xl font-bold">{measurementData?.weightLogs || 0}</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Body Fat Logs</div>
                <p className="text-2xl font-bold">{measurementData?.bodyFatLogs || 0}</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Muscle Mass Logs</div>
                <p className="text-2xl font-bold">{measurementData?.muscleMassLogs || 0}</p>
              </div>
              <div className="p-4 text-center">
                <div className="text-muted-foreground text-sm mb-1">Total Entries</div>
                <p className="text-2xl font-bold text-primary">{measurementData?.totalLogs || 0}</p>
                {prevMeasurementData && <ComparisonBadge current={measurementData?.totalLogs || 0} previous={prevMeasurementData.totalLogs} />}
              </div>
            </div>
            {/* Latest Values */}
            {(measurementData?.latestWeight || measurementData?.latestBodyFat || measurementData?.latestMuscleMass) && (
              <div className="border-t border-primary/20 p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Latest Recorded Values</p>
                <div className="flex flex-wrap gap-4 justify-center">
                  {measurementData?.latestWeight && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{measurementData.latestWeight} kg</p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                  )}
                  {measurementData?.latestBodyFat && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{measurementData.latestBodyFat}%</p>
                      <p className="text-xs text-muted-foreground">Body Fat</p>
                    </div>
                  )}
                  {measurementData?.latestMuscleMass && (
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{measurementData.latestMuscleMass} kg</p>
                      <p className="text-xs text-muted-foreground">Muscle Mass</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Motivational Message */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Your Progress Summary</h4>
                <p className="text-muted-foreground">{getMotivationalMessage()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer - Only visible during export */}
        <div className={`text-center mt-6 text-sm text-gray-500 ${exporting ? '' : 'hidden'}`}>
          <p>Generated on {format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
          <p className="text-xs mt-1 font-medium" style={{ color: '#29B6D2' }}>SmartyGym - Your Gym Re-imagined. Anywhere, Anytime.</p>
        </div>
      </div>
    </div>
  );
}
