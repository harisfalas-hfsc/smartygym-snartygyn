import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAdvancedActivityLog } from "@/hooks/useAdvancedActivityLog";
import { cn } from "@/lib/utils";

interface LogBookAdvancedChartsProps {
  userId: string;
  primaryFilter: string;
  onPrimaryFilterChange: (filter: string) => void;
  secondaryFilter: string;
  onSecondaryFilterChange: (filter: string) => void;
  timeFilter: 'last_month' | 'last_12_months' | 'last_6_months' | 'custom';
  onTimeFilterChange: (filter: 'last_month' | 'last_12_months' | 'last_6_months' | 'custom') => void;
  customStartDate?: Date;
  onCustomStartDateChange: (date?: Date) => void;
  customEndDate?: Date;
  onCustomEndDateChange: (date?: Date) => void;
}

const CHART_COLORS = {
  workout: 'hsl(217, 91%, 60%)',
  program: 'hsl(142, 76%, 36%)',
  tool: 'hsl(24, 95%, 53%)',
  measurement: 'hsl(280, 100%, 70%)',
  personal_training: 'hsl(340, 75%, 55%)',
  checkin: 'hsl(172, 66%, 50%)',
  completed: 'hsl(142, 76%, 36%)',
  viewed: 'hsl(217, 91%, 60%)',
  favorites: 'hsl(45, 93%, 47%)',
  rated: 'hsl(280, 100%, 70%)',
  ongoing: 'hsl(24, 95%, 53%)',
};

const SECONDARY_FILTERS = {
  all: [],
  workout: [
    { value: 'all', label: 'All Workouts' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'completed', label: 'Completed' },
    { value: 'rated', label: 'Rated' },
  ],
  program: [
    { value: 'all', label: 'All Programs' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'ongoing', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'rated', label: 'Rated' },
  ],
  tool: [
    { value: 'all', label: 'All Tools' },
    { value: '1RM', label: '1RM Calculator' },
    { value: 'BMR', label: 'BMR Calculator' },
    { value: 'Macro', label: 'Macro Calculator' },
  ],
  measurement: [
    { value: 'all', label: 'All Measurements' },
    { value: 'weight', label: 'Weight' },
    { value: 'body_fat', label: 'Body Fat %' },
    { value: 'measurements', label: 'Body Measurements' },
  ],
  checkin: [
    { value: 'all', label: 'All Check-ins' },
    { value: 'morning', label: 'Morning Check-ins' },
    { value: 'night', label: 'Night Check-ins' },
  ],
};

export const LogBookAdvancedCharts = ({ 
  userId, 
  primaryFilter,
  onPrimaryFilterChange,
  secondaryFilter,
  onSecondaryFilterChange,
  timeFilter,
  onTimeFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange
}: LogBookAdvancedChartsProps) => {

  const { lineChartData, pieChartData, isLoading } = useAdvancedActivityLog(
    userId,
    primaryFilter,
    secondaryFilter,
    timeFilter,
    customStartDate,
    customEndDate
  );

  const getSecondaryFilters = () => {
    return SECONDARY_FILTERS[primaryFilter as keyof typeof SECONDARY_FILTERS] || [];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.fill }}>
            Count: {payload[0].value}
          </p>
          <p className="text-muted-foreground">
            {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4 flex-wrap">
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex gap-4 flex-wrap items-center">
        {/* Primary Filter */}
        <Select value={primaryFilter} onValueChange={onPrimaryFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="workout">Workouts</SelectItem>
            <SelectItem value="program">Training Programs</SelectItem>
            <SelectItem value="tool">Tools</SelectItem>
            <SelectItem value="measurement">Measurements</SelectItem>
            <SelectItem value="checkin">Check-ins</SelectItem>
          </SelectContent>
        </Select>

        {/* Secondary Filter */}
        {getSecondaryFilters().length > 0 && (
          <Select value={secondaryFilter} onValueChange={onSecondaryFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              {getSecondaryFilters().map((filter) => (
                <SelectItem key={filter.value} value={filter.value}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Time Filter */}
        <Select value={timeFilter} onValueChange={(value: any) => onTimeFilterChange(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Last 12 Weeks</SelectItem>
            <SelectItem value="monthly">Last 6 Months</SelectItem>
            <SelectItem value="custom">Custom Period</SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range */}
        {timeFilter === 'custom' && (
          <>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-48 justify-start text-left font-normal", !customStartDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStartDate ? format(customStartDate, "PPP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={customStartDate} onSelect={onCustomStartDateChange} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-48 justify-start text-left font-normal", !customEndDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEndDate ? format(customEndDate, "PPP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={customEndDate} onSelect={onCustomEndDateChange} initialFocus />
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(lineChartData[0] || {}).filter(key => key !== 'name').map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
