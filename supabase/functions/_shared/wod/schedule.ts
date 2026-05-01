/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * WOD SCHEDULE — Cyprus-date math + periodization lookup wrapper.
 * Re-exports the existing single source of truth so callers can `import
 * from "_shared/wod/schedule.ts"` without knowing the underlying file name.
 * Behavior unchanged.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export {
  getDayIn84Cycle,
  getPeriodizationForDay,
  getCategoryForDay,
  getRandomStarFromRange,
  starsToLevel,
  type PeriodizationDay,
} from "../periodization-84day.ts";

/** Today's date in Cyprus (Europe/Athens), as YYYY-MM-DD. DST-safe. */
export function cyprusToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Athens",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** YYYY-MM-DD for `daysAhead` days after Cyprus today. */
export function cyprusDateOffset(daysAhead: number, now: Date = new Date()): string {
  const base = new Date(cyprusToday(now) + "T00:00:00Z");
  base.setUTCDate(base.getUTCDate() + daysAhead);
  return base.toISOString().slice(0, 10);
}