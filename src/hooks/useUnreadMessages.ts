import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadMessages = () => {
  return useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      // Count unread system messages
      const { count: systemCount } = await supabase
        .from('user_system_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      // Count unread responses in contact messages
      const { count: contactCount } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .not('response', 'is', null)
        .is('response_read_at', null);

      return (systemCount || 0) + (contactCount || 0);
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
