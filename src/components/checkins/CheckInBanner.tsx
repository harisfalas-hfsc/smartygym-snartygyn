import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Clock, Flame } from 'lucide-react';

interface CheckInBannerProps {
  type: 'morning' | 'night';
  windowEnd: string;
  currentStreak?: number;
  onCheckIn: () => void;
}

export function CheckInBanner({
  type,
  windowEnd,
  currentStreak = 0,
  onCheckIn
}: CheckInBannerProps) {
  const isMorning = type === 'morning';

  return (
    <div className={`
      flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border
      ${isMorning ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' : 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/30 dark:border-indigo-800'}
    `}>
      <div className="flex items-center gap-3">
        {isMorning ? (
          <Sun className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
        )}
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {isMorning ? 'Morning' : 'Night'} check-in is open until {windowEnd}
          </span>
          {currentStreak > 0 && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Flame className="h-3 w-3 text-primary" />
              {currentStreak} day streak - don't break it!
            </span>
          )}
        </div>
      </div>
      
      <Button 
        onClick={onCheckIn}
        size="sm"
        className={`
          shrink-0
          ${isMorning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}
        `}
      >
        <Clock className="h-4 w-4 mr-2" />
        Check-in now
      </Button>
    </div>
  );
}