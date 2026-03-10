import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Search, RefreshCw, Mail, Crown, Gem, Building2, UserMinus, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserDetailModal } from "./UserDetailModal";

interface UserData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  plan_type: string;
  status: string;
  stripe_status?: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  subscription_created_at?: string | null;
  subscription_updated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_source?: string | null;
}

interface SubscriptionAction {
  userId: string;
  userName: string;
  action: 'grant' | 'revoke';
  planType: 'gold' | 'platinum' | 'free';
}

interface CorporateInfo {
  adminPlanType: string | null;
  memberPlanType: string | null;
  organizationName: string | null;
  corporateSubscriptionId: string | null;
}

type SortOption = 'newest_registered' | 'oldest_registered' | 'newest_subscribed' | 'oldest_subscribed' | 'plan_tier';

export function UsersManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest_registered");
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [corporateInfo, setCorporateInfo] = useState<Record<string, CorporateInfo>>({});
  const [pendingAction, setPendingAction] = useState<SubscriptionAction | null>(null);
  const [pendingCorpAction, setPendingCorpAction] = useState<{userId: string; userName: string; planType: string} | null>(null);
  const [pendingCorpRevoke, setPendingCorpRevoke] = useState<{userId: string; userName: string; planType: string} | null>(null);
  const [pendingMemberRevoke, setPendingMemberRevoke] = useState<{
    userId: string;
    userName: string;
    organizationName: string;
    planType: string;
    corporateSubscriptionId: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const SUPER_ADMIN_EMAIL = "harisfalas@gmail.com";

  // --- Status determination ---
  const getUserStatus = (user: UserData, hasPurchases: boolean) => {
    // Revoked by admin
    if (user.status === 'revoked') return 'Revoked';
    
    // Active subscription
    if (user.status === 'active' && (user.plan_type === 'gold' || user.plan_type === 'platinum')) {
      if (user.stripe_status === 'trialing') return 'Trial';
      return 'Paying';
    }
    
    // Expired / canceled
    if (user.status === 'canceled' || user.status === 'expired') return 'Expired';
    
    // Has standalone purchases but no plan
    if (hasPurchases && user.plan_type === 'free') return 'Purchase Only';
    
    return 'Free';
  };

  const getStatusBadgeVariant = (statusLabel: string) => {
    switch (statusLabel) {
      case 'Trial': return 'default';
      case 'Paying': return 'default';
      case 'Purchase Only': return 'secondary';
      case 'Revoked': return 'outline';
      case 'Expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusBadgeClassName = (statusLabel: string) => {
    switch (statusLabel) {
      case 'Trial': return 'bg-blue-600 text-white hover:bg-blue-700';
      case 'Paying': return 'bg-green-600 text-white hover:bg-green-700';
      case 'Revoked': return 'bg-orange-500 text-white hover:bg-orange-600';
      default: return '';
    }
  };

  // --- Data fetching ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');
      if (error) throw error;
      if (data?.users) setUsers(data.users);

      const { data: purchases } = await supabase.from('user_purchases').select('user_id');
      setUserPurchases([...new Set(purchases?.map(p => p.user_id) || [])]);

      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const rolesMap: Record<string, string[]> = {};
      roles?.forEach(r => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      const { data: corpSubs } = await supabase.from('corporate_subscriptions').select('id, admin_user_id, plan_type, organization_name');
      const { data: corpMembers } = await supabase.from('corporate_members').select('user_id, corporate_subscription_id, corporate_subscriptions(id, plan_type, organization_name)');
      
      const corpInfoMap: Record<string, CorporateInfo> = {};
      const orgNames: Set<string> = new Set();
      
      corpSubs?.forEach(s => {
        corpInfoMap[s.admin_user_id] = { adminPlanType: s.plan_type, memberPlanType: null, organizationName: s.organization_name, corporateSubscriptionId: s.id };
        if (s.organization_name) orgNames.add(s.organization_name);
      });
      corpMembers?.forEach(m => {
        const corpData = m.corporate_subscriptions as any;
        const planType = corpData?.plan_type || null;
        const orgName = corpData?.organization_name || null;
        const corpSubId = corpData?.id || m.corporate_subscription_id;
        if (!corpInfoMap[m.user_id]) {
          corpInfoMap[m.user_id] = { adminPlanType: null, memberPlanType: planType, organizationName: orgName, corporateSubscriptionId: corpSubId };
        } else {
          corpInfoMap[m.user_id].memberPlanType = planType;
          corpInfoMap[m.user_id].organizationName = orgName;
          corpInfoMap[m.user_id].corporateSubscriptionId = corpSubId;
        }
        if (orgName) orgNames.add(orgName);
      });
      
      setCorporateInfo(corpInfoMap);
      setOrganizations(Array.from(orgNames).sort());
      setUserRoles(rolesMap);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // --- Actions ---
  const toggleAdminRole = async (userId: string, userEmail: string | null, isCurrentlyAdmin: boolean) => {
    if (userEmail === SUPER_ADMIN_EMAIL && isCurrentlyAdmin) {
      toast.error("Cannot remove admin privileges from the main administrator");
      return;
    }
    try {
      if (isCurrentlyAdmin) {
        const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
        if (error) throw error;
        toast.success("Admin privileges removed successfully");
      } else {
        const { error } = await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
        toast.success("Admin privileges granted successfully");
      }
      fetchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast.error("Failed to update admin privileges");
    }
  };

  const manageSubscription = async (action: SubscriptionAction) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-subscription', {
        body: { user_id: action.userId, action: action.action, plan_type: action.planType }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error managing subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const grantCorporateAdmin = async (userId: string, planType: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('grant-corporate-admin', {
        body: { user_id: userId, plan_type: planType }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error granting corporate admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to grant corporate admin');
    } finally {
      setActionLoading(false);
      setPendingCorpAction(null);
    }
  };

  const revokeCorporateAdmin = async (userId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revoke-corporate-admin', { body: { user_id: userId } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error revoking corporate admin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to revoke corporate admin');
    } finally {
      setActionLoading(false);
      setPendingCorpRevoke(null);
    }
  };

  const revokeCorporateMember = async (userId: string, corporateSubscriptionId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revoke-corporate-member', {
        body: { member_user_id: userId, corporate_subscription_id: corporateSubscriptionId }
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error revoking corporate member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to revoke corporate member');
    } finally {
      setActionLoading(false);
      setPendingMemberRevoke(null);
    }
  };

  // --- Filtering & Sorting ---
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)
      );
    }

    // Plan filter
    if (planFilter !== "all") {
      if (planFilter === "corporate") {
        filtered = filtered.filter(user => corporateInfo[user.user_id]?.adminPlanType || corporateInfo[user.user_id]?.memberPlanType);
      } else {
        filtered = filtered.filter(user => user.plan_type === planFilter);
      }
    }

    // Status filter (new clear categories)
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        const hasPurchases = userPurchases.includes(user.user_id);
        const label = getUserStatus(user, hasPurchases);
        switch (statusFilter) {
          case "trial": return label === 'Trial';
          case "paying": return label === 'Paying';
          case "expired": return label === 'Expired';
          case "revoked": return label === 'Revoked';
          case "free": return label === 'Free';
          case "purchase_only": return label === 'Purchase Only';
          default: return true;
        }
      });
    }

    // Role filter (separated from status)
    if (roleFilter !== "all") {
      switch (roleFilter) {
        case "admins":
          filtered = filtered.filter(user => userRoles[user.user_id]?.includes('admin'));
          break;
        case "corporate_admins":
          filtered = filtered.filter(user => corporateInfo[user.user_id]?.adminPlanType);
          break;
        case "corporate_members":
          filtered = filtered.filter(user => corporateInfo[user.user_id]?.memberPlanType && !corporateInfo[user.user_id]?.adminPlanType);
          break;
      }
    }

    // Organization filter
    if (organizationFilter !== "all") {
      filtered = filtered.filter(user => corporateInfo[user.user_id]?.organizationName === organizationFilter);
    }

    // Source filter
    if (sourceFilter !== "all") {
      switch (sourceFilter) {
        case "stripe":
          filtered = filtered.filter(user => user.stripe_subscription_id);
          break;
        case "admin_grant":
          filtered = filtered.filter(user => user.subscription_source === 'admin_grant');
          break;
        case "corporate":
          filtered = filtered.filter(user => corporateInfo[user.user_id]?.memberPlanType || corporateInfo[user.user_id]?.adminPlanType);
          break;
      }
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'newest_registered':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest_registered':
        sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'newest_subscribed':
        sorted.sort((a, b) => {
          const aDate = a.subscription_created_at ? new Date(a.subscription_created_at).getTime() : 0;
          const bDate = b.subscription_created_at ? new Date(b.subscription_created_at).getTime() : 0;
          return bDate - aDate;
        });
        break;
      case 'oldest_subscribed':
        sorted.sort((a, b) => {
          const aDate = a.subscription_created_at ? new Date(a.subscription_created_at).getTime() : Infinity;
          const bDate = b.subscription_created_at ? new Date(b.subscription_created_at).getTime() : Infinity;
          return aDate - bDate;
        });
        break;
      case 'plan_tier':
        const tierOrder: Record<string, number> = { platinum: 0, gold: 1, free: 2 };
        sorted.sort((a, b) => (tierOrder[a.plan_type] ?? 3) - (tierOrder[b.plan_type] ?? 3));
        break;
    }

    return sorted;
  }, [searchTerm, planFilter, statusFilter, roleFilter, organizationFilter, sourceFilter, sortBy, users, userPurchases, userRoles, corporateInfo]);

  // --- Stats ---
  const stats = useMemo(() => {
    let trialCount = 0;
    let payingCount = 0;
    users.forEach(u => {
      if (u.status === 'active' && (u.plan_type === 'gold' || u.plan_type === 'platinum')) {
        if (u.stripe_status === 'trialing') trialCount++;
        else payingCount++;
      }
    });
    return {
      total: users.length,
      trial: trialCount,
      paying: payingCount,
      gold: users.filter(u => u.plan_type === 'gold' && u.status === 'active').length,
      platinum: users.filter(u => u.plan_type === 'platinum' && u.status === 'active').length,
      purchases: userPurchases.length,
      admins: Object.values(userRoles).filter(roles => roles.includes('admin')).length,
    };
  }, [users, userPurchases, userRoles]);

  // --- Helpers ---
  const exportToCSV = () => {
    const headers = ["User ID", "Name", "Email", "Is Admin", "Plan", "Status", "Stripe Status", "Period Start", "Period End", "Joined", "Subscribed"];
    const rows = filteredAndSortedUsers.map(user => [
      user.user_id,
      user.full_name || '',
      user.email || '',
      userRoles[user.user_id]?.includes('admin') ? 'Yes' : 'No',
      user.plan_type,
      getUserStatus(user, userPurchases.includes(user.user_id)),
      user.stripe_status || '',
      user.current_period_start ? format(new Date(user.current_period_start), 'yyyy-MM-dd') : '',
      user.current_period_end ? format(new Date(user.current_period_end), 'yyyy-MM-dd') : '',
      format(new Date(user.created_at), 'yyyy-MM-dd'),
      user.subscription_created_at ? format(new Date(user.subscription_created_at), 'yyyy-MM-dd') : '',
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredAndSortedUsers.length} users`);
  };

  const getCorporatePlanLabel = (planType: string | null) => {
    if (!planType) return 'Unknown';
    if (planType === 'dynamic') return 'Full Access';
    return planType.charAt(0).toUpperCase() + planType.slice(1);
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'platinum': return 'default' as const;
      case 'gold': return 'secondary' as const;
      default: return 'outline' as const;
    }
  };

  const isActivePremium = (user: UserData) => {
    return user.status === 'active' && (user.plan_type === 'gold' || user.plan_type === 'platinum');
  };

  const getDialogTitle = () => {
    if (!pendingAction) return '';
    if (pendingAction.action === 'grant') {
      return `Grant ${pendingAction.planType.charAt(0).toUpperCase() + pendingAction.planType.slice(1)} Membership`;
    }
    return 'Revoke Premium Access';
  };

  const getDialogDescription = () => {
    if (!pendingAction) return '';
    if (pendingAction.action === 'grant') {
      return `Are you sure you want to grant ${pendingAction.planType.toUpperCase()} membership to "${pendingAction.userName}"? This will give them full premium access.`;
    }
    return `Are you sure you want to revoke premium access from "${pendingAction.userName}"? This will set them to the FREE plan and remove their premium benefits.`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pt-6">
      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getDialogTitle()}</AlertDialogTitle>
            <AlertDialogDescription>{getDialogDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingAction && manageSubscription(pendingAction)} 
              disabled={actionLoading}
              className={pendingAction?.action === 'revoke' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Corporate Admin Confirmation Dialog */}
      <AlertDialog open={!!pendingCorpAction} onOpenChange={(open) => !open && setPendingCorpAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Grant Corporate Admin ({pendingCorpAction?.planType?.charAt(0).toUpperCase()}{pendingCorpAction?.planType?.slice(1)})
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to make "{pendingCorpAction?.userName}" a Corporate Administrator for the{' '}
              {pendingCorpAction?.planType?.toUpperCase()} plan? They will receive Platinum access and can manage up to{' '}
              {pendingCorpAction?.planType === 'dynamic' ? '10' : 
               pendingCorpAction?.planType === 'power' ? '20' : 
               pendingCorpAction?.planType === 'elite' ? '30' : 'unlimited'} team members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingCorpAction && grantCorporateAdmin(pendingCorpAction.userId, pendingCorpAction.planType)} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Corporate Admin Confirmation Dialog */}
      <AlertDialog open={!!pendingCorpRevoke} onOpenChange={(open) => !open && setPendingCorpRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Revoke Corporate Admin Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke corporate admin status from "{pendingCorpRevoke?.userName}"? 
              This will remove their {pendingCorpRevoke?.planType?.toUpperCase()} plan, delete all their team members, 
              and set their subscription to FREE.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingCorpRevoke && revokeCorporateAdmin(pendingCorpRevoke.userId)} 
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Processing...' : 'Revoke'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Corporate Member Confirmation Dialog */}
      <AlertDialog open={!!pendingMemberRevoke} onOpenChange={(open) => !open && setPendingMemberRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Revoke Corporate Member Access</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke corporate member access from "{pendingMemberRevoke?.userName}"?
              <br /><br />
              <strong>Organization:</strong> {pendingMemberRevoke?.organizationName}<br />
              <strong>Plan:</strong> {pendingMemberRevoke?.planType?.toUpperCase()}
              <br /><br />
              This will remove their Platinum access and set their subscription to FREE.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => pendingMemberRevoke && revokeCorporateMember(pendingMemberRevoke.userId, pendingMemberRevoke.corporateSubscriptionId)} 
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? 'Processing...' : 'Revoke Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all registered users</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchUsers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters Row 1: Search + Plan + Status */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="trial">🔵 Trial</SelectItem>
                <SelectItem value="paying">🟢 Paying</SelectItem>
                <SelectItem value="expired">🔴 Expired</SelectItem>
                <SelectItem value="revoked">🟠 Revoked</SelectItem>
                <SelectItem value="free">⚪ Free</SelectItem>
                <SelectItem value="purchase_only">💳 Purchase Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters Row 2: Role + Source + Org + Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[170px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admins">👑 Admins</SelectItem>
                <SelectItem value="corporate_admins">🏢 Corp Admins</SelectItem>
                <SelectItem value="corporate_members">👥 Corp Members</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="stripe">Stripe (Paid)</SelectItem>
                <SelectItem value="admin_grant">Admin Granted</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
            {organizations.length > 0 && (
              <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org} value={org}>🏛️ {org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <ArrowUpDown className="h-4 w-4 mr-2 shrink-0" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest_registered">Newest Registered</SelectItem>
                <SelectItem value="oldest_registered">Oldest Registered</SelectItem>
                <SelectItem value="newest_subscribed">Newest Subscribed</SelectItem>
                <SelectItem value="oldest_subscribed">Oldest Subscribed</SelectItem>
                <SelectItem value="plan_tier">Plan Tier</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 mb-6">
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Trial</p>
              <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Paying</p>
              <p className="text-2xl font-bold text-green-600">{stats.paying}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Gold</p>
              <p className="text-2xl font-bold">{stats.gold}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Platinum</p>
              <p className="text-2xl font-bold">{stats.platinum}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Purchases</p>
              <p className="text-2xl font-bold">{stats.purchases}</p>
            </div>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>User Status</TableHead>
                  <TableHead>Period End</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUsers.map((user) => {
                    const hasPurchases = userPurchases.includes(user.user_id);
                    const statusLabel = getUserStatus(user, hasPurchases);
                    const isPremium = isActivePremium(user);
                    const userName = user.full_name || user.email || 'Anonymous';
                    const corpInfo = corporateInfo[user.user_id];
                    const isCorporateAdmin = !!corpInfo?.adminPlanType;
                    const isCorporateMember = !!corpInfo?.memberPlanType;
                    
                    return (
                      <TableRow 
                        key={user.user_id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{user.full_name || 'Anonymous'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {userRoles[user.user_id]?.includes('admin') && (
                            <Badge variant="destructive" className="text-xs">
                              👑 Admin{user.email === SUPER_ADMIN_EMAIL && " (Main)"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-1">
                            {isCorporateMember && !user.stripe_subscription_id && user.subscription_source !== 'admin_grant' ? (
                              <Badge className="bg-teal-600 hover:bg-teal-700 text-white">Platinum (Corporate)</Badge>
                            ) : (
                              <>
                                <Badge variant={getPlanBadgeVariant(user.plan_type)}>{user.plan_type}</Badge>
                                {user.subscription_source === 'admin_grant' && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Complimentary</Badge>
                                )}
                                {user.stripe_subscription_id && (
                                  <Badge variant="outline" className="text-xs border-green-600 text-green-600">Paid</Badge>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-1">
                            <Badge 
                              variant={getStatusBadgeVariant(statusLabel)}
                              className={getStatusBadgeClassName(statusLabel)}
                            >
                              {statusLabel}
                            </Badge>
                            {hasPurchases && (
                              <Badge variant="outline" className="text-xs">💳 Purchases</Badge>
                            )}
                            {isCorporateAdmin && (
                              <>
                                <Badge variant="default" className="text-xs bg-blue-600">
                                  🏢 Corp Admin ({getCorporatePlanLabel(corpInfo.adminPlanType)})
                                </Badge>
                                {corpInfo.organizationName && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs border-teal-600 text-teal-600 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950"
                                    onClick={(e) => { e.stopPropagation(); setOrganizationFilter(corpInfo.organizationName!); }}
                                  >
                                    🏛️ {corpInfo.organizationName}
                                  </Badge>
                                )}
                              </>
                            )}
                            {isCorporateMember && (
                              <>
                                <Badge className="text-xs bg-teal-600 hover:bg-teal-700 text-white">👥 Platinum (Corporate)</Badge>
                                {corpInfo.organizationName && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs border-teal-600 text-teal-600 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-950"
                                    onClick={(e) => { e.stopPropagation(); setOrganizationFilter(corpInfo.organizationName!); }}
                                  >
                                    🏛️ {corpInfo.organizationName}
                                  </Badge>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.current_period_end
                            ? format(new Date(user.current_period_end), 'MMM d, yyyy')
                            : user.subscription_source === 'admin_grant' && (user.plan_type === 'gold' || user.plan_type === 'platinum')
                              ? <span className="text-green-600 dark:text-green-400 font-medium">Lifetime</span>
                              : 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.subscription_created_at && user.plan_type !== 'free'
                            ? format(new Date(user.subscription_created_at), 'MMM d, yyyy')
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <Button
                              variant={userRoles[user.user_id]?.includes('admin') ? "destructive" : "default"}
                              size="sm"
                              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleAdminRole(user.user_id, user.email, userRoles[user.user_id]?.includes('admin') || false);
                              }}
                              disabled={user.email === SUPER_ADMIN_EMAIL && userRoles[user.user_id]?.includes('admin')}
                            >
                              <span className="hidden sm:inline">{userRoles[user.user_id]?.includes('admin') ? "Remove Admin" : "Make Admin"}</span>
                              <span className="sm:hidden">{userRoles[user.user_id]?.includes('admin') ? "Remove" : "Admin"}</span>
                            </Button>

                            {!isPremium ? (
                              <>
                                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 text-primary border-primary hover:bg-primary/10"
                                  onClick={(e) => { e.stopPropagation(); setPendingAction({ userId: user.user_id, userName, action: 'grant', planType: 'gold' }); }}>
                                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /><span className="hidden sm:inline">Gold</span>
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 text-purple-600 border-purple-600 hover:bg-purple-50"
                                  onClick={(e) => { e.stopPropagation(); setPendingAction({ userId: user.user_id, userName, action: 'grant', planType: 'platinum' }); }}>
                                  <Gem className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /><span className="hidden sm:inline">Platinum</span>
                                </Button>
                              </>
                            ) : (
                              <>
                                {user.plan_type === 'gold' && (
                                  <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 text-purple-600 border-purple-600 hover:bg-purple-50"
                                    onClick={(e) => { e.stopPropagation(); setPendingAction({ userId: user.user_id, userName, action: 'grant', planType: 'platinum' }); }}>
                                    <Gem className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /><span className="hidden sm:inline">Upgrade</span>
                                  </Button>
                                )}
                                {user.plan_type === 'platinum' && (
                                  <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3 text-primary border-primary hover:bg-primary/10"
                                    onClick={(e) => { e.stopPropagation(); setPendingAction({ userId: user.user_id, userName, action: 'grant', planType: 'gold' }); }}>
                                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" /><span className="hidden sm:inline">Downgrade</span>
                                  </Button>
                                )}
                                <Button variant="destructive" size="sm" className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                                  onClick={(e) => { e.stopPropagation(); setPendingAction({ userId: user.user_id, userName, action: 'revoke', planType: 'free' }); }}>
                                  <span className="hidden sm:inline">Revoke</span><span className="sm:hidden">✕</span>
                                </Button>
                              </>
                            )}

                            <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-2 sm:px-3"
                              onClick={(e) => { e.stopPropagation(); if (user.email) window.location.href = `mailto:${user.email}`; }}
                              disabled={!user.email}>
                              <Mail className="h-4 w-4" />
                            </Button>

                            {!isCorporateAdmin && !isCorporateMember ? (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {['dynamic', 'power', 'elite', 'enterprise'].map(pt => (
                                  <Button key={pt} variant="outline" size="sm" className="text-xs px-2 py-1 h-7 text-blue-600 border-blue-600 hover:bg-blue-50"
                                    onClick={(e) => { e.stopPropagation(); setPendingCorpAction({ userId: user.user_id, userName, planType: pt }); }}>
                                    <Building2 className="h-3 w-3 mr-1" />{pt.charAt(0).toUpperCase() + pt.slice(1)}
                                  </Button>
                                ))}
                              </div>
                            ) : isCorporateAdmin ? (
                              <Button variant="destructive" size="sm" className="text-xs px-2 py-1 h-7 mt-1"
                                onClick={(e) => { e.stopPropagation(); setPendingCorpRevoke({ userId: user.user_id, userName, planType: corpInfo.adminPlanType || '' }); }}>
                                <Building2 className="h-3 w-3 mr-1" />Revoke Corp
                              </Button>
                            ) : isCorporateMember ? (
                              <Button variant="destructive" size="sm" className="text-xs px-2 py-1 h-7 mt-1"
                                onClick={(e) => { e.stopPropagation(); setPendingMemberRevoke({ userId: user.user_id, userName, organizationName: corpInfo.organizationName || 'Unknown', planType: corpInfo.memberPlanType || '', corporateSubscriptionId: corpInfo.corporateSubscriptionId || '' }); }}>
                                <UserMinus className="h-3 w-3 mr-1" />Revoke Member
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedUser(null); }}
        corporateInfo={selectedUser ? corporateInfo[selectedUser.user_id] : undefined}
        isAdmin={selectedUser ? userRoles[selectedUser.user_id]?.includes('admin') : false}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
