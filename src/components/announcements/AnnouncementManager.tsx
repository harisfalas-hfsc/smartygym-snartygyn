import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WODAnnouncementModal } from "./WODAnnouncementModal";
import { RitualAnnouncementModal } from "./RitualAnnouncementModal";
import { FirstSubscriptionPromoModal } from "./FirstSubscriptionPromoModal";
import { getCyprusTodayStr, getCyprusHour } from "@/lib/cyprusDate";
import { useFirstSubscriptionPromoEligibility } from "@/hooks/useFirstSubscriptionPromoEligibility";

// Polling interval for checking if WODs exist (3 minutes)
const WOD_CHECK_INTERVAL_MS = 3 * 60 * 1000;
// Stop checking after 06:00 Cyprus time (failsafe)
const WOD_CHECK_CUTOFF_HOUR = 6;
// Delay for Ritual modal after WOD modal closes (10 seconds)
const RITUAL_DELAY_MS = 10 * 1000;
// Delay for First Subscription Promo modal after Ritual modal closes (10 seconds)
const PROMO_DELAY_MS = 10 * 1000;

export const AnnouncementManager = () => {
  const [showWODModal, setShowWODModal] = useState(false);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);
  
  // Check if user is eligible for first-time subscription promo
  const { isEligible: isPromoEligible, isLoading: isPromoLoading } = useFirstSubscriptionPromoEligibility();

  const getTodayKey = (prefix: string) => {
    // Use Cyprus date for localStorage keys to ensure consistency
    const cyprusToday = getCyprusTodayStr();
    return `${prefix}_${cyprusToday}`;
  };

  // Check if today's WODs exist (Cyprus date)
  const checkTodaysWODsExist = async (): Promise<boolean> => {
    try {
      const cyprusToday = getCyprusTodayStr();
      const { data, error } = await supabase
        .from("admin_workouts")
        .select("id")
        .eq("is_workout_of_day", true)
        .eq("generated_for_date", cyprusToday)
        .limit(1);
      
      if (error) {
        console.error("Error checking WODs:", error);
        return false;
      }
      
      return (data?.length || 0) > 0;
    } catch (err) {
      console.error("Error in checkTodaysWODsExist:", err);
      return false;
    }
  };

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Handle showing the WOD modal when WODs are available
  const tryShowWODModal = useCallback(async () => {
    const wodShownKey = getTodayKey("wod_announcement_shown");
    const wodAlreadyShown = localStorage.getItem(wodShownKey) === "true";
    
    if (wodAlreadyShown) {
      stopPolling();
      return;
    }

    const wodsExist = await checkTodaysWODsExist();
    
    if (wodsExist) {
      // WODs exist! Show the modal
      stopPolling();
      setShowWODModal(true);
    } else {
      // WODs don't exist yet - check if we should keep polling
      const cyprusHour = getCyprusHour();
      
      if (cyprusHour >= WOD_CHECK_CUTOFF_HOUR) {
        // Past cutoff time, stop polling (generation likely failed)
        stopPolling();
        console.log("WOD check stopped: past cutoff hour", cyprusHour);
      }
      // Otherwise, keep polling (interval will check again)
    }
  }, [stopPolling]);

  // Trigger Promo modal directly (when previous modals are skipped)
  const triggerPromoModalIfNeeded = useCallback(() => {
    if (!isPromoEligible || isPromoLoading) {
      console.log("[AnnouncementManager] Promo not eligible or still loading", { isPromoEligible, isPromoLoading });
      return;
    }

    const promoShownKey = getTodayKey("first_subscription_promo_shown");
    const promoAlreadyShown = localStorage.getItem(promoShownKey) === "true";
    const promoDontShow = localStorage.getItem(getTodayKey("first_subscription_promo_dont_show")) === "true";

    if (promoAlreadyShown || promoDontShow) {
      console.log("[AnnouncementManager] Promo already shown or don't show - skipping");
      return;
    }

    console.log("[AnnouncementManager] Triggering Promo modal directly");
    setTimeout(() => {
      setShowPromoModal(true);
    }, 2000);
  }, [isPromoEligible, isPromoLoading]);

  // Trigger Ritual modal (when WOD is skipped or not available)
  const triggerRitualModalIfNeeded = useCallback(() => {
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    const ritualAlreadyShown = localStorage.getItem(ritualShownKey) === "true";
    const ritualDontShow = localStorage.getItem(getTodayKey("ritual_dont_show")) === "true";

    if (ritualAlreadyShown || ritualDontShow) {
      console.log("[AnnouncementManager] Ritual already shown or don't show - skipping");
      // Check if we should show promo instead
      triggerPromoModalIfNeeded();
      return;
    }

    console.log("[AnnouncementManager] Triggering Ritual modal (WOD was skipped/unavailable)");
    setTimeout(() => {
      setShowRitualModal(true);
    }, 2000); // Short delay when no WOD
  }, [triggerPromoModalIfNeeded]);

  // Initialize on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const init = async () => {
      const wodShownKey = getTodayKey("wod_announcement_shown");
      const wodAlreadyShown = localStorage.getItem(wodShownKey) === "true";
      
      // Small delay to let page render first
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (wodAlreadyShown) {
        // WOD already shown today, check if Ritual/Promo should show
        console.log("[AnnouncementManager] WOD already shown today - checking Ritual/Promo");
        triggerRitualModalIfNeeded();
        return;
      }

      // Check if WODs exist now
      const wodsExist = await checkTodaysWODsExist();
      const cyprusHour = getCyprusHour();
      
      if (wodsExist) {
        // WODs exist, show modal immediately
        console.log("[AnnouncementManager] WODs exist - showing WOD modal");
        setShowWODModal(true);
      } else if (cyprusHour < WOD_CHECK_CUTOFF_HOUR) {
        // Before cutoff, start polling
        console.log("[AnnouncementManager] Starting WOD polling - WODs not ready yet, hour:", cyprusHour);
        
        pollingIntervalRef.current = setInterval(async () => {
          await tryShowWODModal();
        }, WOD_CHECK_INTERVAL_MS);
      } else {
        // Past cutoff, WOD generation likely failed - still show Ritual/Promo
        console.log("[AnnouncementManager] Past cutoff hour, no WOD - triggering Ritual/Promo flow");
        triggerRitualModalIfNeeded();
      }
    };

    init();

    return () => {
      stopPolling();
    };
  }, [tryShowWODModal, stopPolling, triggerRitualModalIfNeeded]);

  // Handle WOD modal close - mark as shown and start timer for Ritual modal
  const handleWODClose = useCallback((dontShowAgain?: boolean) => {
    setShowWODModal(false);
    stopPolling();
    
    // Mark WOD modal as shown today (using Cyprus date)
    const wodShownKey = getTodayKey("wod_announcement_shown");
    localStorage.setItem(wodShownKey, "true");
    
    if (dontShowAgain) {
      const wodDontShowKey = getTodayKey("wod_dont_show");
      localStorage.setItem(wodDontShowKey, "true");
    }

    // Check if Ritual modal should show
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    const ritualAlreadyShown = localStorage.getItem(ritualShownKey) === "true";
    const ritualDontShow = localStorage.getItem(getTodayKey("ritual_dont_show")) === "true";

    if (ritualAlreadyShown || ritualDontShow) return;

    // Start 20 second timer for Ritual popup
    setTimeout(() => {
      setShowRitualModal(true);
    }, RITUAL_DELAY_MS);
  }, [stopPolling]);

  // Handle Ritual modal close - start timer for First Subscription Promo modal
  const handleRitualClose = useCallback((dontShowAgain?: boolean) => {
    setShowRitualModal(false);
    
    // Mark Ritual modal as shown today (using Cyprus date)
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    localStorage.setItem(ritualShownKey, "true");
    
    if (dontShowAgain) {
      const ritualDontShowKey = getTodayKey("ritual_dont_show");
      localStorage.setItem(ritualDontShowKey, "true");
    }

    // Check if Promo modal should show (only if user is eligible)
    if (!isPromoEligible || isPromoLoading) return;

    const promoShownKey = getTodayKey("first_subscription_promo_shown");
    const promoAlreadyShown = localStorage.getItem(promoShownKey) === "true";
    const promoDontShow = localStorage.getItem(getTodayKey("first_subscription_promo_dont_show")) === "true";

    if (promoAlreadyShown || promoDontShow) return;

    // Start 20 second timer for First Subscription Promo popup
    setTimeout(() => {
      setShowPromoModal(true);
    }, PROMO_DELAY_MS);
  }, [isPromoEligible, isPromoLoading]);

  // Handle Promo modal close
  const handlePromoClose = useCallback((dontShowAgain?: boolean) => {
    setShowPromoModal(false);
    
    // Mark Promo modal as shown today (using Cyprus date)
    const promoShownKey = getTodayKey("first_subscription_promo_shown");
    localStorage.setItem(promoShownKey, "true");
    
    if (dontShowAgain) {
      const promoDontShowKey = getTodayKey("first_subscription_promo_dont_show");
      localStorage.setItem(promoDontShowKey, "true");
    }
  }, []);

  return (
    <>
      <WODAnnouncementModal 
        open={showWODModal} 
        onClose={handleWODClose} 
      />
      <RitualAnnouncementModal 
        open={showRitualModal} 
        onClose={handleRitualClose} 
      />
      <FirstSubscriptionPromoModal 
        open={showPromoModal} 
        onClose={handlePromoClose} 
      />
    </>
  );
};
