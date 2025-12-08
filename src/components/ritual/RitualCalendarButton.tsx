import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RitualCalendarButtonProps {
  ritual: {
    ritual_date: string;
    day_number: number;
    morning_content?: string;
    midday_content?: string;
    evening_content?: string;
  };
}

// Convert HTML to plain text for calendar descriptions
const htmlToPlainText = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

export const RitualCalendarButton = ({ ritual }: RitualCalendarButtonProps) => {
  const { toast } = useToast();

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

  // Escape special characters for ICS format
  const escapeICSText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  const generateICSContent = () => {
    const times = getLocalTimes();
    const dayNum = ritual.day_number;

    // Get full content descriptions
    const morningDesc = ritual.morning_content 
      ? htmlToPlainText(ritual.morning_content)
      : "Joint unlock, light activation, and morning prep. Start your day strong!";
    
    const middayDesc = ritual.midday_content
      ? htmlToPlainText(ritual.midday_content)
      : "Desk reset, anti-stiffness movements, and breathing reset. Reset & Reload!";
    
    const eveningDesc = ritual.evening_content
      ? htmlToPlainText(ritual.evening_content)
      : "Decompression, stress release, and pre-bed guidance. Unwind!";

    const events = [
      {
        title: `☀️ Morning Ritual - Day ${dayNum}`,
        start: times.morning,
        duration: 15,
        description: morningDesc + "\n\nView full ritual: https://smartygym.com/daily-ritual",
        reminder: 10,
      },
      {
        title: `🌤️ Midday Ritual - Day ${dayNum}`,
        start: times.midday,
        duration: 10,
        description: middayDesc + "\n\nView full ritual: https://smartygym.com/daily-ritual",
        reminder: 10,
      },
      {
        title: `🌙 Evening Ritual - Day ${dayNum}`,
        start: times.evening,
        duration: 15,
        description: eveningDesc + "\n\nView full ritual: https://smartygym.com/daily-ritual",
        reminder: 10,
      },
    ];

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartyGym//Daily Ritual//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SmartyGym Daily Ritual
`;

    events.forEach((event, index) => {
      const endTime = new Date(event.start.getTime() + event.duration * 60000);
      const alarmTime = event.reminder;
      
      icsContent += `BEGIN:VEVENT
UID:ritual-${ritual.ritual_date}-${index}@smartygym.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${escapeICSText(event.title)}
DESCRIPTION:${escapeICSText(event.description)}
URL:https://smartygym.com/daily-ritual
BEGIN:VALARM
TRIGGER:-PT${alarmTime}M
ACTION:DISPLAY
DESCRIPTION:${escapeICSText(event.title)} starts in ${alarmTime} minutes
END:VALARM
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
      description: "Open the file to add all 3 ritual events with reminders to your calendar",
    });
  };

  return (
    <Button variant="outline" className="gap-2" onClick={downloadICS}>
      <Calendar className="h-4 w-4" />
      Add All 3 Rituals to Calendar
    </Button>
  );
};
