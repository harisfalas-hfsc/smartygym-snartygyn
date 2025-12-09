import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CheckinRecord } from '@/hooks/useCheckins';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface CheckInChartsProps {
  checkins: CheckinRecord[];
}

type DateRange = '7' | '30' | '90';
type ChartType = 'score' | 'sleep' | 'hydration' | 'movement' | 'categories';

export function CheckInCharts({ checkins }: CheckInChartsProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [chartType, setChartType] = useState<ChartType>('score');

  const filteredCheckins = useMemo(() => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return checkins
      .filter(c => new Date(c.checkin_date) >= cutoffDate)
      .sort((a, b) => new Date(a.checkin_date).getTime() - new Date(b.checkin_date).getTime());
  }, [checkins, dateRange]);

  const chartData = useMemo(() => {
    return filteredCheckins.map(c => ({
      date: format(new Date(c.checkin_date), 'MMM d'),
      fullDate: c.checkin_date,
      score: c.daily_smarty_score,
      sleepHours: c.sleep_hours,
      sleepScore: c.sleep_score,
      hydration: c.hydration_liters,
      hydrationScore: c.hydration_score,
      movement: c.movement_score,
      protein: c.protein_score_norm,
      mood: c.mood_score,
      readiness: c.readiness_score_norm,
      strain: c.day_strain_score,
      soreness: c.soreness_score
    }));
  }, [filteredCheckins]);

  const renderChart = () => {
    switch (chartType) {
      case 'score':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
                name="Daily Score"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'sleep':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis yAxisId="hours" domain={[0, 12]} className="text-xs" />
              <YAxis yAxisId="score" orientation="right" domain={[0, 10]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sleepHours" 
                stroke="#f59e0b" 
                strokeWidth={2}
                yAxisId="hours"
                name="Hours"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="sleepScore" 
                stroke="#6366f1" 
                strokeWidth={2}
                yAxisId="score"
                name="Score"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'hydration':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 6]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="hydration" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
                name="Liters"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'movement':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 10]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="movement" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e' }}
                name="Movement Score"
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'categories':
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 10]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="sleepScore" stroke="#f59e0b" name="Sleep" connectNulls />
              <Line type="monotone" dataKey="hydrationScore" stroke="#0ea5e9" name="Hydration" connectNulls />
              <Line type="monotone" dataKey="protein" stroke="#8b5cf6" name="Protein" connectNulls />
              <Line type="monotone" dataKey="movement" stroke="#22c55e" name="Movement" connectNulls />
              <Line type="monotone" dataKey="mood" stroke="#ec4899" name="Mood" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Progress Charts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={dateRange === '7' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('7')}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === '30' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('30')}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === '90' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDateRange('90')}
          >
            90 Days
          </Button>
        </div>

        {/* Chart Type Selector */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={chartType === 'score' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('score')}
          >
            Daily Score
          </Button>
          <Button
            variant={chartType === 'sleep' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('sleep')}
          >
            Sleep
          </Button>
          <Button
            variant={chartType === 'hydration' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('hydration')}
          >
            Hydration
          </Button>
          <Button
            variant={chartType === 'movement' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('movement')}
          >
            Movement
          </Button>
          <Button
            variant={chartType === 'categories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setChartType('categories')}
          >
            All Categories
          </Button>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          renderChart()
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
}