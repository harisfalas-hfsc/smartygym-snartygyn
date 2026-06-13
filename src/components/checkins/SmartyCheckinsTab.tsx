import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Moon, 
  Calendar, 
  TrendingUp, 
  Trophy,
  Download,
  Flame,
  CheckCircle2,
  Circle,
  XCircle
} from 'lucide-react';
import { useCheckins } from '@/hooks/useCheckins';
import { useCheckInWindow } from '@/hooks/useCheckInWindow';
import { MorningCheckInForm } from './MorningCheckInForm';
import { NightCheckInForm } from './NightCheckInForm';
import { CheckInHistory } from './CheckInHistory';
import { CheckInCharts } from './CheckInCharts';
import { CheckInBadges } from './CheckInBadges';
import { CheckInExport } from './CheckInExport';
import { CheckInFeedback } from './CheckInFeedback';

export function SmartyCheckinsTab() {
  const [activeTab, setActiveTab] = useState('today');
  const chartRef = useRef<HTMLDivElement>(null);
  
  const { 
    todayCheckin, 
    checkins, 
    badges, 
    stats, 
    loading,
    submitMorningCheckin,
    submitNightCheckin 
  } = useCheckins();
  
  const windowStatus = useCheckInWindow();

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'bg-muted text-muted-foreground';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

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

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'missed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const morningStatus = getMorningStatus();
  const nightStatus = getNightStatus();

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground truncate">Current Streak</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats?.currentStreak || 0} days</p>
        </Card>
        <Card className="p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground truncate">Best Streak</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats?.bestStreak || 0} days</p>
        </Card>
        <Card className="p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground truncate">Avg Score</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats?.averageScore || 0}</p>
        </Card>
        <Card className="p-3 sm:p-4 overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground truncate">Completion</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats?.completionRate || 0}%</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-5 h-auto p-1">
          <TabsTrigger value="today" className="text-xs sm:text-sm px-1 sm:px-3 py-2 flex items-center justify-center gap-0.5 sm:gap-1">
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Today</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm px-1 sm:px-3 py-2 flex items-center justify-center gap-0.5 sm:gap-1">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
          <TabsTrigger value="graphs" className="text-xs sm:text-sm px-1 sm:px-3 py-2 flex items-center justify-center gap-0.5 sm:gap-1">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Graphs</span>
          </TabsTrigger>
          <TabsTrigger value="badges" className="text-xs sm:text-sm px-1 sm:px-3 py-2 flex items-center justify-center gap-0.5 sm:gap-1">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Badges</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="text-xs sm:text-sm px-1 sm:px-3 py-2 flex items-center justify-center gap-0.5 sm:gap-1">
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Today's Status */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">Today's Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Sun className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Morning Check-in</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {windowStatus.morningWindowStart} - {windowStatus.morningWindowEnd}
                      </p>
                    </div>
                  </div>
                  <StatusIcon status={morningStatus} />
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Moon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base">Night Check-in</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {windowStatus.nightWindowStart} - {windowStatus.nightWindowEnd}
                      </p>
                    </div>
                  </div>
                  <StatusIcon status={nightStatus} />
                </div>

                {todayCheckin?.daily_smarty_score !== null && todayCheckin?.daily_smarty_score !== undefined && (
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground mb-1">Today's Score</p>
                    <p className="text-3xl sm:text-4xl font-bold">{todayCheckin.daily_smarty_score}</p>
                    <Badge className={`mt-2 ${getScoreColor(todayCheckin.daily_smarty_score)}`}>
                      {todayCheckin.score_category === 'green' ? 'Excellent' :
                       todayCheckin.score_category === 'yellow' ? 'Good' :
                       todayCheckin.score_category === 'orange' ? 'Below Target' : 'Poor'}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Form or Completed Message */}
            <div className="space-y-6">
              {/* Morning Form */}
              {morningStatus === 'pending' && !todayCheckin?.morning_completed && (
                <MorningCheckInForm
                  onSubmit={submitMorningCheckin}
                  isWindowOpen={windowStatus.isMorningWindow}
                  windowEnd={windowStatus.morningWindowEnd}
                  isCompleted={todayCheckin?.morning_completed}
                />
              )}
              
              {/* Night Form */}
              {nightStatus === 'pending' && !todayCheckin?.night_completed && (
                <NightCheckInForm
                  onSubmit={submitNightCheckin}
                  isWindowOpen={windowStatus.isNightWindow}
                  windowEnd={windowStatus.nightWindowEnd}
                  isCompleted={todayCheckin?.night_completed}
                />
              )}

              {/* Both completed */}
              {todayCheckin?.morning_completed && todayCheckin?.night_completed && (
                <Card className="border-green-200 dark:border-green-800 overflow-hidden">
                  <CardContent className="py-8 text-center">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
                    <p className="font-medium text-lg">All done for today!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Great job completing both check-ins.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Waiting for next window */}
              {!windowStatus.isMorningWindow && !windowStatus.isNightWindow && 
               (!todayCheckin?.morning_completed || !todayCheckin?.night_completed) && (
                <Card className="overflow-hidden">
                  <CardContent className="py-6 text-center">
                    <p className="text-muted-foreground">
                      Next check-in window: <strong className="text-foreground capitalize">{windowStatus.nextWindow}</strong>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Opens in {windowStatus.timeUntilNextWindow}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Weekly Feedback */}
          <div className="mt-6">
            <CheckInFeedback checkins={checkins} />
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <CheckInHistory checkins={checkins} />
        </TabsContent>

        <TabsContent value="graphs" className="mt-6">
          <div ref={chartRef}>
            <CheckInCharts checkins={checkins} />
          </div>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <CheckInBadges badges={badges} stats={stats} />
        </TabsContent>

        <TabsContent value="export" className="mt-6">
          <CheckInExport checkins={checkins} chartRef={chartRef} />
        </TabsContent>
      </Tabs>
    </div>
  );
}