import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

interface CompletionData {
  period: string;
  workoutRate: number;
  programRate: number;
  workoutCount: number;
  programCount: number;
}

export function CompletionAnalytics() {
  const [timeFilter, setTimeFilter] = useState("90");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<CompletionData[]>([]);
  const [overallWorkoutRate, setOverallWorkoutRate] = useState(0);
  const [overallProgramRate, setOverallProgramRate] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCompletionData();
  }, [timeFilter, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    return { startDate, endDate };
  };

  const fetchCompletionData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch workout interactions
      const { data: workoutInteractions } = await supabase
        .from("workout_interactions")
        .select("is_completed, created_at, updated_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Fetch program interactions
      const { data: programInteractions } = await supabase
        .from("program_interactions")
        .select("is_completed, created_at, updated_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      // Calculate overall rates
      const totalWorkouts = workoutInteractions?.length || 0;
      const completedWorkouts = workoutInteractions?.filter(w => w.is_completed).length || 0;
      const workoutRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

      const totalPrograms = programInteractions?.length || 0;
      const completedPrograms = programInteractions?.filter(p => p.is_completed).length || 0;
      const programRate = totalPrograms > 0 ? Math.round((completedPrograms / totalPrograms) * 100) : 0;

      setOverallWorkoutRate(workoutRate);
      setOverallProgramRate(programRate);

      // Group by month for trend chart
      const monthlyStats: { [key: string]: { workoutTotal: number; workoutCompleted: number; programTotal: number; programCompleted: number } } = {};

      workoutInteractions?.forEach(w => {
        const month = new Date(w.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { workoutTotal: 0, workoutCompleted: 0, programTotal: 0, programCompleted: 0 };
        }
        monthlyStats[month].workoutTotal++;
        if (w.is_completed) monthlyStats[month].workoutCompleted++;
      });

      programInteractions?.forEach(p => {
        const month = new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short" });
        if (!monthlyStats[month]) {
          monthlyStats[month] = { workoutTotal: 0, workoutCompleted: 0, programTotal: 0, programCompleted: 0 };
        }
        monthlyStats[month].programTotal++;
        if (p.is_completed) monthlyStats[month].programCompleted++;
      });

      const sortedMonths = Object.keys(monthlyStats).sort((a, b) => 
        new Date(a).getTime() - new Date(b).getTime()
      );

      const chartData: CompletionData[] = sortedMonths.map(period => {
        const stats = monthlyStats[period];
        return {
          period,
          workoutRate: stats.workoutTotal > 0 ? Math.round((stats.workoutCompleted / stats.workoutTotal) * 100) : 0,
          programRate: stats.programTotal > 0 ? Math.round((stats.programCompleted / stats.programTotal) * 100) : 0,
          workoutCount: stats.workoutCompleted,
          programCount: stats.programCompleted,
        };
      });

      setCompletionData(chartData);

    } catch (error) {
      console.error("Error fetching completion data:", error);
      toast.error("Failed to load completion data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `completion-analytics-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Chart exported!");
    } catch (error) {
      toast.error("Failed to export chart");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-lg">Loading completion analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workout Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{overallWorkoutRate}%</div>
            <p className="text-xs text-muted-foreground">Average across all workouts</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Program Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{overallProgramRate}%</div>
            <p className="text-xs text-muted-foreground">Average across all programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Completion Rate Trends</CardTitle>
          <CardDescription>Workouts vs Programs completion over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartFilterBar
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            customStartDate={customStartDate}
            onStartDateChange={setCustomStartDate}
            customEndDate={customEndDate}
            onEndDateChange={setCustomEndDate}
            onExport={handleExport}
          />

          {completionData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No completion data for selected period
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={completionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    formatter={(value) => `${value}%`}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="workoutRate" 
                    name="Workout Completion" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "#3B82F6" }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="programRate" 
                    name="Program Completion" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: "#10B981" }} 
                  />
                </LineChart>
              </ResponsiveContainer>

              {/* Detailed breakdown */}
              <div className="mt-4 space-y-2 border-t pt-4">
                {completionData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{item.period}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-blue-600">{item.workoutRate}% workouts</span>
                      <span className="text-green-600">{item.programRate}% programs</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Completed Counts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Completed Content</CardTitle>
          <CardDescription>Number of completions by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={completionData} barSize={15}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Bar dataKey="workoutCount" name="Workouts Completed" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="programCount" name="Programs Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
