import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WODAnnouncementModal } from "./WODAnnouncementModal";
import { RitualAnnouncementModal } from "./RitualAnnouncementModal";
import { getCyprusTodayStr, getCyprusHour } from "@/lib/cyprusDate";

// Polling interval for checking if WODs exist (3 minutes)
const WOD_CHECK_INTERVAL_MS = 3 * 60 * 1000;
// Stop checking after 06:00 Cyprus time (failsafe)
const WOD_CHECK_CUTOFF_HOUR = 6;

export const AnnouncementManager = () => {
  const [showWODModal, setShowWODModal] = useState(false);
  const [showRitualModal, setShowRitualModal] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedRef = useRef(false);

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

  // Initialize on mount
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const init = async () => {
      const wodShownKey = getTodayKey("wod_announcement_shown");
      const wodAlreadyShown = localStorage.getItem(wodShownKey) === "true";
      
      if (wodAlreadyShown) {
        // Already shown today, don't do anything for WOD modal
        return;
      }

      // Small delay to let page render first
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if WODs exist now
      const wodsExist = await checkTodaysWODsExist();
      
      if (wodsExist) {
        // WODs exist, show modal immediately
        setShowWODModal(true);
      } else {
        // WODs don't exist yet - check if we're past cutoff
        const cyprusHour = getCyprusHour();
        
        if (cyprusHour < WOD_CHECK_CUTOFF_HOUR) {
          // Before cutoff, start polling
          console.log("Starting WOD polling - WODs not ready yet, hour:", cyprusHour);
          
          pollingIntervalRef.current = setInterval(async () => {
            await tryShowWODModal();
          }, WOD_CHECK_INTERVAL_MS);
        } else {
          console.log("Not starting WOD polling - past cutoff hour:", cyprusHour);
        }
      }
    };

    init();

    return () => {
      stopPolling();
    };
  }, [tryShowWODModal, stopPolling]);

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

    // Start 40 second timer for Ritual popup
    setTimeout(() => {
      setShowRitualModal(true);
    }, 40000);
  }, [stopPolling]);

  // Handle Ritual modal close
  const handleRitualClose = useCallback((dontShowAgain?: boolean) => {
    setShowRitualModal(false);
    
    // Mark Ritual modal as shown today (using Cyprus date)
    const ritualShownKey = getTodayKey("ritual_announcement_shown");
    localStorage.setItem(ritualShownKey, "true");
    
    if (dontShowAgain) {
      const ritualDontShowKey = getTodayKey("ritual_dont_show");
      localStorage.setItem(ritualDontShowKey, "true");
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
    </>
  );
};
