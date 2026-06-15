import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const PUBLISHED_URL = "https://smartygym.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

type ContentType = "workout" | "program";

interface CalendarEventParams {
  title: string;
  date: string;
  time?: string;
  reminderMinutes: number;
  notes?: string;
  contentType: ContentType;
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
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function sanitizeTitle(text: string): string {
  return text.replace(/[^\x20-\x7E]/g, "").trim();
}

function buildContentUrl(contentType: ContentType, contentRouteType: string, contentId: string): string {
  const routePrefix = contentType === "workout" ? "workout" : "trainingprogram";
  return `${PUBLISHED_URL}/${routePrefix}/${encodeURIComponent(contentRouteType)}/${encodeURIComponent(contentId)}`;
}

function generateICSFile(params: CalendarEventParams): string {
  const { title, date, time, reminderMinutes, notes, contentType, contentRouteType, contentId } = params;
  const url = buildContentUrl(contentType, contentRouteType, contentId);
  const dtStart = formatICSDate(date, time);
  const isAllDay = !time;
  const dtstamp = getNowStamp();
  const safeTitle = sanitizeTitle(title);

  let dtEnd: string;
  if (isAllDay) {
    const d = new Date(`${date}T12:00:00`);
    d.setDate(d.getDate() + 1);
    dtEnd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  } else {
    const [h, m] = time.split(":").map(Number);
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
      `TRIGGER:-PT${reminderMinutes}M`,
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeICS(safeTitle)} starts soon`,
      "END:VALARM",
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function badRequest(message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function parseParams(url: URL): CalendarEventParams | Response {
  const title = url.searchParams.get("title")?.slice(0, 180).trim();
  const date = url.searchParams.get("date")?.trim();
  const time = url.searchParams.get("time")?.trim() || undefined;
  const reminderMinutes = Number(url.searchParams.get("reminderMinutes") ?? "0");
  const notes = url.searchParams.get("notes")?.slice(0, 1000).trim() || undefined;
  const contentType = url.searchParams.get("contentType") as ContentType | null;
  const contentRouteType = url.searchParams.get("contentRouteType")?.slice(0, 80).trim();
  const contentId = url.searchParams.get("contentId")?.slice(0, 120).trim();

  if (!title) return badRequest("Missing title");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return badRequest("Invalid date");
  if (time && !/^\d{2}:\d{2}$/.test(time)) return badRequest("Invalid time");
  if (!Number.isFinite(reminderMinutes) || reminderMinutes < 0 || reminderMinutes > 10080) return badRequest("Invalid reminder");
  if (contentType !== "workout" && contentType !== "program") return badRequest("Invalid content type");
  if (!contentRouteType) return badRequest("Missing content route type");
  if (!contentId) return badRequest("Missing content id");

  return { title, date, time, reminderMinutes, notes, contentType, contentRouteType, contentId };
}

serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const parsed = parseParams(new URL(req.url));
  if (parsed instanceof Response) return parsed;

  const ics = generateICSFile(parsed);
  const filename = `${sanitizeTitle(parsed.title).replace(/[^a-zA-Z0-9]/g, "_") || "smartygym_event"}.ics`;

  return new Response(ics, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});