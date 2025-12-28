import { formatInTimeZone } from "date-fns-tz";

// Cyprus uses Europe/Athens timezone (same as Greece - EET/EEST)
const CYPRUS_TIMEZONE = "Europe/Athens";

/**
 * Get today's date string in Cyprus timezone (YYYY-MM-DD format)
 * This ensures consistent date filtering across all WOD-related components
 */
export const getCyprusTodayStr = (): string => {
  return formatInTimeZone(new Date(), CYPRUS_TIMEZONE, "yyyy-MM-dd");
};

/**
 * Get the current hour in Cyprus timezone (0-23)
 * Useful for determining if we're past WOD generation time
 */
export const getCyprusHour = (): number => {
  return parseInt(formatInTimeZone(new Date(), CYPRUS_TIMEZONE, "H"), 10);
};

/**
 * Get Cyprus timezone offset from UTC (2 in winter, 3 in summer)
 * Uses the same DST logic as the backend cron job manager
 */
export const getCyprusOffset = (): number => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  
  // DST in Cyprus: Last Sunday of March to Last Sunday of October
  // Simplified: April-October = summer (UTC+3), November-March = winter (UTC+2)
  if (month >= 4 && month <= 10) {
    return 3; // Summer time (EEST)
  }
  return 2; // Winter time (EET)
};

/**
 * Convert Cyprus hour to UTC hour
 */
export const cyprusToUtc = (cyprusHour: number): number => {
  const offset = getCyprusOffset();
  return (cyprusHour - offset + 24) % 24;
};

/**
 * Convert UTC hour to Cyprus hour
 */
export const utcToCyprus = (utcHour: number): number => {
  const offset = getCyprusOffset();
  return (utcHour + offset) % 24;
};

export { CYPRUS_TIMEZONE };
