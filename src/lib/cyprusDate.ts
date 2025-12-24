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

export { CYPRUS_TIMEZONE };
