import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Sun, Loader2 } from 'lucide-react';
import { MorningCheckinData } from '@/hooks/useCheckins';

interface MorningCheckInFormProps {
  onSubmit: (data: MorningCheckinData) => Promise<boolean>;
  isWindowOpen: boolean;
  windowEnd: string;
}

const sleepQualityEmojis = [
  { value: 1, emoji: '😫', label: 'Very poor' },
  { value: 2, emoji: '😟', label: 'Poor' },
  { value: 3, emoji: '😐', label: 'Average' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😴', label: 'Excellent' }
];

const moodEmojis = [
  { value: 1, emoji: '😰', label: 'Very stressed' },
  { value: 2, emoji: '😔', label: 'Low' },
  { value: 3, emoji: '😐', label: 'Neutral' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😁', label: 'Very positive' }
];

const readinessLabels: Record<number, string> = {
  0: 'Exhausted', 1: 'Exhausted', 2: 'Exhausted',
  3: 'Very tired', 4: 'Very tired',
  5: 'OK', 6: 'OK',
  7: 'Good', 8: 'Good',
  9: 'On fire!', 10: 'On fire!'
};

const sorenessLabels: Record<number, string> = {
  0: 'No soreness', 1: 'No soreness', 2: 'No soreness',
  3: 'Mild', 4: 'Mild',
  5: 'Noticeable', 6: 'Noticeable',
  7: 'Very sore', 8: 'Very sore',
  9: 'Painful', 10: 'Painful'
};

export function MorningCheckInForm({ 
  onSubmit, 
  isWindowOpen,
  windowEnd 
}: MorningCheckInFormProps) {
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [sleepQuality, setSleepQuality] = useState<number>(3);
  const [readinessScore, setReadinessScore] = useState<number>(5);
  const [sorenessRating, setSorenessRating] = useState<number>(3);
  const [moodRating, setMoodRating] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({
      sleep_hours: sleepHours,
      sleep_quality: sleepQuality,
      readiness_score: readinessScore,
      soreness_rating: sorenessRating,
      mood_rating: moodRating
    });
    setSubmitting(false);
  };

  if (!isWindowOpen) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="py-8 text-center">
          <Sun className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            The morning check-in window is closed.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Come back tomorrow between 07:00 and 09:00.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          Morning Check-in
        </CardTitle>
        <CardDescription>
          Window open until {windowEnd}. Takes 30 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sleep Duration */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            How many hours did you sleep last night?
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[sleepHours]}
              onValueChange={([val]) => setSleepHours(val)}
              min={3}
              max={10}
              step={0.5}
              className="flex-1"
            />
            <span className="w-16 text-center font-semibold text-lg">
              {sleepHours}h
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3h</span>
            <span>10h</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            How was your sleep quality?
          </label>
          <div className="flex justify-between gap-2">
            {sleepQualityEmojis.map(({ value, emoji, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSleepQuality(value)}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-all flex-1
                  ${sleepQuality === value 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                    : 'bg-muted hover:bg-muted/80'}
                `}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs mt-1 hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Readiness */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            How ready do you feel for today?
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[readinessScore]}
              onValueChange={([val]) => setReadinessScore(val)}
              min={0}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="w-20 text-center text-sm font-medium">
              {readinessLabels[readinessScore]}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        {/* Soreness */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            How does your body feel this morning?
          </label>
          <div className="flex items-center gap-4">
            <Slider
              value={[sorenessRating]}
              onValueChange={([val]) => setSorenessRating(val)}
              min={0}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="w-20 text-center text-sm font-medium">
              {sorenessLabels[sorenessRating]}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>No soreness</span>
            <span>Very sore</span>
          </div>
        </div>

        {/* Mood */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            How is your mood right now?
          </label>
          <div className="flex justify-between gap-2">
            {moodEmojis.map(({ value, emoji, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMoodRating(value)}
                className={`
                  flex flex-col items-center p-2 rounded-lg transition-all flex-1
                  ${moodRating === value 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                    : 'bg-muted hover:bg-muted/80'}
                `}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs mt-1 hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Complete Morning Check-in'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}