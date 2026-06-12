/**
 * Centralised 3-channel notification preference helper.
 *
 * Pref shape (per user, stored in profiles.notification_preferences):
 * {
 *   opt_out_all: boolean,
 *   <automation_key>: { email: boolean, dashboard: boolean, push: boolean },
 *   ...
 * }
 *
 * All user-controllable senders MUST call `canSend(prefs, key, channel)`
 * before delivering on each channel. Always-on senders (welcome, purchases,
 * renewal, expiry, holiday, support, security) skip this check.
 */

export type Channel = "email" | "dashboard" | "push";

export type AutomationKey =
  | "morning_daily_digest"
  | "monday_motivation"
  | "new_workout"
  | "new_program"
  | "new_article"
  | "weekly_activity_report"
  | "checkin_reminder"
  | "scheduled_workout_reminder"
  | "scheduled_program_reminder"
  | "goal_achievement"
  | "welcome_onboarding";

export interface NotificationPreferences {
  opt_out_all?: boolean;
  [key: string]: any;
}

// Legacy key fallback map (read-side compatibility for in-flight users
// whose row was created between migration moments). Defaults to true.
const LEGACY_FALLBACK: Record<AutomationKey, { email: string[]; dashboard: string[] }> = {
  morning_daily_digest: {
    email: ["email_wod", "email_ritual"],
    dashboard: ["dashboard_wod", "dashboard_ritual"],
  },
  monday_motivation: { email: ["email_monday_motivation"], dashboard: ["dashboard_monday_motivation"] },
  new_workout: { email: ["email_new_workout"], dashboard: ["dashboard_new_workout"] },
  new_program: { email: ["email_new_program"], dashboard: ["dashboard_new_program"] },
  new_article: { email: ["email_new_article"], dashboard: ["dashboard_new_article"] },
  weekly_activity_report: {
    email: ["email_weekly_activity"],
    dashboard: ["dashboard_weekly_activity"],
  },
  checkin_reminder: {
    email: ["email_checkin_reminders", "checkin_reminders"],
    dashboard: ["dashboard_checkin_reminders"],
  },
  scheduled_workout_reminder: {
    email: ["email_scheduled_workout_reminders"],
    dashboard: [],
  },
  scheduled_program_reminder: {
    email: ["email_scheduled_program_reminders"],
    dashboard: [],
  },
  goal_achievement: { email: ["email_goal_achievement"], dashboard: [] },
  welcome_onboarding: { email: ["email_welcome_onboarding"], dashboard: [] },
};

/**
 * Decide whether a single channel can be used for a user + automation.
 * - Honours `opt_out_all` master switch.
 * - Uses the new nested shape if present.
 * - Falls back to legacy flat keys (defaulting to TRUE = receive) if not.
 */
export function canSend(
  prefs: NotificationPreferences | null | undefined,
  key: AutomationKey,
  channel: Channel
): boolean {
  if (!prefs) return true; // No prefs row = receive everything (safe default for new users)
  if (prefs.opt_out_all === true) return false;

  const node = prefs[key];
  if (node && typeof node === "object") {
    const v = node[channel];
    return v !== false; // default ON when key exists but channel missing
  }

  // Legacy fallback (returns true unless explicitly false on every legacy key)
  if (channel === "push") {
    return prefs.push !== false;
  }
  const legacyKeys = LEGACY_FALLBACK[key]?.[channel] ?? [];
  if (legacyKeys.length === 0) return true;
  // ALL legacy keys must be NOT false to consider channel enabled
  return legacyKeys.every((k) => prefs[k] !== false);
}

export function anyChannelEnabled(
  prefs: NotificationPreferences | null | undefined,
  key: AutomationKey
): boolean {
  return (
    canSend(prefs, key, "email") ||
    canSend(prefs, key, "dashboard") ||
    canSend(prefs, key, "push")
  );
}