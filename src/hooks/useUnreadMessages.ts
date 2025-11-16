import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useUnreadMessages = () => {
  const query = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('[useUnreadMessages] Auth error:', userError);
        throw userError;
      }
      
      if (!user) {
        console.log('[useUnreadMessages] No authenticated user');
        return 0;
      }

      // Count unread system messages
      const { count: systemCount, error: systemError } = await supabase
        .from('user_system_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (systemError) {
        console.error('[useUnreadMessages] System messages error:', systemError);
      }

      // Count unread responses in contact messages
      const { count: contactCount, error: contactError } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('response', 'is', null)
        .is('response_read_at', null);

      if (contactError) {
        console.error('[useUnreadMessages] Contact messages error:', contactError);
      }

      const total = (systemCount || 0) + (contactCount || 0);
      console.log('[useUnreadMessages] Unread count:', { systemCount, contactCount, total });
      return total;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: 1000,
  });

  // Set up real-time subscriptions for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('unread-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_system_messages',
        },
        (payload) => {
          console.log('[useUnreadMessages] System message change:', payload);
          query.refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages',
        },
        (payload) => {
          console.log('[useUnreadMessages] Contact message change:', payload);
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query.refetch]);

  return query;
};
