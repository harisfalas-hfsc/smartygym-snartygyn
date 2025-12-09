import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  XCircle, 
  Sun, 
  Moon, 
  Flame,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { CheckinRecord, CheckinStats } from '@/hooks/useCheckins';
import { useCheckInWindow } from '@/hooks/useCheckInWindow';

interface CheckInDashboardCardProps {
  todayCheckin: CheckinRecord | null;
  stats: CheckinStats | null;
  onOpenCheckins: () => void;
  onOpenMorning?: () => void;
  onOpenNight?: () => void;
}

export function CheckInDashboardCard({
  todayCheckin,
  stats,
  onOpenCheckins,
  onOpenMorning,
  onOpenNight
}: CheckInDashboardCardProps) {
  const windowStatus = useCheckInWindow();

  const getMorningStatus = () => {
    if (todayCheckin?.morning_completed) return 'done';
    if (windowStatus.isMorningWindow) return 'pending';
    const hour = windowStatus.currentTime.getHours();
    if (hour >= 9) return 'missed';
    return 'upcoming';
  };

  const getNightStatus = () => {
    if (todayCheckin?.night_completed) return 'done';
    if (windowStatus.isNightWindow) return 'pending';
    const hour = windowStatus.currentTime.getHours();
    if (hour >= 21) return 'missed';
    return 'upcoming';
  };

  const morningStatus = getMorningStatus();
  const nightStatus = getNightStatus();

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-amber-500 animate-pulse" />;
      case 'missed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const showMorningButton = windowStatus.isMorningWindow && !todayCheckin?.morning_completed;
  const showNightButton = windowStatus.isNightWindow && !todayCheckin?.night_completed;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Smarty Check-ins
          </span>
          {stats && stats.currentStreak > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-primary" />
              {stats.currentStreak} day streak
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Sun className="h-4 w-4 text-amber-500" />
            <span className="text-sm">Morning</span>
            <StatusIcon status={morningStatus} />
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Moon className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">Night</span>
            <StatusIcon status={nightStatus} />
          </div>
        </div>

        {/* Today's Score */}
        {todayCheckin?.daily_smarty_score !== null && todayCheckin?.daily_smarty_score !== undefined && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">Today's Score</span>
            <Badge className={getScoreColor(todayCheckin.daily_smarty_score)}>
              {todayCheckin.daily_smarty_score}/100
            </Badge>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {showMorningButton && onOpenMorning && (
            <Button 
              onClick={onOpenMorning}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              <Sun className="h-4 w-4 mr-2" />
              Complete Morning Check-in
            </Button>
          )}
          {showNightButton && onOpenNight && (
            <Button 
              onClick={onOpenNight}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Moon className="h-4 w-4 mr-2" />
              Complete Night Check-in
            </Button>
          )}
          <Button 
            onClick={onOpenCheckins}
            variant="outline"
            className="w-full"
          >
            View Check-ins
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}