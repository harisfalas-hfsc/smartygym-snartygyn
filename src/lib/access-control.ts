import { supabase } from "@/integrations/supabase/client";

export type UserTier = "guest" | "subscriber" | "premium";

export interface AccessCheckParams {
  userId: string | null;
  userTier: UserTier;
  purchasedContent: Set<string>;
  contentType: string;
  contentId?: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  requiresAuth?: boolean;
  requiresPremium?: boolean;
  canPurchase?: boolean;
}

/**
 * Centralized access control logic
 * CRITICAL: Premium users get access to ALL content, cannot purchase standalone
 */
export async function canUserAccessContent(
  params: AccessCheckParams
): Promise<AccessCheckResult> {
  const { userId, userTier, purchasedContent, contentType, contentId } = params;

  // PUBLIC CONTENT - accessible to all
  const publicContentTypes = ["exercise-library", "blog", "about", "faq"];
  if (publicContentTypes.includes(contentType)) {
    return { allowed: true, canPurchase: false };
  }

  // GUESTS - can only see public content
  if (userTier === "guest") {
    return {
      allowed: false,
      requiresAuth: true,
      reason: "Please log in to access this content",
      canPurchase: false,
    };
  }

  // Check if content was individually purchased
  if (contentId && purchasedContent.has(`${contentType}:${contentId}`)) {
    return { allowed: true, canPurchase: false, reason: "Purchased" };
  }

  // PREMIUM USERS - can access everything, CANNOT purchase
  if (userTier === "premium") {
    return {
      allowed: true,
      canPurchase: false,
      reason: "Included in premium subscription",
    };
  }

  // SUBSCRIBERS (FREE USERS) - need database verification for premium content
  if (userTier === "subscriber") {
    // Allow access to free resources
    const freeContentTypes = ["tool", "calculator", "dashboard"];
    if (freeContentTypes.includes(contentType)) {
      return { allowed: true, canPurchase: false };
    }

    // For workouts and programs, check database for is_premium flag
    if (contentId && (contentType === "workout" || contentType === "program")) {
      const tableName =
        contentType === "workout" ? "admin_workouts" : "admin_training_programs";

      const { data: content, error } = await supabase
        .from(tableName)
        .select("is_premium, is_standalone_purchase, price")
        .eq("id", contentId)
        .maybeSingle();

      if (error || !content) {
        return {
          allowed: false,
          reason: "Content not found",
          canPurchase: false,
        };
      }

      // If content is free, allow access
      if (!content.is_premium) {
        return { allowed: true, canPurchase: false };
      }

      // If content is premium, deny access but allow purchase if enabled
      return {
        allowed: false,
        requiresPremium: true,
        canPurchase: content.is_standalone_purchase && content.price > 0,
        reason: "This content requires a premium subscription or individual purchase",
      };
    }

    // Default deny for subscribers on premium content
    return {
      allowed: false,
      requiresPremium: true,
      canPurchase: false,
      reason: "Upgrade to premium to access this content",
    };
  }

  // Default deny
  return { allowed: false, canPurchase: false };
}

/**
 * Check if user can purchase specific content
 * CRITICAL: Premium users CANNOT purchase
 */
export function canPurchaseContent(userTier: UserTier, hasPurchased: boolean): boolean {
  // Premium users cannot purchase (everything included)
  if (userTier === "premium") {
    return false;
  }

  // Guests cannot purchase (need account first)
  if (userTier === "guest") {
    return false;
  }

  // Already purchased
  if (hasPurchased) {
    return false;
  }

  // Free subscribers can purchase
  return userTier === "subscriber";
}
