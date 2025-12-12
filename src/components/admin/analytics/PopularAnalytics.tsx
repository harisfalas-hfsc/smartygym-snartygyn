import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ChartFilterBar } from "./ChartFilterBar";
import html2canvas from "html2canvas";

interface PopularItem {
  name: string;
  fullName: string;
  completions: number;
  views: number;
  favorites: number;
  rating: number;
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
          .select("workout_name, is_completed, is_favorite, has_viewed, rating")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        const workoutStats: { [key: string]: PopularItem & { ratingSum: number; ratingCount: number } } = {};
        workoutInteractions?.forEach(w => {
          const fullName = w.workout_name;
          const name = fullName.length > 25 ? fullName.substring(0, 25) + "..." : fullName;
          if (!workoutStats[fullName]) {
            workoutStats[fullName] = { name, fullName, completions: 0, views: 0, favorites: 0, rating: 0, ratingSum: 0, ratingCount: 0 };
          }
          if (w.is_completed) workoutStats[fullName].completions++;
          if (w.has_viewed) workoutStats[fullName].views++;
          if (w.is_favorite) workoutStats[fullName].favorites++;
          if (w.rating) {
            workoutStats[fullName].ratingSum += w.rating;
            workoutStats[fullName].ratingCount++;
          }
        });

        const sortedWorkouts = Object.values(workoutStats)
          .map(w => ({
            ...w,
            rating: w.ratingCount > 0 ? Math.round((w.ratingSum / w.ratingCount) * 10) / 10 : 0
          }))
          .sort((a, b) => b.completions - a.completions)
          .slice(0, 10);

        setWorkoutData(sortedWorkouts);
      }

      // Fetch program interactions
      if (contentFilter === "all" || contentFilter === "programs") {
        const { data: programInteractions } = await supabase
          .from("program_interactions")
          .select("program_name, is_completed, is_favorite, has_viewed, rating")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        const programStats: { [key: string]: PopularItem & { ratingSum: number; ratingCount: number } } = {};
        programInteractions?.forEach(p => {
          const fullName = p.program_name;
          const name = fullName.length > 25 ? fullName.substring(0, 25) + "..." : fullName;
          if (!programStats[fullName]) {
            programStats[fullName] = { name, fullName, completions: 0, views: 0, favorites: 0, rating: 0, ratingSum: 0, ratingCount: 0 };
          }
          if (p.is_completed) programStats[fullName].completions++;
          if (p.has_viewed) programStats[fullName].views++;
          if (p.is_favorite) programStats[fullName].favorites++;
          if (p.rating) {
            programStats[fullName].ratingSum += p.rating;
            programStats[fullName].ratingCount++;
          }
        });

        const sortedPrograms = Object.values(programStats)
          .map(p => ({
            ...p,
            rating: p.ratingCount > 0 ? Math.round((p.ratingSum / p.ratingCount) * 10) / 10 : 0
          }))
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

  const exportAsCSV = (data: PopularItem[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["Rank", "Name", "Completions", "Views", "Favorites", "Avg Rating"];
    const csvContent = [
      headers.join(','),
      ...data.map((row, idx) => 
        [idx + 1, `"${row.fullName}"`, row.completions, row.views, row.favorites, row.rating].join(',')
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Most Popular Workouts</CardTitle>
                <CardDescription>Top 10 by completions, views, and favorites</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportAsCSV(workoutData, 'popular-workouts')}>
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
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={workoutData} layout="vertical" barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="completions" name="Completions" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="views" name="Views" fill="#10B981" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="favorites" name="Favorites" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed Data Table */}
                <div className="mt-4 border-t pt-4">
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-2 px-2 font-medium">#</th>
                          <th className="text-left py-2 px-2 font-medium">Workout Name</th>
                          <th className="text-right py-2 px-2 font-medium">Completions</th>
                          <th className="text-right py-2 px-2 font-medium">Views</th>
                          <th className="text-right py-2 px-2 font-medium">Favorites</th>
                          <th className="text-right py-2 px-2 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workoutData.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-1.5 px-2 font-medium text-muted-foreground">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-medium truncate max-w-[200px]" title={item.fullName}>{item.name}</td>
                            <td className="text-right py-1.5 px-2 text-blue-600 font-medium">{item.completions}</td>
                            <td className="text-right py-1.5 px-2 text-green-600">{item.views}</td>
                            <td className="text-right py-1.5 px-2 text-amber-600">{item.favorites}</td>
                            <td className="text-right py-1.5 px-2">{item.rating > 0 ? `${item.rating}/5` : '-'}</td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-muted/50 font-medium">
                          <td className="py-2 px-2"></td>
                          <td className="py-2 px-2">Total</td>
                          <td className="text-right py-2 px-2 text-blue-600">{workoutData.reduce((sum, d) => sum + d.completions, 0)}</td>
                          <td className="text-right py-2 px-2 text-green-600">{workoutData.reduce((sum, d) => sum + d.views, 0)}</td>
                          <td className="text-right py-2 px-2 text-amber-600">{workoutData.reduce((sum, d) => sum + d.favorites, 0)}</td>
                          <td className="text-right py-2 px-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Most Popular Programs</CardTitle>
                <CardDescription>Top 10 by completions, views, and favorites</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => exportAsCSV(programData, 'popular-programs')}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </div>
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
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={programData} layout="vertical" barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 9 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Legend />
                    <Bar dataKey="completions" name="Completions" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="views" name="Views" fill="#EC4899" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="favorites" name="Favorites" fill="#F97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed Data Table */}
                <div className="mt-4 border-t pt-4">
                  <div className="max-h-[200px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background">
                        <tr className="border-b bg-muted/50">
                          <th className="text-left py-2 px-2 font-medium">#</th>
                          <th className="text-left py-2 px-2 font-medium">Program Name</th>
                          <th className="text-right py-2 px-2 font-medium">Completions</th>
                          <th className="text-right py-2 px-2 font-medium">Views</th>
                          <th className="text-right py-2 px-2 font-medium">Favorites</th>
                          <th className="text-right py-2 px-2 font-medium">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programData.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-1.5 px-2 font-medium text-muted-foreground">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-medium truncate max-w-[200px]" title={item.fullName}>{item.name}</td>
                            <td className="text-right py-1.5 px-2 text-purple-600 font-medium">{item.completions}</td>
                            <td className="text-right py-1.5 px-2 text-pink-600">{item.views}</td>
                            <td className="text-right py-1.5 px-2 text-orange-600">{item.favorites}</td>
                            <td className="text-right py-1.5 px-2">{item.rating > 0 ? `${item.rating}/5` : '-'}</td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-muted/50 font-medium">
                          <td className="py-2 px-2"></td>
                          <td className="py-2 px-2">Total</td>
                          <td className="text-right py-2 px-2 text-purple-600">{programData.reduce((sum, d) => sum + d.completions, 0)}</td>
                          <td className="text-right py-2 px-2 text-pink-600">{programData.reduce((sum, d) => sum + d.views, 0)}</td>
                          <td className="text-right py-2 px-2 text-orange-600">{programData.reduce((sum, d) => sum + d.favorites, 0)}</td>
                          <td className="text-right py-2 px-2">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
