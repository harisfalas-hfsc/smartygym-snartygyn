import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WODAnnouncementModal } from "./WODAnnouncementModal";
import { RitualAnnouncementModal } from "./RitualAnnouncementModal";
import { format } from "date-fns";

export const AnnouncementManager = () => {
  const [showWODModal, setShowWODModal] = useState(false);
  const [showRitualModal, setShowRitualModal] = useState(false);

  const getTodayKey = (prefix: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return `${prefix}_${today}`;
  };

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check WOD modal already shown today
      const wodShownKey = getTodayKey("wod_announcement_shown");
      const wodAlreadyShown = localStorage.getItem(wodShownKey) === "true";

      // Show WOD modal if not already shown today
      if (!wodAlreadyShown) {
        // Small delay to let page render first
        setTimeout(() => setShowWODModal(true), 1000);
      }
    };

    init();
  }, []);

  // Handle WOD modal close - start timer for Ritual modal
  const handleWODClose = useCallback((dontShowAgain?: boolean) => {
    setShowWODModal(false);
    
    // Mark WOD modal as shown today
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
  }, []);

  // Handle Ritual modal close
  const handleRitualClose = useCallback((dontShowAgain?: boolean) => {
    setShowRitualModal(false);
    
    // Mark Ritual modal as shown today
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
