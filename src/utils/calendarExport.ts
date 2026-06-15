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

function getNowStamp(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const h = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const s = String(now.getUTCSeconds()).padStart(2, "0");
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Strip emoji and non-ASCII for maximum calendar app compatibility
function sanitizeTitle(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, "").trim();
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
  const dtstamp = getNowStamp();
  const safeTitle = sanitizeTitle(title);

  let dtEnd: string;
  if (isAllDay) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + 1);
    dtEnd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  } else {
    const [h, m] = time!.split(":").map(Number);
    const endH = String(Math.min(h + 1, 23)).padStart(2, "0");
    dtEnd = formatICSDate(date, `${endH}:${String(m).padStart(2, "0")}`);
  }

  const descParts: string[] = [];
  if (notes) descParts.push(notes);
  descParts.push(`Open in SmartyGym: ${url}`);
  const description = escapeICS(descParts.join("\n"));

  const uid = `${contentId.replace(/[^a-zA-Z0-9-]/g, "")}-${Date.now()}@smartygym.lovable.app`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SmartyGym//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${escapeICS(safeTitle)}`,
    isAllDay ? `DTSTART;VALUE=DATE:${dtStart}` : `DTSTART:${dtStart}`,
    isAllDay ? `DTEND;VALUE=DATE:${dtEnd}` : `DTEND:${dtEnd}`,
    `DESCRIPTION:${description}`,
    `URL:${url}`,
  ];

  if (reminderMinutes > 0) {
    lines.push(
      "BEGIN:VALARM",
      "TRIGGER:-PT" + reminderMinutes + "M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICS(safeTitle)} starts soon`,
      "END:VALARM"
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.join("\r\n");
}

export function downloadICSFile(icsContent: string, filename: string) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const safeName = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;

  // Mobile (iOS Safari + Android WebView/APK wrappers like AppMySite) ignores
  // the `download` attribute on blob URLs. Navigating to a data: URL lets the
  // OS hand the .ics straight to the Calendar app via intent.
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/i.test(ua);
  const isMobile = isIOS || isAndroid;

  if (isMobile) {
    const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
    // Try opening in a new tab first (lets Android WebView fire VIEW intent);
    // fall back to same-window navigation if the popup is blocked.
    const opened = window.open(dataUrl, "_blank");
    if (!opened) {
      window.location.href = dataUrl;
    }
    URL.revokeObjectURL(url);
    return;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
