import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RitualCalendarButtonProps {
  ritual: {
    ritual_date: string;
    day_number: number;
  };
}

export const RitualCalendarButton = ({ ritual }: RitualCalendarButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Cyprus reference times converted to user's local timezone
  const getLocalTimes = () => {
    const ritualDate = new Date(ritual.ritual_date);
    
    // Create dates in Cyprus timezone (UTC+2 winter, UTC+3 summer)
    // Morning: 08:00 Cyprus
    const morningCyprus = new Date(ritualDate);
    morningCyprus.setHours(8, 0, 0, 0);
    
    // Midday: 13:00 Cyprus
    const middayCyprus = new Date(ritualDate);
    middayCyprus.setHours(13, 0, 0, 0);
    
    // Evening: 17:00 Cyprus
    const eveningCyprus = new Date(ritualDate);
    eveningCyprus.setHours(17, 0, 0, 0);

    return {
      morning: morningCyprus,
      midday: middayCyprus,
      evening: eveningCyprus,
    };
  };

  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICSContent = () => {
    const times = getLocalTimes();
    const dayNum = ritual.day_number;

    const events = [
      {
        title: `☀️ Morning Ritual - Day ${dayNum}`,
        start: times.morning,
        duration: 15, // 15 minutes
        description: "Joint unlock, light activation, and morning prep. Start your day strong!",
      },
      {
        title: `🌤️ Midday Ritual - Day ${dayNum}`,
        start: times.midday,
        duration: 10,
        description: "Desk reset, anti-stiffness movements, and breathing reset. Reset & Reload!",
      },
      {
        title: `🌙 Evening Ritual - Day ${dayNum}`,
        start: times.evening,
        duration: 15,
        description: "Decompression, stress release, and pre-bed guidance. Unwind!",
      },
    ];

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartyGym//Daily Ritual//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    events.forEach((event, index) => {
      const endTime = new Date(event.start.getTime() + event.duration * 60000);
      icsContent += `BEGIN:VEVENT
UID:ritual-${ritual.ritual_date}-${index}@smartygym.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}\\n\\nView full ritual: https://smartygym.com/daily-ritual
URL:https://smartygym.com/daily-ritual
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';
    return icsContent;
  };

  const downloadICS = () => {
    const icsContent = generateICSContent();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smarty-ritual-day-${ritual.day_number}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Calendar file downloaded",
      description: "Open the file to add events to your calendar",
    });
    setIsOpen(false);
  };

  const openGoogleCalendar = () => {
    const times = getLocalTimes();
    const dayNum = ritual.day_number;

    // Create Google Calendar URL for morning event
    const morningUrl = new URL('https://calendar.google.com/calendar/render');
    morningUrl.searchParams.set('action', 'TEMPLATE');
    morningUrl.searchParams.set('text', `☀️ Morning Ritual - Day ${dayNum}`);
    morningUrl.searchParams.set('dates', 
      `${formatICSDate(times.morning).replace('Z', '')}/${formatICSDate(new Date(times.morning.getTime() + 15 * 60000)).replace('Z', '')}`
    );
    morningUrl.searchParams.set('details', 'Joint unlock, light activation, and morning prep. Start your day strong!\\n\\nView full ritual: https://smartygym.com/daily-ritual');
    
    window.open(morningUrl.toString(), '_blank');

    toast({
      title: "Opening Google Calendar",
      description: "Add all 3 ritual events one by one",
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Add to Your Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-56">
        <DropdownMenuItem onClick={downloadICS}>
          <Download className="mr-2 h-4 w-4" />
          Download Calendar File (.ics)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openGoogleCalendar}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
