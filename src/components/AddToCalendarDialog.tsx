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

function getDialogCopy(title: string, contentType: "workout" | "program") {
  const label = contentType === "workout" ? "workout" : "training program";
  const isCompleted = title.toLowerCase().startsWith("completed:");

  if (isCompleted) {
    return {
      heading: "Amazing Work! You Crushed It!",
      description: `Save this achievement to your calendar and keep the momentum going. Every ${label} you finish brings you closer to your goals!`,
      motivationalNote: `You just completed a ${label} -- that's something to be proud of. Track your wins and watch your progress grow!`,
    };
  }

  return {
    heading: "Lock It In -- You've Got This!",
    description: `Add this ${label} to your calendar so nothing gets in the way. Consistency is the key to results!`,
    motivationalNote: `A scheduled ${label} is a promise to yourself. Show up, give it your best, and let's crush it!`,
  };
}

export const AddToCalendarDialog = ({ isOpen, onClose, eventDetails }: AddToCalendarDialogProps) => {
  if (!eventDetails) return null;

  const handleAddToCalendar = () => {
    const icsContent = generateICSFile(eventDetails);
    downloadICSFile(icsContent, eventDetails.title);
    onClose();
  };

  const displayDate = format(new Date(eventDetails.date + "T12:00:00"), "MMMM d, yyyy");
  const copy = getDialogCopy(eventDetails.title, eventDetails.contentType);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-primary" />
            {copy.heading}
          </DialogTitle>
          <DialogDescription>
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="p-3 bg-muted rounded-lg space-y-1">
            <p className="font-semibold text-sm">{eventDetails.title}</p>
            <p className="text-xs text-muted-foreground">{displayDate}{eventDetails.time ? ` at ${eventDetails.time}` : ""}</p>
            <p className="text-xs text-primary/80 mt-1 italic">{copy.motivationalNote}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 gap-2">
              <X className="h-4 w-4" />
              Skip
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
