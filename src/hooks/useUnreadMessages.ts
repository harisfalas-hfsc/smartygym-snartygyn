import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Return 0 for guests - this is NOT an error
        if (!session?.user) {
          return 0;
        }

        const userId = session.user.id;

        // Count unread system messages
        const { count: systemCount, error: systemError } = await supabase
          .from('user_system_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false);

        if (systemError) throw systemError;

        // Count unread responses in contact messages
        const { count: contactCount, error: contactError } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .not('response', 'is', null)
          .is('response_read_at', null);

        if (contactError) throw contactError;

        return (systemCount || 0) + (contactCount || 0);
      } catch (error: any) {
        console.error('[useUnreadMessages] Query failed:', error);
        return 0;
      }
    },
    refetchInterval: 30000,
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('Auth') || error?.code === 'PGRST301') return false;
      return failureCount < 2;
    },
    staleTime: 25000,
  });

  // Real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userId = session.user.id;

      const channel = supabase
        .channel(`user-messages-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_system_messages",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "contact_messages",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["unread-messages-count"] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, [queryClient]);

  return query;
};
