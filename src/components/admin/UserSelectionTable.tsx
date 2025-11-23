import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface UserData {
  user_id: string;
  email?: string;
  full_name: string | null;
  plan_type: string;
  status: string;
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
      user.email?.toLowerCase().includes(term)
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
      // Deselect all visible users
      onSelectionChange(
        selectedUserIds.filter(id => !visibleIds.includes(id))
      );
    } else {
      // Select all visible users (keep any selections from other filters too)
      const newSelection = Array.from(
        new Set([...selectedUserIds, ...visibleIds])
      );
      onSelectionChange(newSelection);
    }
  };

  const handleToggleUser = (userId: string, checked: boolean | "indeterminate") => {
    if (checked) {
      // Add user if not already selected
      if (!selectedUserIds.includes(userId)) {
        onSelectionChange([...selectedUserIds, userId]);
      }
    } else {
      // Remove user if currently selected
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
                <TableHead className="text-center">Plan</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                    <TableCell className="text-center">
                      <Badge variant={getPlanBadgeVariant(user.plan_type)}>
                        {user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
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
