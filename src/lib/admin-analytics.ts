/**
 * Centralized admin-analytics counting rules.
 * Every analytics screen MUST use these helpers so that numbers match the
 * live product (e.g. /workouts library, subscription pages, etc.).
 */
import { supabase } from "@/integrations/supabase/client";

// ---------- Bot / preview traffic exclusions ----------
// Keep this list in sync between the overview card, Website tab and Social tab.
const BOT_PATTERNS = [
  "%lovable%",
  "%bot%",
  "%crawler%",
  "%spider%",
  "%meta-external%",
  "%adsbot%",
  "%facebookexternalhit%",
  "%semrush%",
  "%ahrefs%",
] as const;

/**
 * Apply the canonical bot/preview filter to a social_media_analytics query.
 */
export function applyBotFilter<T extends { not: (col: string, op: string, val: string) => T }>(query: T): T {
  let q = query;
  for (const p of BOT_PATTERNS) {
    q = q.not("browser_info", "ilike", p);
  }
  return q;
}

// ---------- Workout library counting ----------

export interface WorkoutLibraryCounts {
  /** Visible non-WOD library workouts — matches the public /workouts page. */
  availableWorkouts: number;
  /** Visible workouts including active WODs. */
  visibleWorkoutsIncludingWOD: number;
  /** Currently active Workout-of-the-Day rows. */
  activeWODs: number;
  /** Hidden (admin-only / draft) workouts. */
  hiddenWorkouts: number;
  /** Raw row count in admin_workouts. */
  totalRows: number;
}

export async function fetchWorkoutLibraryCounts(): Promise<WorkoutLibraryCounts> {
  const [{ count: totalRows }, { count: visibleIncludingWOD }, { count: activeWODs }, { count: hidden }] =
    await Promise.all([
      supabase.from("admin_workouts").select("id", { count: "exact", head: true }),
      supabase
        .from("admin_workouts")
        .select("id", { count: "exact", head: true })
        .neq("is_visible", false),
      supabase
        .from("admin_workouts")
        .select("id", { count: "exact", head: true })
        .eq("is_workout_of_day", true),
      supabase
        .from("admin_workouts")
        .select("id", { count: "exact", head: true })
        .eq("is_visible", false),
    ]);

  const visibleIncludingWODNum = visibleIncludingWOD ?? 0;
  const activeWODsNum = activeWODs ?? 0;

  return {
    totalRows: totalRows ?? 0,
    visibleWorkoutsIncludingWOD: visibleIncludingWODNum,
    activeWODs: activeWODsNum,
    hiddenWorkouts: hidden ?? 0,
    // Library = visible AND not active WOD (matches /workouts page rules)
    availableWorkouts: Math.max(visibleIncludingWODNum - activeWODsNum, 0),
  };
}

export async function fetchAvailableProgramsCount(): Promise<number> {
  const { count } = await supabase
    .from("admin_training_programs")
    .select("id", { count: "exact", head: true })
    .neq("is_visible", false);
  return count ?? 0;
}

export async function fetchAvailableRitualsCount(): Promise<number> {
  const { count } = await supabase
    .from("daily_smarty_rituals")
    .select("id", { count: "exact", head: true })
    .neq("is_visible", false);
  return count ?? 0;
}

// ---------- Subscription / user counting ----------

export interface SubscriptionRow {
  user_id?: string | null;
  plan_type: string | null;
  status: string | null;
  stripe_subscription_id?: string | null;
}

export interface PremiumCounts {
  /** All active gold|platinum subscribers (paid + complimentary). */
  activePremiumSubscribers: number;
  /** Active premium with a real Stripe subscription id. */
  paidSubscribers: number;
  /** Active premium WITHOUT a Stripe subscription id (manual / comp). */
  manualSubscribers: number;
  /** Distinct user_ids that hold an active premium subscription. */
  distinctPremiumUsers: number;
}

export function computePremiumCounts(subs: SubscriptionRow[] | null | undefined): PremiumCounts {
  const list = subs ?? [];
  const isActivePremium = (s: SubscriptionRow) =>
    s.status === "active" && (s.plan_type === "gold" || s.plan_type === "platinum");

  const active = list.filter(isActivePremium);
  const paid = active.filter((s) => !!s.stripe_subscription_id);
  const manual = active.filter((s) => !s.stripe_subscription_id);
  const distinctUsers = new Set(active.map((s) => s.user_id).filter(Boolean));

  return {
    activePremiumSubscribers: active.length,
    paidSubscribers: paid.length,
    manualSubscribers: manual.length,
    distinctPremiumUsers: distinctUsers.size,
  };
}

/**
 * Non-premium users = total profile accounts minus distinct active premium users.
 * This matches "everyone who is NOT currently a paying / comp premium member".
 */
export function computeNonPremiumUsers(totalUsers: number, distinctPremiumUsers: number): number {
  return Math.max(totalUsers - distinctPremiumUsers, 0);
}

// ---------- Website visitors (filtered) ----------

/**
 * Canonical "real" website visitor count for a date window.
 * Excludes preview/Lovable traffic, bots, crawlers and known scrapers.
 * Used by the dashboard overview card, Website tab, Social tab and report export.
 */
export async function fetchFilteredVisitorCount(
  startDate: Date,
  endDate: Date = new Date(),
): Promise<number> {
  let query = supabase
    .from("social_media_analytics")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "visit")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString());

  query = applyBotFilter(query as any) as typeof query;

  const { count } = await query;
  return count ?? 0;
}
