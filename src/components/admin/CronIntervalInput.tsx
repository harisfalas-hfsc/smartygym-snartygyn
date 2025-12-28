import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CronIntervalInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
}

export function CronIntervalInput({
  value,
  onChange,
  min = 1,
  max = 60,
  step = 5,
  label = "Interval",
  suffix = "minutes"
}: CronIntervalInputProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  const increment = () => onChange(clamp(value + step));
  const decrement = () => onChange(clamp(value - step));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val === '') {
      onChange(min);
    } else {
      onChange(clamp(parseInt(val, 10)));
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm">{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-12 p-0"
            onClick={increment}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Input
            type="text"
            inputMode="numeric"
            value={value.toString()}
            onChange={handleInput}
            className="w-16 text-center font-mono text-lg h-10"
            maxLength={3}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-12 p-0"
            onClick={decrement}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}
