import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Play, RefreshCw, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GenerateWODDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (targetDate?: string) => Promise<void>;
  isGenerating: boolean;
  nextCategory: string;
  dayInCycle: number;
}

// 8-DAY CATEGORY CYCLE for preview (matches backend exactly)
const CATEGORY_CYCLE_8DAY = [
  "CHALLENGE",            // Day 1
  "STRENGTH",             // Day 2
  "CARDIO",               // Day 3
  "MOBILITY & STABILITY", // Day 4
  "STRENGTH",             // Day 5
  "METABOLIC",            // Day 6
  "CALORIE BURNING",      // Day 7
  "PILATES"               // Day 8
];

// Reference date: December 14, 2025 = Day 1 (CHALLENGE)
const CYCLE_START_DATE = '2025-12-14';

// DATE-BASED calculation - always gives correct category for calendar day
const getDayInCycleFromDate = (dateStr: string): number => {
  const startDate = new Date(CYCLE_START_DATE + 'T00:00:00Z');
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const daysDiff = Math.floor((targetDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  const normalizedDays = ((daysDiff % 8) + 8) % 8;
  return normalizedDays + 1; // 1-8
};

const getCategoryForDay = (dayInCycle: number): string => CATEGORY_CYCLE_8DAY[dayInCycle - 1];

export const GenerateWODDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  nextCategory,
  dayInCycle,
}: GenerateWODDialogProps) => {
  const [dateMode, setDateMode] = useState<"today" | "future">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const today = new Date();
  const maxDate = addDays(today, 7);
  
  // Calculate category for selected future date using DATE-BASED calculation
  const getPreviewCategory = (date: Date): string => {
    const dateStr = format(date, "yyyy-MM-dd");
    const futureDayInCycle = getDayInCycleFromDate(dateStr);
    return getCategoryForDay(futureDayInCycle);
  };
  
  const previewCategory = dateMode === "future" && selectedDate 
    ? getPreviewCategory(selectedDate)
    : nextCategory;
  
  const handleGenerate = async () => {
    const targetDate = dateMode === "future" && selectedDate 
      ? format(selectedDate, "yyyy-MM-dd")
      : undefined;
    
    await onGenerate(targetDate);
    onOpenChange(false);
    setDateMode("today");
    setSelectedDate(undefined);
  };
  
  const canGenerate = dateMode === "today" || (dateMode === "future" && selectedDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Generate Workout of the Day
          </DialogTitle>
          <DialogDescription>
            Choose when to generate the WOD. Pre-generating for a future date will prevent the cron job from generating on that day.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <RadioGroup 
            value={dateMode} 
            onValueChange={(v) => setDateMode(v as "today" | "future")}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today" className="flex-1 cursor-pointer">
                <div className="font-medium">Generate for Today</div>
                <div className="text-sm text-muted-foreground">
                  Immediate generation for {format(today, "MMM d, yyyy")}
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="future" id="future" />
              <Label htmlFor="future" className="flex-1 cursor-pointer">
                <div className="font-medium">Pre-Generate for Future Date</div>
                <div className="text-sm text-muted-foreground">
                  Schedule ahead, cron will skip that day
                </div>
              </Label>
            </div>
          </RadioGroup>
          
          {dateMode === "future" && (
            <div className="pl-6 space-y-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => 
                      date <= today || date > maxDate
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {selectedDate && (
                <div className="text-sm text-muted-foreground">
                  The system will skip auto-generation for this date since you're pre-generating it now.
                </div>
              )}
            </div>
          )}
          
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Generation Preview</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{previewCategory}</Badge>
              <Badge variant="secondary">
                {dateMode === "future" && selectedDate 
                  ? format(selectedDate, "MMM d, yyyy")
                  : "Today"
                }
              </Badge>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              <li>• Generate BODYWEIGHT + EQUIPMENT versions</li>
              <li>• Create Stripe products at €3.99</li>
              <li>• Generate unique workout images</li>
              {dateMode === "today" && (
                <li>• Send notifications to users</li>
              )}
              {dateMode === "future" && selectedDate && (
                <li>• Cron job will skip {format(selectedDate, "MMM d")}</li>
              )}
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !canGenerate}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Generate WOD
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
