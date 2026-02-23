const PUBLISHED_URL = "https://smartygym.lovable.app";

interface CalendarEventParams {
  title: string;
  date: string; // yyyy-MM-dd
  time?: string; // HH:mm
  reminderMinutes: number;
  notes?: string;
  contentType: "workout" | "program";
  contentRouteType: string;
  contentId: string;
}

function formatICSDate(dateStr: string, timeStr?: string): string {
  const [year, month, day] = dateStr.split("-");
  if (timeStr) {
    const [hours, minutes] = timeStr.split(":");
    return `${year}${month}${day}T${hours}${minutes}00`;
  }
  return `${year}${month}${day}`;
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildContentUrl(contentType: "workout" | "program", contentRouteType: string, contentId: string): string {
  const routePrefix = contentType === "workout" ? "workout" : "trainingprogram";
  return `${PUBLISHED_URL}/${routePrefix}/${encodeURIComponent(contentRouteType)}/${encodeURIComponent(contentId)}`;
}

export function generateICSFile(params: CalendarEventParams): string {
  const { title, date, time, reminderMinutes, notes, contentType, contentRouteType, contentId } = params;

  const url = buildContentUrl(contentType, contentRouteType, contentId);
  const dtStart = formatICSDate(date, time);
  const isAllDay = !time;

  // End time: 1 hour after start, or next day for all-day
  let dtEnd: string;
  if (isAllDay) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    dtEnd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  } else {
    const [h, m] = time!.split(":").map(Number);
    const endH = String(h + 1).padStart(2, "0");
    dtEnd = formatICSDate(date, `${endH}:${String(m).padStart(2, "0")}`);
  }

  const description = [
    notes ? notes : "",
    "",
    `Open in SmartyGym: ${url}`,
  ].filter(Boolean).join("\\n");

  const uid = `${contentId}-${Date.now()}@smartygym.lovable.app`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SmartyGym//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SUMMARY:${escapeICS(title)}`,
    isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `DESCRIPTION:${escapeICS(description)}`,
    `URL:${url}`,
  ];

  if (reminderMinutes > 0) {
    lines.push(
      "BEGIN:VALARM",
      "TRIGGER:-PT" + reminderMinutes + "M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICS(title)} starts soon`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadICSFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
