import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, Users, Shield, ShieldCheck } from "lucide-react";

interface UserData {
  user_id: string;
  email?: string;
  full_name: string | null;
  plan_type: string;
  status: string;
  // Admin role fields
  is_admin?: boolean;
  is_moderator?: boolean;
  user_role?: string;
  // Corporate fields
  is_corporate_admin?: boolean;
  corporate_admin_org?: string | null;
  corporate_admin_plan?: string | null;
  is_corporate_member?: boolean;
  corporate_member_org?: string | null;
  corporate_member_plan?: string | null;
}

interface UserSelectionTableProps {
  users: UserData[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
}

export function UserSelectionTable({ users, selectedUserIds, onSelectionChange }: UserSelectionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.corporate_admin_org?.toLowerCase().includes(term) ||
      user.corporate_member_org?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const visibleIds = useMemo(
    () => filteredUsers.map(u => u.user_id),
    [filteredUsers]
  );

  const allVisibleSelected =
    visibleIds.length > 0 &&
    visibleIds.every(id => selectedUserIds.includes(id));

  const someVisibleSelected =
    !allVisibleSelected &&
    visibleIds.some(id => selectedUserIds.includes(id));

  const headerChecked: boolean | "indeterminate" =
    allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false;

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      onSelectionChange(
        selectedUserIds.filter(id => !visibleIds.includes(id))
      );
    } else {
      const newSelection = Array.from(
        new Set([...selectedUserIds, ...visibleIds])
      );
      onSelectionChange(newSelection);
    }
  };

  const handleToggleUser = (userId: string, checked: boolean | "indeterminate") => {
    if (checked) {
      if (!selectedUserIds.includes(userId)) {
        onSelectionChange([...selectedUserIds, userId]);
      }
    } else {
      if (selectedUserIds.includes(userId)) {
        onSelectionChange(selectedUserIds.filter(id => id !== userId));
      }
    }
  };

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case 'gold': return 'default';
      case 'platinum': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'revoked':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'registered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const renderRoleBadges = (user: UserData) => {
    const badges = [];
    
    if (user.is_admin) {
      badges.push(
        <Badge key="admin" className="text-xs bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Admin
        </Badge>
      );
    } else if (user.is_moderator) {
      badges.push(
        <Badge key="moderator" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Moderator
        </Badge>
      );
    }
    
    return badges;
  };

  const renderCorporateBadges = (user: UserData) => {
    const badges = [];
    
    if (user.is_corporate_admin) {
      badges.push(
        <Badge key="corp-admin" variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          Admin: {user.corporate_admin_org}
        </Badge>
      );
    }
    
    if (user.is_corporate_member) {
      badges.push(
        <Badge key="corp-member" variant="secondary" className="text-xs flex items-center gap-1">
          <Users className="h-3 w-3" />
          Member: {user.corporate_member_org}
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{selectedUserIds.length}</span> of <span className="font-medium">{users.length}</span> selected
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={headerChecked}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Plan</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchTerm ? "No users found matching your search" : "No users available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUserIds.includes(user.user_id)}
                        onCheckedChange={(checked) => handleToggleUser(user.user_id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.full_name || 'Unknown User'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email || 'No email'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        {renderRoleBadges(user)}
                        {!user.is_admin && !user.is_moderator && (
                          <span className="text-xs text-muted-foreground">User</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <Badge variant={getPlanBadgeVariant(user.plan_type)}>
                          {user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}
                        </Badge>
                        {renderCorporateBadges(user)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusBadgeStyle(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
