import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CronTimeInputProps {
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  label?: string;
  showTimezonePreview?: boolean;
}

// Cyprus is UTC+3 (simplified - summer time)
const cyprusToUtc = (cyprusHour: number): number => (cyprusHour - 3 + 24) % 24;

export function CronTimeInput({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  label = "Time (Cyprus)",
  showTimezonePreview = true
}: CronTimeInputProps) {
  const clampHour = (h: number) => Math.max(0, Math.min(23, h));
  const clampMinute = (m: number) => Math.max(0, Math.min(59, m));

  const incrementHour = () => onHourChange((hour + 1) % 24);
  const decrementHour = () => onHourChange((hour - 1 + 24) % 24);
  const incrementMinute = () => {
    const newMin = (minute + 5) % 60;
    onMinuteChange(newMin);
  };
  const decrementMinute = () => {
    const newMin = (minute - 5 + 60) % 60;
    onMinuteChange(newMin);
  };

  const handleHourInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      onHourChange(0);
    } else {
      onHourChange(clampHour(parseInt(val, 10)));
    }
  };

  const handleMinuteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      onMinuteChange(0);
    } else {
      onMinuteChange(clampMinute(parseInt(val, 10)));
    }
  };

  const utcHour = cyprusToUtc(hour);
  const timePreview = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} Cyprus`;
  const utcPreview = `${utcHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} UTC`;

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm">{label}</Label>}
      <div className="flex items-center gap-2">
        {/* Hour input */}
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-10 p-0"
            onClick={incrementHour}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            value={hour.toString().padStart(2, '0')}
            onChange={handleHourInput}
            className="w-12 text-center font-mono text-lg h-10"
            maxLength={2}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-10 p-0"
            onClick={decrementHour}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-2xl font-bold">:</span>

        {/* Minute input */}
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-10 p-0"
            onClick={incrementMinute}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            value={minute.toString().padStart(2, '0')}
            onChange={handleMinuteInput}
            className="w-12 text-center font-mono text-lg h-10"
            maxLength={2}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-10 p-0"
            onClick={decrementMinute}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showTimezonePreview && (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div className="font-medium text-foreground">{timePreview}</div>
          <div>{utcPreview}</div>
        </div>
      )}
    </div>
  );
}
