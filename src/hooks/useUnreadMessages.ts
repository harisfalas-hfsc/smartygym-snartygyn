import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // Track auth state so the query re-runs immediately after login
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      queryClient.invalidateQueries({ queryKey: ['unread-messages-count'] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const query = useQuery({
    queryKey: ['unread-messages-count', userId],
    enabled: !!userId,
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

        // Count unread contact threads that have either a saved response or history replies
        const { data: contactThreads, error: contactError } = await supabase
          .from('contact_messages')
          .select('id, response, response_read_at')
          .eq('user_id', userId)
          .is('response_read_at', null);

        if (contactError) throw contactError;

        const contactThreadIds = (contactThreads || []).map((thread) => thread.id);
        let historyReplyIds = new Set<string>();

        if (contactThreadIds.length > 0) {
          const { data: historyReplies, error: historyError } = await supabase
            .from('contact_message_history')
            .select('contact_message_id')
            .in('contact_message_id', contactThreadIds)
            .neq('sender', 'customer');

          if (historyError) throw historyError;
          historyReplyIds = new Set((historyReplies || []).map((reply) => reply.contact_message_id));
        }

        const contactCount = (contactThreads || []).filter((thread) => Boolean(thread.response) || historyReplyIds.has(thread.id)).length;

        return (systemCount || 0) + contactCount;
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
