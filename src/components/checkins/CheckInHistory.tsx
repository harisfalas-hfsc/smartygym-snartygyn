import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckinRecord } from '@/hooks/useCheckins';
import { 
  Calendar as CalendarIcon, 
  List,
  CheckCircle2,
  Circle,
  XCircle,
  Sun,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';

interface CheckInHistoryProps {
  checkins: CheckinRecord[];
}

export function CheckInHistory({ checkins }: CheckInHistoryProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [detailCheckin, setDetailCheckin] = useState<CheckinRecord | null>(null);

  const getCheckinForDate = (date: Date): CheckinRecord | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return checkins.find(c => c.checkin_date === dateStr);
  };

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return 'bg-muted';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (category: string | null) => {
    switch (category) {
      case 'green': return 'Excellent';
      case 'yellow': return 'Good';
      case 'orange': return 'Below target';
      case 'red': return 'Poor';
      default: return 'Incomplete';
    }
  };

  const StatusIcon = ({ completed, missed }: { completed: boolean; missed?: boolean }) => {
    if (completed) return <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />;
    if (missed) return <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
    return <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
  };

  const modifiers = {
    complete: checkins
      .filter(c => c.status === 'complete')
      .map(c => new Date(c.checkin_date)),
    partial: checkins
      .filter(c => c.status === 'incomplete_morning_only' || c.status === 'incomplete_night_only')
      .map(c => new Date(c.checkin_date)),
    missed: checkins
      .filter(c => c.status === 'missed')
      .map(c => new Date(c.checkin_date))
  };

  const modifiersStyles = {
    complete: {
      backgroundColor: 'hsl(var(--primary) / 0.2)',
      borderRadius: '50%'
    },
    partial: {
      backgroundColor: 'hsl(45 93% 47% / 0.2)',
      borderRadius: '50%'
    },
    missed: {
      backgroundColor: 'hsl(var(--destructive) / 0.2)',
      borderRadius: '50%'
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const checkin = getCheckinForDate(date);
      if (checkin) {
        setDetailCheckin(checkin);
      }
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 px-4 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CalendarIcon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Check-in History</span>
            </CardTitle>
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="h-8 w-8 p-0"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {viewMode === 'calendar' ? (
            <div className="flex justify-center overflow-x-auto">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
                className="rounded-md border"
              />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {checkins.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No check-ins yet. Complete your first check-in!
                </p>
              ) : (
                checkins.map((checkin) => (
                  <button
                    key={checkin.id}
                    onClick={() => setDetailCheckin(checkin)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getScoreBadgeClass(checkin.daily_smarty_score)}`} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">
                          {format(new Date(checkin.checkin_date), 'EEE, MMM d')}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Sun className="h-3 w-3 flex-shrink-0" />
                          <StatusIcon completed={checkin.morning_completed} />
                          <Moon className="h-3 w-3 ml-1 flex-shrink-0" />
                          <StatusIcon completed={checkin.night_completed} />
                        </div>
                      </div>
                    </div>
                    {checkin.daily_smarty_score !== null && (
                      <Badge className={`flex-shrink-0 ${getScoreBadgeClass(checkin.daily_smarty_score)}`}>
                        {checkin.daily_smarty_score}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary/20 flex-shrink-0" />
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500/20 flex-shrink-0" />
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-destructive/20 flex-shrink-0" />
              <span>Missed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!detailCheckin} onOpenChange={() => setDetailCheckin(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {detailCheckin && format(new Date(detailCheckin.checkin_date), 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>
          
          {detailCheckin && (
            <div className="space-y-6">
              {/* Daily Score */}
              {detailCheckin.daily_smarty_score !== null && (
                <div className="text-center p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Daily Smarty Score</p>
                  <p className="text-3xl sm:text-4xl font-bold">{detailCheckin.daily_smarty_score}</p>
                  <Badge className={`mt-2 ${getScoreBadgeClass(detailCheckin.daily_smarty_score)}`}>
                    {getScoreLabel(detailCheckin.score_category)}
                  </Badge>
                </div>
              )}

              {/* Morning Data */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Sun className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  Morning Check-in
                  <StatusIcon completed={detailCheckin.morning_completed} />
                </h4>
                {detailCheckin.morning_completed ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Sleep:</span>{' '}
                      <span className="font-medium">{detailCheckin.sleep_hours}h</span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Quality:</span>{' '}
                      <span className="font-medium">{detailCheckin.sleep_quality}/5</span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Readiness:</span>{' '}
                      <span className="font-medium">{detailCheckin.readiness_score}/10</span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Soreness:</span>{' '}
                      <span className="font-medium">{detailCheckin.soreness_rating}/10</span>
                    </div>
                    <div className="p-2 rounded bg-muted col-span-2">
                      <span className="text-muted-foreground">Mood:</span>{' '}
                      <span className="font-medium">{detailCheckin.mood_rating}/5</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not completed</p>
                )}
              </div>

              {/* Night Data */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                  <Moon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  Night Check-in
                  <StatusIcon completed={detailCheckin.night_completed} />
                </h4>
                {detailCheckin.night_completed ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Steps:</span>{' '}
                      <span className="font-medium">
                        {detailCheckin.steps_value || `Bucket ${detailCheckin.steps_bucket}`}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Water:</span>{' '}
                      <span className="font-medium">{detailCheckin.hydration_liters}L</span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Protein:</span>{' '}
                      <span className="font-medium">{detailCheckin.protein_level}/4</span>
                    </div>
                    <div className="p-2 rounded bg-muted">
                      <span className="text-muted-foreground">Strain:</span>{' '}
                      <span className="font-medium">{detailCheckin.day_strain}/10</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not completed</p>
                )}
              </div>

              {/* Sub-scores */}
              {detailCheckin.status === 'complete' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Category Scores</h4>
                  <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-sm">
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Sleep</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.sleep_score}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Ready</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.readiness_score_norm}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Move</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.movement_score}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Hydrate</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.hydration_score}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Protein</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.protein_score_norm}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Mood</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.mood_score}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Strain</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.day_strain_score}</p>
                    </div>
                    <div className="text-center p-1.5 sm:p-2 rounded bg-muted">
                      <p className="text-muted-foreground text-[10px] sm:text-xs">Sore</p>
                      <p className="font-bold text-sm sm:text-base">{detailCheckin.soreness_score}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}