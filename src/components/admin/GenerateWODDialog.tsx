import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Play, RefreshCw, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  getDayInCycleFromDate,
  getCategoryForDay
} from "@/lib/wodCycle";

interface GenerateWODDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (targetDate?: string, archiveFirst?: boolean) => Promise<void>;
  isGenerating: boolean;
  todayCategory: string;
  nextCategory: string;
  dayInCycle: number;
  hasTodayWOD: boolean;
}

// Helper: Get Cyprus date (timezone-aware)
const getCyprusDate = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Nicosia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now); // Returns YYYY-MM-DD
};

// Helper: Format Cyprus date nicely
const formatCyprusDateDisplay = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Nicosia',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return formatter.format(now);
};

export const GenerateWODDialog = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
  todayCategory,
  nextCategory,
  dayInCycle,
  hasTodayWOD,
}: GenerateWODDialogProps) => {
  const [dateMode, setDateMode] = useState<"today" | "future">("today");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [archiveFirst, setArchiveFirst] = useState(true);
  
  const today = new Date();
  const maxDate = addDays(today, 7);
  const cyprusDate = getCyprusDate();
  const cyprusDateDisplay = formatCyprusDateDisplay();
  
  // Calculate category for selected future date using DATE-BASED calculation
  const getPreviewCategory = (date: Date): string => {
    const dateStr = format(date, "yyyy-MM-dd");
    const futureDayInCycle = getDayInCycleFromDate(dateStr);
    return getCategoryForDay(futureDayInCycle);
  };
  
  // Show TODAY's category when "today" is selected, future category otherwise
  const previewCategory = dateMode === "future" && selectedDate 
    ? getPreviewCategory(selectedDate)
    : todayCategory;
  
  const handleGenerate = async () => {
    const targetDate = dateMode === "future" && selectedDate 
      ? format(selectedDate, "yyyy-MM-dd")
      : undefined;
    
    await onGenerate(targetDate, archiveFirst);
    onOpenChange(false);
    setDateMode("today");
    setSelectedDate(undefined);
    setArchiveFirst(true);
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
          {/* Warning: Today's WOD is MISSING */}
          {!hasTodayWOD && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Today's WOD is missing!</AlertTitle>
              <AlertDescription>
                No WOD exists for {cyprusDateDisplay} (Cyprus). Select "Generate for Today" to create it now.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Warning: Today's WOD EXISTS (will be replaced) */}
          {hasTodayWOD && dateMode === "today" && (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertTitle className="text-orange-400">Today's WOD already exists</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Generating will <strong>replace</strong> the existing WOD for {cyprusDateDisplay}.
              </AlertDescription>
            </Alert>
          )}

          <RadioGroup 
            value={dateMode} 
            onValueChange={(v) => setDateMode(v as "today" | "future")}
            className="space-y-3"
          >
            <div className={cn(
              "flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors",
              !hasTodayWOD && "border-red-500/50 bg-red-500/5"
            )}>
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today" className="flex-1 cursor-pointer">
                <div className="font-medium flex items-center gap-2">
                  Generate for Today (Cyprus)
                  {!hasTodayWOD && <Badge variant="destructive" className="text-xs">MISSING</Badge>}
                  {hasTodayWOD && <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">EXISTS</Badge>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cyprusDateDisplay} • Category: <strong>{todayCategory}</strong>
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
                  Category for {format(selectedDate, "MMM d")}: <strong>{getPreviewCategory(selectedDate)}</strong>
                  <br />
                  The system will skip auto-generation for this date since you're pre-generating it now.
                </div>
              )}
            </div>
          )}
          
          {/* Archive First Option */}
          <div className="flex items-center space-x-3 p-3 rounded-lg border bg-orange-500/10 border-orange-500/30">
            <Checkbox 
              id="archive-first" 
              checked={archiveFirst}
              onCheckedChange={(checked) => setArchiveFirst(checked === true)}
            />
            <Label htmlFor="archive-first" className="flex-1 cursor-pointer">
              <div className="font-medium text-orange-400">Archive existing WODs first</div>
              <div className="text-sm text-muted-foreground">
                Move current WODs to their categories before generating new ones
              </div>
            </Label>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="text-sm font-medium">Generation Preview</div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{previewCategory}</Badge>
              <Badge variant="secondary">
                {dateMode === "future" && selectedDate 
                  ? format(selectedDate, "MMM d, yyyy")
                  : `Today (${cyprusDateDisplay})`
                }
              </Badge>
              {archiveFirst && (
                <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                  Archive First
                </Badge>
              )}
              {dateMode === "today" && hasTodayWOD && (
                <Badge variant="outline" className="border-red-500/50 text-red-400">
                  Will Replace
                </Badge>
              )}
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              {archiveFirst && (
                <li>• Archive existing WODs to their categories</li>
              )}
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
            variant={!hasTodayWOD && dateMode === "today" ? "destructive" : "default"}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {dateMode === "today" && !hasTodayWOD ? "Generate Missing WOD" : "Generate WOD"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};