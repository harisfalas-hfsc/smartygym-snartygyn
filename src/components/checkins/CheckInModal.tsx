import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Flame } from 'lucide-react';

interface CheckInModalProps {
  type: 'morning' | 'night';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoItNow: () => void;
  onLater: () => void;
  currentStreak?: number;
}

export function CheckInModal({
  type,
  open,
  onOpenChange,
  onDoItNow,
  onLater,
  currentStreak = 0
}: CheckInModalProps) {
  const isMorning = type === 'morning';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isMorning ? (
              <Sun className="h-6 w-6 text-amber-500" />
            ) : (
              <Moon className="h-6 w-6 text-indigo-500" />
            )}
            {isMorning ? 'Morning' : 'Night'} Smarty Check-in
          </DialogTitle>
          <DialogDescription className="pt-2">
            {isMorning 
              ? "Takes 30 seconds. Start your day with intention."
              : "Review your day in 30 seconds and keep your score on track."
            }
          </DialogDescription>
        </DialogHeader>
        
        {currentStreak > 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-primary/10 rounded-lg">
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              {currentStreak} day streak! Don't break it.
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={onDoItNow} size="lg" className="w-full">
            Do it now
          </Button>
          <Button 
            onClick={onLater} 
            variant="outline" 
            size="lg" 
            className="w-full"
          >
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}