import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Download, Search, RefreshCw, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

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
      filtered = filtered.filter(user => user.plan_type === planFilter);
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
    }

    setFilteredUsers(filtered);
  }, [searchTerm, planFilter, statusFilter, users, userPurchases]);

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
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
            </SelectContent>
          </Select>
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
        </div>

        {/* Users Table */}
        <div className="border rounded-lg">
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
                  
                  return (
                    <TableRow key={user.user_id}>
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
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(statusLabel)}>
                            {statusLabel}
                          </Badge>
                          {hasPurchases && (
                            <Badge variant="outline" className="text-xs">
                              💳 Purchases
                            </Badge>
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
                        <div className="flex items-center gap-2">
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
    </div>
  );
}
