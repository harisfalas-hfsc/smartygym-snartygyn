import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUserData {
  user_id: string;
  email?: string;
  full_name: string | null;
  avatar_url?: string | null;
  plan_type: string;
  status: string;
  created_at?: string;
  // Admin role fields
  is_admin?: boolean;
  is_moderator?: boolean;
  user_role?: string;
  // Subscription fields
  current_period_start?: string | null;
  current_period_end?: string | null;
  subscription_created_at?: string | null;
  subscription_updated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_source?: string | null;
  // Corporate fields
  is_corporate_admin?: boolean;
  corporate_admin_org?: string | null;
  corporate_admin_plan?: string | null;
  corporate_admin_status?: string | null;
  corporate_admin_end?: string | null;
  is_corporate_member?: boolean;
  corporate_member_org?: string | null;
  corporate_member_plan?: string | null;
}

interface UseAdminUserDataReturn {
  users: AdminUserData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Computed values
  organizations: string[];
  adminUsers: AdminUserData[];
  moderatorUsers: AdminUserData[];
  corporateAdmins: AdminUserData[];
  corporateMembers: AdminUserData[];
}

/**
 * Centralized hook for fetching admin user data.
 * Ensures consistent user data across all admin sections.
 */
export function useAdminUserData(): UseAdminUserDataReturn {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('get-users-with-emails');
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const mappedUsers: AdminUserData[] = (data?.users || []).map((user: any) => ({
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name || user.email,
        avatar_url: user.avatar_url,
        plan_type: user.plan_type || 'free',
        status: user.status || 'registered',
        created_at: user.created_at,
        // Admin role fields
        is_admin: user.is_admin || false,
        is_moderator: user.is_moderator || false,
        user_role: user.user_role || 'user',
        // Subscription fields
        current_period_start: user.current_period_start,
        current_period_end: user.current_period_end,
        subscription_created_at: user.subscription_created_at,
        subscription_updated_at: user.subscription_updated_at,
        stripe_customer_id: user.stripe_customer_id,
        stripe_subscription_id: user.stripe_subscription_id,
        subscription_source: user.subscription_source,
        // Corporate fields
        is_corporate_admin: user.is_corporate_admin || false,
        corporate_admin_org: user.corporate_admin_org || null,
        corporate_admin_plan: user.corporate_admin_plan || null,
        corporate_admin_status: user.corporate_admin_status || null,
        corporate_admin_end: user.corporate_admin_end || null,
        is_corporate_member: user.is_corporate_member || false,
        corporate_member_org: user.corporate_member_org || null,
        corporate_member_plan: user.corporate_member_plan || null,
      }));

      setUsers(mappedUsers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Computed values for convenience
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    users.forEach(user => {
      if (user.corporate_admin_org) orgs.add(user.corporate_admin_org);
      if (user.corporate_member_org) orgs.add(user.corporate_member_org);
    });
    return Array.from(orgs).sort();
  }, [users]);

  const adminUsers = useMemo(() => 
    users.filter(u => u.is_admin), 
    [users]
  );

  const moderatorUsers = useMemo(() => 
    users.filter(u => u.is_moderator), 
    [users]
  );

  const corporateAdmins = useMemo(() => 
    users.filter(u => u.is_corporate_admin), 
    [users]
  );

  const corporateMembers = useMemo(() => 
    users.filter(u => u.is_corporate_member), 
    [users]
  );

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    organizations,
    adminUsers,
    moderatorUsers,
    corporateAdmins,
    corporateMembers,
  };
}
