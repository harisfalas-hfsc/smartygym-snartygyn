import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function logStep(step: string, details?: any) {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DOWNLOAD-RITUAL-CALENDAR] ${step}${detailsStr}`);
}

function generateICSContent(ritualDate: string): string {
  const formatICSDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const date = new Date(ritualDate);
  
  // Morning: 08:00
  const morning = new Date(date);
  morning.setHours(8, 0, 0, 0);
  
  // Midday: 13:00
  const midday = new Date(date);
  midday.setHours(13, 0, 0, 0);
  
  // Evening: 17:00
  const evening = new Date(date);
  evening.setHours(17, 0, 0, 0);

  const events = [
    {
      title: `Morning Smarty Ritual`,
      start: morning,
      duration: 15,
      description: "Start your day with joint unlock, light activation, and morning prep. View full ritual at https://smartygym.com/daily-ritual",
    },
    {
      title: `Midday Smarty Ritual`,
      start: midday,
      duration: 10,
      description: "Reset with desk mobility, anti-stiffness movements, and breathing. View full ritual at https://smartygym.com/daily-ritual",
    },
    {
      title: `Evening Smarty Ritual`,
      start: evening,
      duration: 15,
      description: "Unwind with decompression, stress release, and pre-bed guidance. View full ritual at https://smartygym.com/daily-ritual",
    },
  ];

  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SmartyGym//Daily Ritual//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:SmartyGym Daily Ritual
`;

  events.forEach((event, index) => {
    const endTime = new Date(event.start.getTime() + event.duration * 60000);
    ics += `BEGIN:VEVENT
UID:ritual-${ritualDate}-${index}@smartygym.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(event.start)}
DTEND:${formatICSDate(endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
URL:https://smartygym.com/daily-ritual
BEGIN:VALARM
TRIGGER:-PT10M
ACTION:DISPLAY
DESCRIPTION:${event.title} starts in 10 minutes
END:VALARM
END:VEVENT
`;
  });

  ics += 'END:VCALENDAR';
  return ics;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    if (!date) {
      // Default to today's date if not provided
      const today = new Date().toISOString().split('T')[0];
      logStep("No date provided, using today", { date: today });
      
      const icsContent = generateICSContent(today);
      
      return new Response(icsContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="smarty-ritual-${today}.ics"`,
        },
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      logStep("Invalid date format", { date });
      return new Response(JSON.stringify({ error: "Invalid date format. Use YYYY-MM-DD" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Generating ICS for date", { date });
    
    const icsContent = generateICSContent(date);
    
    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="smarty-ritual-${date}.ics"`,
      },
    });

  } catch (error) {
    const err = error as Error;
    logStep("ERROR", { message: err.message });
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
