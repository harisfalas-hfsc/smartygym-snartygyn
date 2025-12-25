import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

interface CompletionData {
  period: string;
  workoutRate: number;
  programRate: number;
  workoutCount: number;
  programCount: number;
  workoutTotal: number;
  programTotal: number;
}

export function CompletionAnalytics() {
  const [timeFilter, setTimeFilter] = useState("90");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState<CompletionData[]>([]);
  const [overallWorkoutRate, setOverallWorkoutRate] = useState(0);
  const [overallProgramRate, setOverallProgramRate] = useState(0);
  const [totalWorkoutInteractions, setTotalWorkoutInteractions] = useState(0);
  const [totalProgramInteractions, setTotalProgramInteractions] = useState(0);
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
      setTotalWorkoutInteractions(totalWorkouts);
      setTotalProgramInteractions(totalPrograms);

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
          workoutTotal: stats.workoutTotal,
          programTotal: stats.programTotal,
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

  const exportTableAsCSV = (filename: string) => {
    if (completionData.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Period", "Workout Rate %", "Program Rate %", "Workouts Completed", "Programs Completed", "Total Workout Interactions", "Total Program Interactions"];
    const csvContent = [
      headers.join(','),
      ...completionData.map(row => 
        [row.period, row.workoutRate, row.programRate, row.workoutCount, row.programCount, row.workoutTotal, row.programTotal].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV!");
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Workout Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallWorkoutRate}%</div>
            <p className="text-xs text-muted-foreground">Average across all workouts</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30 dark:bg-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Program Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{overallProgramRate}%</div>
            <p className="text-xs text-muted-foreground">Average across all programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Workout Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWorkoutInteractions}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Program Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalProgramInteractions}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trends */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Completion Rate Trends</CardTitle>
              <CardDescription>Workouts vs Programs completion over time</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportTableAsCSV('completion-rates')}>
              <Download className="h-3 w-3 mr-1" /> Export CSV
            </Button>
          </div>
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

              {/* Detailed Data Table */}
              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Detailed Breakdown</span>
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b bg-muted/50">
                        <th className="text-left py-2 px-2 font-medium">Period</th>
                        <th className="text-right py-2 px-2 font-medium">Workout Rate</th>
                        <th className="text-right py-2 px-2 font-medium">Program Rate</th>
                        <th className="text-right py-2 px-2 font-medium">Workouts Done</th>
                        <th className="text-right py-2 px-2 font-medium">Programs Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completionData.map((item, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-1.5 px-2 font-medium">{item.period}</td>
                          <td className="text-right py-1.5 px-2">
                            <span className={item.workoutRate >= 50 ? "text-blue-600 font-medium" : "text-muted-foreground"}>
                              {item.workoutRate}%
                            </span>
                          </td>
                          <td className="text-right py-1.5 px-2">
                            <span className={item.programRate >= 50 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                              {item.programRate}%
                            </span>
                          </td>
                          <td className="text-right py-1.5 px-2">{item.workoutCount}/{item.workoutTotal}</td>
                          <td className="text-right py-1.5 px-2">{item.programCount}/{item.programTotal}</td>
                        </tr>
                      ))}
                      {/* Totals Row */}
                      <tr className="bg-muted/50 font-medium">
                        <td className="py-2 px-2">Total</td>
                        <td className="text-right py-2 px-2 text-blue-600">{overallWorkoutRate}%</td>
                        <td className="text-right py-2 px-2 text-green-600">{overallProgramRate}%</td>
                        <td className="text-right py-2 px-2">{completionData.reduce((sum, d) => sum + d.workoutCount, 0)}</td>
                        <td className="text-right py-2 px-2">{completionData.reduce((sum, d) => sum + d.programCount, 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Completed Counts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Completed Content Volume</CardTitle>
          <CardDescription>Number of completions by type over time</CardDescription>
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
