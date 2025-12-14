import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FileText, CalendarIcon, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import smartyGymLogo from "@/assets/smarty-gym-logo.png";

interface LogBookAdvancedExportProps {
  userId: string;
}

type TimePeriod = "7days" | "30days" | "3months" | "6months" | "12months" | "custom";

export const LogBookAdvancedExport = ({ userId }: LogBookAdvancedExportProps) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30days");
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  const [exporting, setExporting] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = endOfDay(now);

    switch (timePeriod) {
      case "7days":
        startDate = startOfDay(subDays(now, 7));
        break;
      case "30days":
        startDate = startOfDay(subDays(now, 30));
        break;
      case "3months":
        startDate = startOfDay(subMonths(now, 3));
        break;
      case "6months":
        startDate = startOfDay(subMonths(now, 6));
        break;
      case "12months":
        startDate = startOfDay(subMonths(now, 12));
        break;
      case "custom":
        startDate = customStartDate ? startOfDay(customStartDate) : startOfDay(subDays(now, 30));
        endDate = customEndDate ? endOfDay(customEndDate) : endOfDay(now);
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
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

  // Fetch workout interactions
  const { data: workoutData, isLoading: workoutsLoading } = useQuery({
    queryKey: ["export-workouts", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("workout_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString());

      return {
        viewed: data?.filter(w => w.has_viewed).length || 0,
        favorited: data?.filter(w => w.is_favorite).length || 0,
        completed: data?.filter(w => w.is_completed).length || 0,
        rated: data?.filter(w => w.rating && w.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  const { data: prevWorkoutData } = useQuery({
    queryKey: ["export-workouts-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("workout_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", previousStart.toISOString())
        .lte("updated_at", previousEnd.toISOString());

      return {
        viewed: data?.filter(w => w.has_viewed).length || 0,
        favorited: data?.filter(w => w.is_favorite).length || 0,
        completed: data?.filter(w => w.is_completed).length || 0,
        rated: data?.filter(w => w.rating && w.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch program interactions
  const { data: programData, isLoading: programsLoading } = useQuery({
    queryKey: ["export-programs", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", startDate.toISOString())
        .lte("updated_at", endDate.toISOString());

      return {
        viewed: data?.filter(p => p.has_viewed).length || 0,
        favorited: data?.filter(p => p.is_favorite).length || 0,
        ongoing: data?.filter(p => p.is_ongoing).length || 0,
        completed: data?.filter(p => p.is_completed).length || 0,
        rated: data?.filter(p => p.rating && p.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  const { data: prevProgramData } = useQuery({
    queryKey: ["export-programs-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("program_interactions")
        .select("*")
        .eq("user_id", userId)
        .gte("updated_at", previousStart.toISOString())
        .lte("updated_at", previousEnd.toISOString());

      return {
        viewed: data?.filter(p => p.has_viewed).length || 0,
        favorited: data?.filter(p => p.is_favorite).length || 0,
        ongoing: data?.filter(p => p.is_ongoing).length || 0,
        completed: data?.filter(p => p.is_completed).length || 0,
        rated: data?.filter(p => p.rating && p.rating > 0).length || 0,
      };
    },
    enabled: !!userId,
  });

  // Fetch check-ins
  const { data: checkInData, isLoading: checkinsLoading } = useQuery({
    queryKey: ["export-checkins", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("smarty_checkins")
        .select("*")
        .eq("user_id", userId)
        .gte("checkin_date", format(startDate, "yyyy-MM-dd"))
        .lte("checkin_date", format(endDate, "yyyy-MM-dd"));

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

  const { data: prevCheckInData } = useQuery({
    queryKey: ["export-checkins-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("smarty_checkins")
        .select("*")
        .eq("user_id", userId)
        .gte("checkin_date", format(previousStart, "yyyy-MM-dd"))
        .lte("checkin_date", format(previousEnd, "yyyy-MM-dd"));

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

  // Fetch calculator usage
  const { data: calculatorData, isLoading: calculatorsLoading } = useQuery({
    queryKey: ["export-calculators", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
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

  const { data: prevCalculatorData } = useQuery({
    queryKey: ["export-calculators-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
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

  // Fetch measurements
  const { data: measurementData, isLoading: measurementsLoading } = useQuery({
    queryKey: ["export-measurements", userId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_activity_log")
        .select("*")
        .eq("user_id", userId)
        .eq("content_type", "measurement")
        .gte("activity_date", format(startDate, "yyyy-MM-dd"))
        .lte("activity_date", format(endDate, "yyyy-MM-dd"))
        .order("activity_date", { ascending: false });

      const weightLogs = data?.filter(m => (m.tool_result as any)?.weight).length || 0;
      const bodyFatLogs = data?.filter(m => (m.tool_result as any)?.body_fat).length || 0;
      const muscleMassLogs = data?.filter(m => (m.tool_result as any)?.muscle_mass).length || 0;
      
      // Get latest values
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

  const { data: prevMeasurementData } = useQuery({
    queryKey: ["export-measurements-prev", userId, previousStart.toISOString(), previousEnd.toISOString()],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_activity_log")
        .select("*")
        .eq("user_id", userId)
        .eq("content_type", "measurement")
        .gte("activity_date", format(previousStart, "yyyy-MM-dd"))
        .lte("activity_date", format(previousEnd, "yyyy-MM-dd"));

      return {
        totalLogs: data?.length || 0,
      };
    },
    enabled: !!userId,
  });

  const isLoading = workoutsLoading || programsLoading || checkinsLoading || calculatorsLoading || measurementsLoading;

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case "7days": return "Last 7 Days";
      case "30days": return "Last 30 Days";
      case "3months": return "Last 3 Months";
      case "6months": return "Last 6 Months";
      case "12months": return "Last 12 Months";
      case "custom": 
        if (customStartDate && customEndDate) {
          return `${format(customStartDate, "MMM d, yyyy")} - ${format(customEndDate, "MMM d, yyyy")}`;
        }
        return "Custom Period";
      default: return "Last 30 Days";
    }
  };

  const getComparisonText = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff === 0) return '<span style="color: #999;">same as prev</span>';
    if (diff > 0) return `<span style="color: #22c55e;">↑ +${diff} vs prev</span>`;
    return `<span style="color: #ef4444;">↓ ${diff} vs prev</span>`;
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      toast.info("Generating comprehensive report...");

      // Convert logo to base64
      let logoBase64 = '';
      try {
        const response = await fetch(smartyGymLogo);
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.log('Could not load logo');
      }

      const reportHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>SmartyGym LogBook Report</title>
            <style>
              * { box-sizing: border-box; }
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                background: #fff;
              }
              .header { text-align: center; margin-bottom: 30px; }
              .header img { height: 80px; margin-bottom: 10px; }
              .header h1 { margin: 0; color: #29B6D2; font-size: 28px; }
              .header .tagline { color: #29B6D2; font-size: 14px; margin: 5px 0; }
              .header .period { color: #666; font-size: 16px; margin-top: 10px; }
              
              .section { 
                margin-bottom: 25px; 
                border: 2px solid #29B6D2; 
                border-radius: 12px; 
                overflow: hidden;
              }
              .section-header { 
                background: linear-gradient(135deg, #29B6D2 0%, #1e9ab8 100%);
                color: white; 
                padding: 12px 20px; 
                font-weight: 600;
                font-size: 16px;
              }
              .section-content { padding: 0; }
              
              table { 
                width: 100%; 
                border-collapse: collapse; 
              }
              th, td { 
                padding: 12px 15px; 
                text-align: center; 
                border-bottom: 1px solid #e5e5e5;
              }
              th { 
                background: #f8f9fa; 
                color: #666; 
                font-weight: 500;
                font-size: 13px;
              }
              td { font-size: 14px; }
              .value { 
                font-size: 24px; 
                font-weight: bold; 
                color: #333;
              }
              .value.highlight { color: #22c55e; }
              .comparison { font-size: 11px; margin-top: 4px; }
              
              .latest-values {
                background: #f8f9fa;
                padding: 15px 20px;
                border-top: 1px solid #e5e5e5;
              }
              .latest-values h4 { 
                margin: 0 0 10px 0; 
                color: #666; 
                font-size: 13px;
              }
              .latest-grid {
                display: flex;
                gap: 20px;
              }
              .latest-item {
                flex: 1;
                text-align: center;
              }
              .latest-value {
                font-size: 18px;
                font-weight: bold;
                color: #29B6D2;
              }
              .latest-label {
                font-size: 11px;
                color: #666;
              }
              
              .summary-card {
                background: linear-gradient(135deg, rgba(41, 182, 210, 0.1) 0%, rgba(41, 182, 210, 0.05) 100%);
                border: 2px solid #29B6D2;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 25px;
              }
              .summary-card h3 { 
                margin: 0 0 10px 0; 
                color: #29B6D2;
              }
              .summary-card p { 
                margin: 0; 
                color: #555;
                line-height: 1.6;
              }
              
              .footer { 
                text-align: center; 
                margin-top: 30px; 
                padding-top: 20px;
                border-top: 1px solid #e5e5e5;
                color: #999;
                font-size: 12px;
              }
              .footer .brand { color: #29B6D2; font-weight: 500; }
              
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              ${logoBase64 ? `<img src="${logoBase64}" alt="SmartyGym" />` : '<h1 style="color: #29B6D2;">SmartyGym</h1>'}
              <p class="tagline">Your Gym Re-imagined. Anywhere, Anytime.</p>
              <h1>LogBook Activity Report</h1>
              <p class="period">${getPeriodLabel()}</p>
            </div>

            <!-- Smarty Workouts Section -->
            <div class="section">
              <div class="section-header">💪 Smarty Workouts</div>
              <div class="section-content">
                <table>
                  <thead>
                    <tr>
                      <th>Viewed</th>
                      <th>Favorited</th>
                      <th>Completed</th>
                      <th>Rated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="value">${workoutData?.viewed || 0}</div>
                        <div class="comparison">${getComparisonText(workoutData?.viewed || 0, prevWorkoutData?.viewed || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${workoutData?.favorited || 0}</div>
                        <div class="comparison">${getComparisonText(workoutData?.favorited || 0, prevWorkoutData?.favorited || 0)}</div>
                      </td>
                      <td>
                        <div class="value highlight">${workoutData?.completed || 0}</div>
                        <div class="comparison">${getComparisonText(workoutData?.completed || 0, prevWorkoutData?.completed || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${workoutData?.rated || 0}</div>
                        <div class="comparison">${getComparisonText(workoutData?.rated || 0, prevWorkoutData?.rated || 0)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Smarty Programs Section -->
            <div class="section">
              <div class="section-header">📅 Smarty Programs</div>
              <div class="section-content">
                <table>
                  <thead>
                    <tr>
                      <th>Viewed</th>
                      <th>Favorited</th>
                      <th>Ongoing</th>
                      <th>Completed</th>
                      <th>Rated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="value">${programData?.viewed || 0}</div>
                        <div class="comparison">${getComparisonText(programData?.viewed || 0, prevProgramData?.viewed || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${programData?.favorited || 0}</div>
                        <div class="comparison">${getComparisonText(programData?.favorited || 0, prevProgramData?.favorited || 0)}</div>
                      </td>
                      <td>
                        <div class="value" style="color: #3b82f6;">${programData?.ongoing || 0}</div>
                        <div class="comparison">${getComparisonText(programData?.ongoing || 0, prevProgramData?.ongoing || 0)}</div>
                      </td>
                      <td>
                        <div class="value highlight">${programData?.completed || 0}</div>
                        <div class="comparison">${getComparisonText(programData?.completed || 0, prevProgramData?.completed || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${programData?.rated || 0}</div>
                        <div class="comparison">${getComparisonText(programData?.rated || 0, prevProgramData?.rated || 0)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Smarty Check-ins Section -->
            <div class="section">
              <div class="section-header">✅ Smarty Check-ins</div>
              <div class="section-content">
                <table>
                  <thead>
                    <tr>
                      <th>Morning</th>
                      <th>Night</th>
                      <th>Total</th>
                      <th>Avg Smarty Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="value">${checkInData?.morning || 0}</div>
                        <div class="comparison">${getComparisonText(checkInData?.morning || 0, prevCheckInData?.morning || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${checkInData?.night || 0}</div>
                        <div class="comparison">${getComparisonText(checkInData?.night || 0, prevCheckInData?.night || 0)}</div>
                      </td>
                      <td>
                        <div class="value" style="color: #29B6D2;">${checkInData?.total || 0}</div>
                        <div class="comparison">${getComparisonText(checkInData?.total || 0, prevCheckInData?.total || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${checkInData?.avgScore || 0}</div>
                        <div class="comparison">${getComparisonText(checkInData?.avgScore || 0, prevCheckInData?.avgScore || 0)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Smarty Tools Section -->
            <div class="section">
              <div class="section-header">🧮 Smarty Tools</div>
              <div class="section-content">
                <table>
                  <thead>
                    <tr>
                      <th>1RM Calculations</th>
                      <th>BMR Calculations</th>
                      <th>Macro Calculations</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="value">${calculatorData?.oneRM || 0}</div>
                        <div class="comparison">${getComparisonText(calculatorData?.oneRM || 0, prevCalculatorData?.oneRM || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${calculatorData?.bmr || 0}</div>
                        <div class="comparison">${getComparisonText(calculatorData?.bmr || 0, prevCalculatorData?.bmr || 0)}</div>
                      </td>
                      <td>
                        <div class="value">${calculatorData?.calories || 0}</div>
                        <div class="comparison">${getComparisonText(calculatorData?.calories || 0, prevCalculatorData?.calories || 0)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Measurements Section -->
            <div class="section">
              <div class="section-header">⚖️ Body Measurements</div>
              <div class="section-content">
                <table>
                  <thead>
                    <tr>
                      <th>Weight Logs</th>
                      <th>Body Fat Logs</th>
                      <th>Muscle Mass Logs</th>
                      <th>Total Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="value">${measurementData?.weightLogs || 0}</div>
                      </td>
                      <td>
                        <div class="value">${measurementData?.bodyFatLogs || 0}</div>
                      </td>
                      <td>
                        <div class="value">${measurementData?.muscleMassLogs || 0}</div>
                      </td>
                      <td>
                        <div class="value" style="color: #29B6D2;">${measurementData?.totalLogs || 0}</div>
                        <div class="comparison">${getComparisonText(measurementData?.totalLogs || 0, prevMeasurementData?.totalLogs || 0)}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                ${measurementData?.latestWeight || measurementData?.latestBodyFat || measurementData?.latestMuscleMass ? `
                  <div class="latest-values">
                    <h4>Latest Recorded Values</h4>
                    <div class="latest-grid">
                      ${measurementData?.latestWeight ? `
                        <div class="latest-item">
                          <div class="latest-value">${measurementData.latestWeight} kg</div>
                          <div class="latest-label">Weight</div>
                        </div>
                      ` : ''}
                      ${measurementData?.latestBodyFat ? `
                        <div class="latest-item">
                          <div class="latest-value">${measurementData.latestBodyFat}%</div>
                          <div class="latest-label">Body Fat</div>
                        </div>
                      ` : ''}
                      ${measurementData?.latestMuscleMass ? `
                        <div class="latest-item">
                          <div class="latest-value">${measurementData.latestMuscleMass} kg</div>
                          <div class="latest-label">Muscle Mass</div>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Summary Card -->
            <div class="summary-card">
              <h3>📊 Activity Summary</h3>
              <p>
                During ${getPeriodLabel()}, you completed <strong>${workoutData?.completed || 0} workouts</strong> 
                and <strong>${programData?.completed || 0} programs</strong>. 
                You logged <strong>${checkInData?.total || 0} check-ins</strong> with an average Smarty Score of <strong>${checkInData?.avgScore || 0}</strong>.
                ${(measurementData?.totalLogs || 0) > 0 ? `You also tracked <strong>${measurementData?.totalLogs} body measurements</strong>.` : ''}
                Keep up the great work!
              </p>
            </div>

            <div class="footer">
              <p>Generated on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
              <p class="brand">SmartyGym - Your Gym Re-imagined. Anywhere, Anytime.</p>
            </div>

            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 12px 24px; font-size: 16px; cursor: pointer; background: #29B6D2; color: white; border: none; border-radius: 8px;">
                Print / Save as PDF
              </button>
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Please allow popups to export");
        return;
      }

      printWindow.document.write(reportHtml);
      printWindow.document.close();
      toast.success("Report ready - click Print to save as PDF");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to generate report");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted rounded w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export LogBook
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="custom">Custom Period</SelectItem>
            </SelectContent>
          </Select>

          {timePeriod === "custom" && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[120px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate ? format(customStartDate, "MMM d") : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[120px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate ? format(customEndDate, "MMM d") : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <Button onClick={exportToPDF} disabled={exporting} variant="outline" className="w-full sm:w-auto">
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          Export as PDF
        </Button>
      </CardContent>
    </Card>
  );
};
