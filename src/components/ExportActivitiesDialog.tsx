import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Download, Loader2, CheckCircle2, Upload } from "lucide-react";
import { format, subMonths } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ActivityType = 'workouts' | 'programs' | 'checkins';

export const ExportActivitiesDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>(['workouts', 'programs', 'checkins']);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<{ exported: number; failed: number } | null>(null);
  const { toast } = useToast();

  const toggleActivityType = (type: ActivityType) => {
    setActivityTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleExport = async () => {
    if (activityTypes.length === 0) {
      toast({
        title: "Select Activity Types",
        description: "Please select at least one type of activity to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(10);
    setExportResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Login Required",
          description: "Please log in to export activities.",
          variant: "destructive",
        });
        return;
      }

      setExportProgress(30);

      const response = await supabase.functions.invoke('sync-google-calendar', {
        body: {
          action: 'bulk-export',
          activities: {
            activity_types: activityTypes,
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd')
          }
        }
      });

      setExportProgress(90);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;

      if (result.reconnect_required) {
        toast({
          title: "Calendar Reconnection Required",
          description: "Your calendar connection has expired. Please reconnect.",
          variant: "destructive",
        });
        return;
      }

      setExportResult({ exported: result.exported, failed: result.failed });
      setExportProgress(100);

      toast({
        title: "Export Complete! 📅",
        description: `Successfully exported ${result.exported} activities to Google Calendar.`,
      });

    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export activities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setExportResult(null);
    setExportProgress(0);
    setIsOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Export Past Activities
          </CardTitle>
          <CardDescription>
            Export completed workouts, programs, and check-ins to Google Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsOpen(true)} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export to Google Calendar
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Activities to Calendar
            </DialogTitle>
            <DialogDescription>
              Export your past workout activities to Google Calendar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Start"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "End"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => date && setEndDate(date)}
                      disabled={(date) => date > new Date() || date < startDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Activity Types */}
            <div className="space-y-3">
              <Label>Activity Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="workouts"
                    checked={activityTypes.includes('workouts')}
                    onCheckedChange={() => toggleActivityType('workouts')}
                  />
                  <label htmlFor="workouts" className="text-sm cursor-pointer">
                    Completed Workouts
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="programs"
                    checked={activityTypes.includes('programs')}
                    onCheckedChange={() => toggleActivityType('programs')}
                  />
                  <label htmlFor="programs" className="text-sm cursor-pointer">
                    Completed Programs
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkins"
                    checked={activityTypes.includes('checkins')}
                    onCheckedChange={() => toggleActivityType('checkins')}
                  />
                  <label htmlFor="checkins" className="text-sm cursor-pointer">
                    Daily Check-ins
                  </label>
                </div>
              </div>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="space-y-2">
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Exporting activities... {exportProgress}%
                </p>
              </div>
            )}

            {/* Export Result */}
            {exportResult && (
              <div className="rounded-lg bg-primary/10 p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Export Complete</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exportResult.exported} activities exported
                    {exportResult.failed > 0 && `, ${exportResult.failed} failed`}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {exportResult ? "Done" : "Cancel"}
              </Button>
              {!exportResult && (
                <Button
                  onClick={handleExport}
                  disabled={isExporting || activityTypes.length === 0}
                  className="flex-1"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
