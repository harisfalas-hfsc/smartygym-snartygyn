import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Search, RefreshCw, Mail, Crown, Gem, Building2, UserMinus } from "lucide-react";
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
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  subscription_created_at?: string | null;
  subscription_updated_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
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

export function UsersManager() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
  const SUPER_ADMIN_EMAIL = "harisfallas@gmail.com";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Use edge function to fetch users with emails (requires admin auth)
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }

      // Fetch users with purchases
      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('user_id');
      
      const uniquePurchasers = [...new Set(purchases?.map(p => p.user_id) || [])];
      setUserPurchases(uniquePurchasers);

      // Fetch all user roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Create a map of user_id -> roles[]
      const rolesMap: Record<string, string[]> = {};
      roles?.forEach(r => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      // Fetch corporate subscriptions with plan type and organization name
      const { data: corpSubs } = await supabase
        .from('corporate_subscriptions')
        .select('id, admin_user_id, plan_type, organization_name');
      
      // Fetch corporate members with their subscription's plan type and organization name
      const { data: corpMembers } = await supabase
        .from('corporate_members')
        .select('user_id, corporate_subscription_id, corporate_subscriptions(id, plan_type, organization_name)');
      
      // Build corporate info map
      const corpInfoMap: Record<string, CorporateInfo> = {};
      const orgNames: Set<string> = new Set();
      
      corpSubs?.forEach(s => {
        corpInfoMap[s.admin_user_id] = { 
          adminPlanType: s.plan_type, 
          memberPlanType: null,
          organizationName: s.organization_name,
          corporateSubscriptionId: s.id
        };
        if (s.organization_name) orgNames.add(s.organization_name);
      });
      corpMembers?.forEach(m => {
        const corpData = m.corporate_subscriptions as any;
        const planType = corpData?.plan_type || null;
        const orgName = corpData?.organization_name || null;
        const corpSubId = corpData?.id || m.corporate_subscription_id;
        if (!corpInfoMap[m.user_id]) {
          corpInfoMap[m.user_id] = { 
            adminPlanType: null, 
            memberPlanType: planType,
            organizationName: orgName,
            corporateSubscriptionId: corpSubId
          };
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

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminRole = async (userId: string, userEmail: string | null, isCurrentlyAdmin: boolean) => {
    // Protect super admin
    if (userEmail === SUPER_ADMIN_EMAIL && isCurrentlyAdmin) {
      toast.error("Cannot remove admin privileges from the main administrator");
      return;
    }

    try {
      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        
        if (error) throw error;
        toast.success("Admin privileges removed successfully");
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (error) throw error;
        toast.success("Admin privileges granted successfully");
      }
      
      // Refresh users
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
        body: { 
          user_id: action.userId, 
          action: action.action, 
          plan_type: action.planType 
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');

      toast.success(data.message);
      fetchUsers(); // Refresh the list
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

  const handleConfirmAction = () => {
    if (pendingAction) {
      manageSubscription(pendingAction);
    }
  };

  const handleConfirmCorpAction = () => {
    if (pendingCorpAction) {
      grantCorporateAdmin(pendingCorpAction.userId, pendingCorpAction.planType);
    }
  };

  const revokeCorporateAdmin = async (userId: string) => {
    setActionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('revoke-corporate-admin', {
        body: { user_id: userId }
      });

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

  const handleConfirmCorpRevoke = () => {
    if (pendingCorpRevoke) {
      revokeCorporateAdmin(pendingCorpRevoke.userId);
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

  const handleConfirmMemberRevoke = () => {
    if (pendingMemberRevoke) {
      revokeCorporateMember(pendingMemberRevoke.userId, pendingMemberRevoke.corporateSubscriptionId);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Plan filter
    if (planFilter !== "all") {
      if (planFilter === "corporate") {
        filtered = filtered.filter(user => 
          corporateInfo[user.user_id]?.adminPlanType || corporateInfo[user.user_id]?.memberPlanType
        );
      } else {
        filtered = filtered.filter(user => user.plan_type === planFilter);
      }
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter(user => user.status === "active");
    } else if (statusFilter === "canceled") {
      filtered = filtered.filter(user => user.status === "canceled");
    } else if (statusFilter === "with_purchases") {
      filtered = filtered.filter(user => userPurchases.includes(user.user_id));
    } else if (statusFilter === "admins_only") {
      filtered = filtered.filter(user => userRoles[user.user_id]?.includes('admin'));
    } else if (statusFilter === "corporate_admins") {
      filtered = filtered.filter(user => corporateInfo[user.user_id]?.adminPlanType);
    } else if (statusFilter === "corporate_members") {
      filtered = filtered.filter(user => corporateInfo[user.user_id]?.memberPlanType && !corporateInfo[user.user_id]?.adminPlanType);
    }

    // Organization filter
    if (organizationFilter !== "all") {
      filtered = filtered.filter(user => corporateInfo[user.user_id]?.organizationName === organizationFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, planFilter, statusFilter, organizationFilter, users, userPurchases, userRoles, corporateInfo]);

  const exportToCSV = () => {
    const headers = ["User ID", "Name", "Email", "Is Admin", "Plan", "Status", "Period Start", "Period End", "Joined"];
    const rows = filteredUsers.map(user => [
      user.user_id,
      user.full_name || '',
      user.email || '',
      userRoles[user.user_id]?.includes('admin') ? 'Yes' : 'No',
      user.plan_type,
      user.status,
      user.current_period_start ? format(new Date(user.current_period_start), 'yyyy-MM-dd') : '',
      user.current_period_end ? format(new Date(user.current_period_end), 'yyyy-MM-dd') : '',
      format(new Date(user.created_at), 'yyyy-MM-dd'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredUsers.length} users`);
  };

  const getUserStatus = (user: UserData, hasPurchases: boolean) => {
    if (user.status === 'active') {
      if (user.plan_type === 'gold') return 'Gold Subscriber';
      if (user.plan_type === 'platinum') return 'Platinum Subscriber';
    }
    if (hasPurchases) return 'Purchase Only';
    if (user.status === 'canceled') return 'Expired Subscriber';
    return 'Free User';
  };

  const getStatusBadgeVariant = (statusLabel: string) => {
    if (statusLabel.includes('Subscriber') && !statusLabel.includes('Expired')) return 'default';
    if (statusLabel === 'Purchase Only') return 'secondary';
    if (statusLabel === 'Expired Subscriber') return 'destructive';
    return 'outline';
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'platinum': return 'default';
      case 'gold': return 'secondary';
      default: return 'outline';
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
              onClick={handleConfirmAction} 
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
            <AlertDialogAction onClick={handleConfirmCorpAction} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Corporate Admin Confirmation Dialog */}
      <AlertDialog open={!!pendingCorpRevoke} onOpenChange={(open) => !open && setPendingCorpRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Revoke Corporate Admin Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke corporate admin status from "{pendingCorpRevoke?.userName}"? 
              This will remove their {pendingCorpRevoke?.planType?.toUpperCase()} plan, delete all their team members, 
              and set their subscription to FREE.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCorpRevoke} 
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
            <AlertDialogTitle className="text-destructive">
              Revoke Corporate Member Access
            </AlertDialogTitle>
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
              onClick={handleConfirmMemberRevoke} 
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by plan" />
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="with_purchases">With Purchases</SelectItem>
              <SelectItem value="admins_only">Admins Only</SelectItem>
              <SelectItem value="corporate_admins">Corporate Admins</SelectItem>
              <SelectItem value="corporate_members">Corporate Members</SelectItem>
            </SelectContent>
          </Select>
          {organizations.length > 0 && (
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org} value={org}>
                    🏛️ {org}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Active Subscribers</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Gold Members</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.plan_type === 'gold').length}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Platinum Members</p>
            <p className="text-2xl font-bold">
              {users.filter(u => u.plan_type === 'platinum').length}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Users with Purchases</p>
            <p className="text-2xl font-bold">
              {userPurchases.length}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Administrators</p>
            <p className="text-2xl font-bold">
              {Object.values(userRoles).filter(roles => roles.includes('admin')).length}
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Corporate Users
            </p>
            <p className="text-2xl font-bold">
              {Object.keys(corporateInfo).length}
            </p>
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
              <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
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
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || 'Anonymous'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {userRoles[user.user_id]?.includes('admin') && (
                            <Badge variant="destructive" className="text-xs">
                              👑 Admin
                              {user.email === SUPER_ADMIN_EMAIL && " (Main)"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={getPlanBadgeVariant(user.plan_type)}>
                          {user.plan_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1">
                          <Badge variant={getStatusBadgeVariant(statusLabel)}>
                            {statusLabel}
                          </Badge>
                          {hasPurchases && (
                            <Badge variant="outline" className="text-xs">
                              💳 Purchases
                            </Badge>
                          )}
                          {isCorporateAdmin && (
                            <>
                              <Badge variant="default" className="text-xs bg-blue-600">
                                🏢 Corp Admin ({corpInfo.adminPlanType})
                              </Badge>
                              {corpInfo.organizationName && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs border-teal-600 text-teal-600 cursor-pointer hover:bg-teal-50"
                                  onClick={() => setOrganizationFilter(corpInfo.organizationName!)}
                                >
                                  🏛️ {corpInfo.organizationName}
                                </Badge>
                              )}
                            </>
                          )}
                          {isCorporateMember && (
                            <>
                              <Badge variant="outline" className="text-xs border-blue-600 text-blue-600">
                                👥 Corp Member ({corpInfo.memberPlanType})
                              </Badge>
                              {corpInfo.organizationName && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs border-teal-600 text-teal-600 cursor-pointer hover:bg-teal-50"
                                  onClick={() => setOrganizationFilter(corpInfo.organizationName!)}
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
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Admin Toggle */}
                          <Button
                            variant={userRoles[user.user_id]?.includes('admin') ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleAdminRole(
                              user.user_id, 
                              user.email, 
                              userRoles[user.user_id]?.includes('admin') || false
                            )}
                            disabled={user.email === SUPER_ADMIN_EMAIL && userRoles[user.user_id]?.includes('admin')}
                          >
                            {userRoles[user.user_id]?.includes('admin') ? "Remove Admin" : "Make Admin"}
                          </Button>

                          {/* Subscription Management */}
                          {!isPremium ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingAction({
                                  userId: user.user_id,
                                  userName,
                                  action: 'grant',
                                  planType: 'gold'
                                })}
                                className="text-primary border-primary hover:bg-primary/10"
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                Gold
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPendingAction({
                                  userId: user.user_id,
                                  userName,
                                  action: 'grant',
                                  planType: 'platinum'
                                })}
                                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                              >
                                <Gem className="h-4 w-4 mr-1" />
                                Platinum
                              </Button>
                            </>
                          ) : (
                            <>
                              {user.plan_type === 'gold' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPendingAction({
                                    userId: user.user_id,
                                    userName,
                                    action: 'grant',
                                    planType: 'platinum'
                                  })}
                                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                                >
                                  <Gem className="h-4 w-4 mr-1" />
                                  Upgrade
                                </Button>
                              )}
                              {user.plan_type === 'platinum' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPendingAction({
                                    userId: user.user_id,
                                    userName,
                                    action: 'grant',
                                    planType: 'gold'
                                  })}
                                  className="text-primary border-primary hover:bg-primary/10"
                                >
                                  <Crown className="h-4 w-4 mr-1" />
                                  Downgrade
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setPendingAction({
                                  userId: user.user_id,
                                  userName,
                                  action: 'revoke',
                                  planType: 'free'
                                })}
                              >
                                Revoke
                              </Button>
                            </>
                          )}

                          {/* Email */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (user.email) {
                                window.location.href = `mailto:${user.email}`;
                              }
                            }}
                            disabled={!user.email}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>

                          {/* Corporate Admin Buttons - show grant buttons or revoke button */}
                          {/* Hide corporate buttons for users who are already corporate members */}
                          {!isCorporateAdmin && !isCorporateMember ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1 h-7 text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => setPendingCorpAction({ userId: user.user_id, userName, planType: 'dynamic' })}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                Dynamic
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1 h-7 text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => setPendingCorpAction({ userId: user.user_id, userName, planType: 'power' })}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                Power
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1 h-7 text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => setPendingCorpAction({ userId: user.user_id, userName, planType: 'elite' })}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                Elite
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs px-2 py-1 h-7 text-blue-600 border-blue-600 hover:bg-blue-50"
                                onClick={() => setPendingCorpAction({ userId: user.user_id, userName, planType: 'enterprise' })}
                              >
                                <Building2 className="h-3 w-3 mr-1" />
                                Enterprise
                              </Button>
                            </div>
                          ) : isCorporateAdmin ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs px-2 py-1 h-7 mt-1"
                              onClick={() => setPendingCorpRevoke({ 
                                userId: user.user_id, 
                                userName, 
                                planType: corpInfo.adminPlanType || '' 
                              })}
                            >
                              <Building2 className="h-3 w-3 mr-1" />
                              Revoke Corp
                            </Button>
                          ) : isCorporateMember ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="text-xs px-2 py-1 h-7 mt-1"
                              onClick={() => setPendingMemberRevoke({ 
                                userId: user.user_id, 
                                userName, 
                                organizationName: corpInfo.organizationName || 'Unknown',
                                planType: corpInfo.memberPlanType || '',
                                corporateSubscriptionId: corpInfo.corporateSubscriptionId || ''
                              })}
                            >
                              <UserMinus className="h-3 w-3 mr-1" />
                              Revoke Member
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

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        corporateInfo={selectedUser ? corporateInfo[selectedUser.user_id] : undefined}
        isAdmin={selectedUser ? userRoles[selectedUser.user_id]?.includes('admin') : false}
        onRefresh={fetchUsers}
      />
    </div>
  );
}
