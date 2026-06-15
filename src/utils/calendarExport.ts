const PUBLISHED_URL = "https://smartygym.lovable.app";

export type CalendarExportMethod = "native-share" | "browser-download" | "mobile-open" | "hosted-ics" | "android-intent";

export interface CalendarExportResult {
  success: boolean;
  method: CalendarExportMethod;
  error?: unknown;
}

export interface CalendarEventParams {
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

export function buildHostedICSUrl(params: CalendarEventParams): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const searchParams = new URLSearchParams({
    title: params.title,
    date: params.date,
    reminderMinutes: String(params.reminderMinutes),
    contentType: params.contentType,
    contentRouteType: params.contentRouteType,
    contentId: params.contentId,
  });

  if (params.time) searchParams.set("time", params.time);
  if (params.notes) searchParams.set("notes", params.notes);

  return `${baseUrl}/functions/v1/generate-calendar-ics?${searchParams.toString()}`;
}

export function buildAndroidCalendarIntentUrl(params: CalendarEventParams): string {
  const start = new Date(`${params.date}T${params.time || "09:00"}:00`).getTime();
  const end = start + (params.time ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000);
  const descriptionParts: string[] = [];

  if (params.notes) descriptionParts.push(params.notes);
  descriptionParts.push(`Open in SmartyGym: ${buildContentUrl(params.contentType, params.contentRouteType, params.contentId)}`);

  return [
    "intent://com.android.calendar/events#Intent",
    "action=android.intent.action.INSERT",
    "type=vnd.android.cursor.item/event",
    `S.title=${encodeURIComponent(sanitizeTitle(params.title))}`,
    `S.description=${encodeURIComponent(descriptionParts.join("\n"))}`,
    `l.beginTime=${start}`,
    `l.endTime=${end}`,
    "end",
  ].join(";");
}

export function openCalendarEvent(params: CalendarEventParams): CalendarExportResult {
  const { isAndroid } = getCalendarRuntime();
  const hostedUrl = buildHostedICSUrl(params);

  if (isAndroid) {
    let fallbackTimer: number | undefined;
    const cancelFallback = () => {
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
      window.removeEventListener("pagehide", cancelFallback);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    const handleVisibilityChange = () => {
      if (document.hidden) cancelFallback();
    };

    window.addEventListener("pagehide", cancelFallback, { once: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    fallbackTimer = window.setTimeout(() => {
      window.location.href = hostedUrl;
    }, 1400);

    window.location.href = buildAndroidCalendarIntentUrl(params);
    return { success: true, method: "android-intent" };
  }

  window.location.href = hostedUrl;
  return { success: true, method: "hosted-ics" };
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

function getCalendarRuntime() {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  const isAndroid = /Android/i.test(ua);
  const isAndroidWebView = isAndroid && /; wv\)|\bwv\b|Version\/\d+(?:\.\d+)?\s+Chrome\//i.test(ua);
  const isStandalonePwa =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));

  return { isIOS, isAndroid, isAndroidWebView, isStandalonePwa };
}

function openCalendarDataUrl(icsContent: string): CalendarExportResult {
  const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
  const opened = window.open(dataUrl, "_blank", "noopener,noreferrer");

  if (!opened) {
    window.location.href = dataUrl;
  }

  return { success: true, method: "mobile-open" };
}

export async function downloadICSFile(icsContent: string, filename: string): Promise<CalendarExportResult> {
  const safeName = `${filename.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const { isIOS, isAndroid, isAndroidWebView, isStandalonePwa } = getCalendarRuntime();
  const shouldUseNativeMobilePath = isIOS || isAndroid || isAndroidWebView || isStandalonePwa;

  if (shouldUseNativeMobilePath && typeof File !== "undefined" && typeof navigator.share === "function") {
    const calendarFile = new File([blob], safeName, { type: "text/calendar" });
    const shareData: ShareData = {
      title: filename,
      text: "Add this SmartyGym event to your calendar.",
      files: [calendarFile],
    };

    try {
      if (!navigator.canShare || navigator.canShare(shareData)) {
        await navigator.share(shareData);
        URL.revokeObjectURL(url);
        return { success: true, method: "native-share" };
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        URL.revokeObjectURL(url);
        return { success: false, method: "native-share", error };
      }
    }
  }

  if (shouldUseNativeMobilePath) {
    URL.revokeObjectURL(url);
    return openCalendarDataUrl(icsContent);
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { success: true, method: "browser-download" };
}
