import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildHostedICSUrl, downloadICSFile, generateICSFile } from "@/utils/calendarExport";

const originalUserAgent = navigator.userAgent;

function setUserAgent(userAgent: string) {
  Object.defineProperty(navigator, "userAgent", {
    value: userAgent,
    configurable: true,
  });
}

describe("calendar export", () => {
  beforeEach(() => {
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:calendar-file");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  afterEach(() => {
    setUserAgent(originalUserAgent);
    vi.restoreAllMocks();
    delete (navigator as Navigator & { share?: unknown }).share;
    delete (navigator as Navigator & { canShare?: unknown }).canShare;
  });

  it("builds an ICS event with title, description, reminder, and workout link", () => {
    const ics = generateICSFile({
      title: "Completed: Kinetic Cascade Circuit",
      date: "2026-06-15",
      time: "08:30",
      reminderMinutes: 30,
      notes: "Great session",
      contentType: "workout",
      contentRouteType: "circuit",
      contentId: "workout-123",
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Completed: Kinetic Cascade Circuit");
    expect(ics).toContain("DESCRIPTION:Great session\\nOpen in SmartyGym: https://smartygym.lovable.app/workout/circuit/workout-123");
    expect(ics).toContain("URL:https://smartygym.lovable.app/workout/circuit/workout-123");
    expect(ics).toContain("TRIGGER:-PT30M");
  });

  it("uses native file sharing for Android APK/WebView calendars", async () => {
    setUserAgent("Mozilla/5.0 (Linux; Android 14; Pixel Build/AP2A; wv) AppleWebKit/537.36 Version/4.0 Chrome/124 Mobile Safari/537.36");
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    Object.defineProperty(navigator, "canShare", { value: canShare, configurable: true });

    const result = await downloadICSFile("BEGIN:VCALENDAR\r\nEND:VCALENDAR", "Completed Workout");

    expect(result).toEqual({ success: true, method: "native-share" });
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Completed Workout",
        files: [expect.any(File)],
      }),
    );
  });

  it("builds a real hosted ICS URL for app WebViews instead of a generated blob URL", () => {
    const url = buildHostedICSUrl({
      title: "Granite Flow Restore",
      date: "2026-06-16",
      time: "09:00",
      reminderMinutes: 30,
      contentType: "workout",
      contentRouteType: "recovery",
      contentId: "granite-flow-restore",
    });

    expect(url).toContain("/functions/v1/generate-calendar-ics?");
    expect(url).toContain("title=Granite+Flow+Restore");
    expect(url).toContain("date=2026-06-16");
    expect(url).toContain("time=09%3A00");
    expect(url).toContain("contentId=granite-flow-restore");
  });

  it("does not close the dialog flow when the mobile share sheet is cancelled", async () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148");
    const abort = new DOMException("Share cancelled", "AbortError");
    Object.defineProperty(navigator, "share", { value: vi.fn().mockRejectedValue(abort), configurable: true });
    Object.defineProperty(navigator, "canShare", { value: vi.fn().mockReturnValue(true), configurable: true });

    const result = await downloadICSFile("BEGIN:VCALENDAR\r\nEND:VCALENDAR", "Scheduled Workout");

    expect(result.success).toBe(false);
    expect(result.method).toBe("native-share");
  });

  it("keeps normal browser ICS downloads for desktop Chrome", async () => {
    setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36");
    const click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      click,
      set href(_value: string) {},
      set download(_value: string) {},
      set rel(_value: string) {},
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);

    const result = await downloadICSFile("BEGIN:VCALENDAR\r\nEND:VCALENDAR", "Browser Workout");

    expect(result).toEqual({ success: true, method: "browser-download" });
    expect(click).toHaveBeenCalledTimes(1);
  });
});