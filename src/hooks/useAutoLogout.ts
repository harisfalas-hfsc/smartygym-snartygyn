import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const WARNING_TIME = 10 * 60 * 1000; // 10 minutes before logout

export const useAutoLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [inactivityTimeout, setInactivityTimeout] = useState<number>(24 * 60 * 60 * 1000); // 24 hours default

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Auto-logout error:', error);
    }
  };

  const resetTimer = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (show warning 2 minutes before logout)
    const warningTime = inactivityTimeout - WARNING_TIME;
    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        showWarning();
      }, warningTime);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, inactivityTimeout);
  };

  const showWarning = () => {
    toast({
      title: "⚠️ Session Expiring Soon",
      description: "You'll be logged out in 10 minutes due to inactivity. Click anywhere to stay logged in.",
      duration: 600000, // Show for 10 minutes
    });
  };

  useEffect(() => {
    // Fetch inactivity timeout from database
    const fetchTimeout = async () => {
      // First check if user has custom session duration (Remember Me)
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Note: custom_session_duration column needs to be added via migration
        // For now, just use system default
      }
      
      // Use system default
      const { data } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'inactivity_timeout_minutes')
        .single();
      
      if (data?.setting_value) {
        const minutes = parseInt(data.setting_value as string);
        setInactivityTimeout(minutes * 60 * 1000);
      }
    };

    fetchTimeout();

    // Activity events to track
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Reset timer on any activity
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Initialize timer
    resetTimer();

    // Handle visibility change (tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Start a stricter timer when tab is hidden
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          logout();
        }, inactivityTimeout);
      } else {
        // Reset timer when tab becomes visible again
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [navigate, inactivityTimeout]);
};
