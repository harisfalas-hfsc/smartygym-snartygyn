import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Moon, Loader2 } from 'lucide-react';
import { NightCheckinData } from '@/hooks/useCheckins';

interface NightCheckInFormProps {
  onSubmit: (data: NightCheckinData) => Promise<boolean>;
  isWindowOpen: boolean;
  windowEnd: string;
}

const stepBuckets = [
  { value: 1, label: '0-2k', description: '0 - 1,999 steps' },
  { value: 2, label: '2-5k', description: '2,000 - 4,999 steps' },
  { value: 3, label: '5-8k', description: '5,000 - 7,999 steps' },
  { value: 4, label: '8-10k', description: '8,000 - 9,999 steps' },
  { value: 5, label: '10k+', description: '10,000+ steps' }
];

const hydrationQuickButtons = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

const proteinLevels = [
  { value: 0, emoji: '🔴', label: 'Way below' },
  { value: 1, emoji: '🟠', label: 'Some' },
  { value: 2, emoji: '🟡', label: 'Close' },
  { value: 3, emoji: '🟢', label: 'Hit target' },
  { value: 4, emoji: '💪', label: 'Exceeded' }
];

const strainLabels: Record<number, string> = {
  0: 'Very easy', 1: 'Very easy', 2: 'Very easy',
  3: 'Light', 4: 'Light',
  5: 'Moderate', 6: 'Moderate', 7: 'Moderate',
  8: 'Hard', 9: 'Hard', 10: 'Brutal'
};

export function NightCheckInForm({ 
  onSubmit, 
  isWindowOpen,
  windowEnd 
}: NightCheckInFormProps) {
  const [stepsBucket, setStepsBucket] = useState<number>(3);
  const [hydrationLiters, setHydrationLiters] = useState<number>(2.0);
  const [proteinLevel, setProteinLevel] = useState<number>(2);
  const [dayStrain, setDayStrain] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({
      steps_bucket: stepsBucket,
      hydration_liters: hydrationLiters,
      protein_level: proteinLevel,
      day_strain: dayStrain
    });
    setSubmitting(false);
  };

  if (!isWindowOpen) {
    return (
      <Card className="border-indigo-200 dark:border-indigo-800 overflow-hidden">
        <CardContent className="py-8 text-center">
          <Moon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            The night check-in window is closed.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Check back between 19:00 and 21:00.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Moon className="h-5 w-5 text-indigo-500 flex-shrink-0" />
          Night Check-in
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Window open until {windowEnd}. Takes 30 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Steps/Movement */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            How much did you move today?
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {stepBuckets.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStepsBucket(value)}
                className={`
                  flex flex-col items-center p-1.5 sm:p-3 rounded-lg transition-all
                  ${stepsBucket === value 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                    : 'bg-muted hover:bg-muted/80'}
                `}
              >
                <span className="font-semibold text-xs sm:text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hydration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            How much water did you drink today?
          </label>
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {hydrationQuickButtons.map((liters) => (
              <button
                key={liters}
                type="button"
                onClick={() => setHydrationLiters(liters)}
                className={`
                  px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-all text-xs sm:text-sm
                  ${hydrationLiters === liters 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                    : 'bg-muted hover:bg-muted/80'}
                `}
              >
                {liters}L{liters >= 3 ? '+' : ''}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Slider
              value={[hydrationLiters]}
              onValueChange={([val]) => setHydrationLiters(Math.round(val * 10) / 10)}
              min={0}
              max={6}
              step={0.1}
              className="flex-1"
            />
            <span className="w-10 text-center font-semibold text-sm flex-shrink-0">
              {hydrationLiters}L
            </span>
          </div>
        </div>

        {/* Protein */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Did you hit your protein today?
          </label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {proteinLevels.map(({ value, emoji, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setProteinLevel(value)}
                className={`
                  flex flex-col items-center p-1.5 sm:p-2 rounded-lg transition-all
                  ${proteinLevel === value 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary' 
                    : 'bg-muted hover:bg-muted/80'}
                `}
              >
                <span className="text-base sm:text-xl">{emoji}</span>
                <span className="text-[10px] sm:text-xs mt-0.5 hidden sm:block truncate w-full text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Day Strain */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            How demanding was your day (physically and mentally)?
          </label>
          <div className="flex items-center gap-3">
            <Slider
              value={[dayStrain]}
              onValueChange={([val]) => setDayStrain(val)}
              min={0}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="w-20 sm:w-28 text-center text-xs sm:text-sm font-medium flex-shrink-0">
              <span className="text-primary font-bold">{dayStrain}</span> – {strainLabels[dayStrain]}
            </span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span>10</span>
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
            'Complete Night Check-in'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}