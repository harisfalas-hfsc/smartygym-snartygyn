import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarPlus, X } from "lucide-react";
import { generateICSFile, downloadICSFile } from "@/utils/calendarExport";
import { format } from "date-fns";

interface AddToCalendarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: {
    title: string;
    date: string; // yyyy-MM-dd
    time?: string;
    reminderMinutes: number;
    notes?: string;
    contentType: "workout" | "program";
    contentRouteType: string;
    contentId: string;
  } | null;
}

export const AddToCalendarDialog = ({ isOpen, onClose, eventDetails }: AddToCalendarDialogProps) => {
  if (!eventDetails) return null;

  const handleAddToCalendar = () => {
    const icsContent = generateICSFile(eventDetails);
    downloadICSFile(icsContent, eventDetails.title);
    onClose();
  };

  const displayDate = format(new Date(eventDetails.date + "T12:00:00"), "MMMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            Add to Your Calendar?
          </DialogTitle>
          <DialogDescription>
            Would you like to add this to your device's calendar app?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="font-semibold text-sm">{eventDetails.title}</p>
            <p className="text-xs text-muted-foreground">{displayDate}{eventDetails.time ? ` at ${eventDetails.time}` : ""}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 gap-2">
              <X className="h-4 w-4" />
              No Thanks
            </Button>
            <Button onClick={handleAddToCalendar} className="flex-1 gap-2">
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
