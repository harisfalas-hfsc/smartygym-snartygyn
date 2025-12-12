import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

interface PopularItem {
  name: string;
  completions: number;
  views: number;
  favorites: number;
}

export function PopularAnalytics() {
  const [timeFilter, setTimeFilter] = useState("90");
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [contentFilter, setContentFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [workoutData, setWorkoutData] = useState<PopularItem[]>([]);
  const [programData, setProgramData] = useState<PopularItem[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPopularData();
  }, [timeFilter, customStartDate, customEndDate, contentFilter]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      return { startDate: customStartDate, endDate: customEndDate };
    }

    startDate.setDate(startDate.getDate() - parseInt(timeFilter));
    return { startDate, endDate };
  };

  const fetchPopularData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();

      // Fetch workout interactions
      if (contentFilter === "all" || contentFilter === "workouts") {
        const { data: workoutInteractions } = await supabase
          .from("workout_interactions")
          .select("workout_name, is_completed, is_favorite, has_viewed")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        const workoutStats: { [key: string]: PopularItem } = {};
        workoutInteractions?.forEach(w => {
          const name = w.workout_name.length > 25 ? w.workout_name.substring(0, 25) + "..." : w.workout_name;
          if (!workoutStats[name]) {
            workoutStats[name] = { name, completions: 0, views: 0, favorites: 0 };
          }
          if (w.is_completed) workoutStats[name].completions++;
          if (w.has_viewed) workoutStats[name].views++;
          if (w.is_favorite) workoutStats[name].favorites++;
        });

        const sortedWorkouts = Object.values(workoutStats)
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 10);

        setWorkoutData(sortedWorkouts);
      }

      // Fetch program interactions
      if (contentFilter === "all" || contentFilter === "programs") {
        const { data: programInteractions } = await supabase
          .from("program_interactions")
          .select("program_name, is_completed, is_favorite, has_viewed")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        const programStats: { [key: string]: PopularItem } = {};
        programInteractions?.forEach(p => {
          const name = p.program_name.length > 25 ? p.program_name.substring(0, 25) + "..." : p.program_name;
          if (!programStats[name]) {
            programStats[name] = { name, completions: 0, views: 0, favorites: 0 };
          }
          if (p.is_completed) programStats[name].completions++;
          if (p.has_viewed) programStats[name].views++;
          if (p.is_favorite) programStats[name].favorites++;
        });

        const sortedPrograms = Object.values(programStats)
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 10);

        setProgramData(sortedPrograms);
      }

    } catch (error) {
      console.error("Error fetching popular data:", error);
      toast.error("Failed to load popular content data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const canvas = await html2canvas(chartRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `popular-analytics-${new Date().toISOString().split("T")[0]}.png`;
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
        <div className="animate-pulse text-lg">Loading popular content...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={chartRef}>
      {/* Popular Workouts */}
      {(contentFilter === "all" || contentFilter === "workouts") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Most Popular Workouts</CardTitle>
            <CardDescription>Top 10 by completions, views, and favorites</CardDescription>
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
              additionalFilters={
                <Select value={contentFilter} onValueChange={setContentFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="workouts">Workouts Only</SelectItem>
                    <SelectItem value="programs">Programs Only</SelectItem>
                  </SelectContent>
                </Select>
              }
            />

            {workoutData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No workout data for selected period
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workoutData} layout="vertical" barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="completions" name="Completions" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="views" name="Views" fill="#10B981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="favorites" name="Favorites" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 space-y-1 border-t pt-3 max-h-[150px] overflow-y-auto">
                  {workoutData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">#{idx + 1} {item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600">{item.completions} done</span>
                        <span className="text-green-600">{item.views} views</span>
                        <span className="text-amber-600">{item.favorites} ♥</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Programs */}
      {(contentFilter === "all" || contentFilter === "programs") && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Most Popular Programs</CardTitle>
            <CardDescription>Top 10 by completions, views, and favorites</CardDescription>
          </CardHeader>
          <CardContent>
            {contentFilter !== "all" && (
              <ChartFilterBar
                timeFilter={timeFilter}
                onTimeFilterChange={setTimeFilter}
                customStartDate={customStartDate}
                onStartDateChange={setCustomStartDate}
                customEndDate={customEndDate}
                onEndDateChange={setCustomEndDate}
                onExport={handleExport}
                additionalFilters={
                  <Select value={contentFilter} onValueChange={setContentFilter}>
                    <SelectTrigger className="w-[130px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="workouts">Workouts Only</SelectItem>
                      <SelectItem value="programs">Programs Only</SelectItem>
                    </SelectContent>
                  </Select>
                }
              />
            )}

            {programData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No program data for selected period
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={programData} layout="vertical" barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="completions" name="Completions" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="views" name="Views" fill="#EC4899" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="favorites" name="Favorites" fill="#F97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-3 space-y-1 border-t pt-3 max-h-[150px] overflow-y-auto">
                  {programData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground font-medium">#{idx + 1} {item.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-purple-600">{item.completions} done</span>
                        <span className="text-pink-600">{item.views} views</span>
                        <span className="text-orange-600">{item.favorites} ♥</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
