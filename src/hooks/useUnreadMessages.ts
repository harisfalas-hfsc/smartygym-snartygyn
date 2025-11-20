import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = () => {
  return useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      try {
        // Get current session (doesn't throw for guests)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Return 0 for guests - this is NOT an error
        if (!session?.user) {
          console.log('[useUnreadMessages] No active session, returning 0 (expected for guests)');
          return 0;
        }

        const userId = session.user.id;

        // Count unread system messages
        const { count: systemCount, error: systemError } = await supabase
          .from('user_system_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (systemError) {
          console.error('[useUnreadMessages] System messages error:', {
            message: systemError.message,
            code: systemError.code,
            details: systemError.details
          });
          throw systemError;
        }

        // Count unread responses in contact messages
        const { count: contactCount, error: contactError } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('response', 'is', null)
          .is('response_read_at', null);

        if (contactError) {
          console.error('[useUnreadMessages] Contact messages error:', {
            message: contactError.message,
            code: contactError.code,
            details: contactError.details
          });
          throw contactError;
        }

        const total = (systemCount || 0) + (contactCount || 0);
        console.log('[useUnreadMessages] Unread count:', { systemCount, contactCount, total, userId });
        return total;
      } catch (error: any) {
        // Log error but return 0 instead of breaking the UI
        console.error('[useUnreadMessages] Query failed:', {
          error,
          message: error?.message,
          code: error?.code
        });
        return 0;
      }
    },
    // Refetch every 30 seconds
    refetchInterval: 30000,
    // Don't retry on auth errors
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Auth') || error?.code === 'PGRST301') return false;
      return failureCount < 2;
    },
    // Cache for 25 seconds to reduce requests
    staleTime: 25000,
  });
};
