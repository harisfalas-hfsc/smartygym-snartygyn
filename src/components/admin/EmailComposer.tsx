import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, Send, Users, AlertCircle, FileText, Download, Building2 } from "lucide-react";
import { toast } from "sonner";
import { UserSelectionTable } from "./UserSelectionTable";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface UserData {
  user_id: string;
  email?: string;
  full_name: string | null;
  plan_type: string;
  status: string;
  // Corporate fields
  is_corporate_admin?: boolean;
  corporate_admin_org?: string | null;
  corporate_admin_plan?: string | null;
  is_corporate_member?: boolean;
  corporate_member_org?: string | null;
  corporate_member_plan?: string | null;
}

export function EmailComposer() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  
  // Filters
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [purchaseFilter, setPurchaseFilter] = useState<string>("all");
  const [corporateFilter, setCorporateFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  
  // Email content
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);

  // Get unique organizations for filter dropdown
  const organizations = useMemo(() => {
    const orgs = new Set<string>();
    users.forEach(user => {
      if (user.corporate_admin_org) orgs.add(user.corporate_admin_org);
      if (user.corporate_member_org) orgs.add(user.corporate_member_org);
    });
    return Array.from(orgs).sort();
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get-users-with-emails');
      
      if (usersError) throw usersError;

      const registeredUsers: UserData[] = (usersData?.users || []).map((user: any) => ({
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name || user.email,
        plan_type: user.plan_type || 'free',
        status: user.status || 'inactive',
        is_corporate_admin: user.is_corporate_admin || false,
        corporate_admin_org: user.corporate_admin_org || null,
        corporate_admin_plan: user.corporate_admin_plan || null,
        is_corporate_member: user.is_corporate_member || false,
        corporate_member_org: user.corporate_member_org || null,
        corporate_member_plan: user.corporate_member_plan || null,
      }));

      setUsers(registeredUsers);
      setFilteredUsers(registeredUsers);

      const { data: purchases } = await supabase
        .from('user_purchases')
        .select('user_id');
      
      const uniquePurchasers = [...new Set(purchases?.map(p => p.user_id) || [])];
      setUserPurchases(uniquePurchasers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body, category')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = users;

    // User type filter
    if (userTypeFilter !== "all") {
      if (userTypeFilter === "registered_with_plan") {
        filtered = filtered.filter(user => 
          user.plan_type === 'gold' || user.plan_type === 'platinum'
        );
      } else if (userTypeFilter === "registered_without_plan") {
        filtered = filtered.filter(user => 
          user.plan_type === 'free'
        );
      }
    }

    // Plan filter
    if (planFilter !== "all" && userTypeFilter !== "registered_without_plan") {
      filtered = filtered.filter(user => user.plan_type === planFilter);
    }

    // Status filter
    if (statusFilter !== "all" && userTypeFilter !== "registered_without_plan") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Purchase filter
    if (purchaseFilter === "with_purchases") {
      filtered = filtered.filter(user => userPurchases.includes(user.user_id));
    } else if (purchaseFilter === "without_purchases") {
      filtered = filtered.filter(user => !userPurchases.includes(user.user_id));
    }

    // Corporate filter
    if (corporateFilter === "corporate_admins") {
      filtered = filtered.filter(user => user.is_corporate_admin);
    } else if (corporateFilter === "corporate_members") {
      filtered = filtered.filter(user => user.is_corporate_member);
    } else if (corporateFilter === "corporate_all") {
      filtered = filtered.filter(user => user.is_corporate_admin || user.is_corporate_member);
    } else if (corporateFilter === "non_corporate") {
      filtered = filtered.filter(user => !user.is_corporate_admin && !user.is_corporate_member);
    }

    // Organization filter
    if (organizationFilter !== "all") {
      filtered = filtered.filter(user => 
        user.corporate_admin_org === organizationFilter || 
        user.corporate_member_org === organizationFilter
      );
    }

    setFilteredUsers(filtered);
  }, [userTypeFilter, planFilter, statusFilter, purchaseFilter, corporateFilter, organizationFilter, users, userPurchases]);

  const handleSendEmails = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }

    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSendEmails = async () => {
    setShowConfirm(false);
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          userIds: selectedUserIds,
          subject,
          message,
        }
      });

      if (error) throw error;

      const result = data as { success: boolean; sent: number; failed: number; total: number };
      
      if (result.success) {
        toast.success(
          `Email sent successfully to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}${
            result.failed > 0 ? ` (${result.failed} failed)` : ''
          }`
        );
        
        setSubject("");
        setMessage("");
        setSelectedUserIds([]);
      } else {
        throw new Error("Failed to send emails");
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error('Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const handleExportCSV = () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.user_id));
    
    const csvContent = [
      ['Name', 'Email', 'Plan', 'Status', 'Corporate Role', 'Organization'].join(','),
      ...selectedUsers.map(user => {
        const corpRole = user.is_corporate_admin ? 'Admin' : user.is_corporate_member ? 'Member' : '';
        const org = user.corporate_admin_org || user.corporate_member_org || '';
        return [
          user.full_name || 'Unknown',
          user.email || '',
          user.plan_type,
          user.status,
          corpRole,
          org
        ].map(field => `"${field}"`).join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-recipients-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedUsers.length} recipients to CSV`);
  };

  const isPlanFilterDisabled = userTypeFilter === "registered_without_plan";
  const isStatusFilterDisabled = userTypeFilter === "registered_without_plan";

  const renderCorporateBadge = (user: UserData) => {
    if (user.is_corporate_admin) {
      return (
        <Badge variant="default" className="text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          Admin: {user.corporate_admin_org}
        </Badge>
      );
    }
    if (user.is_corporate_member) {
      return (
        <Badge variant="secondary" className="text-xs flex items-center gap-1">
          <Users className="h-3 w-3" />
          Member: {user.corporate_member_org}
        </Badge>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-lg">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email Notifications
          </CardTitle>
          <CardDescription>
            Send email notifications to registered users based on filters and custom selection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Filter Recipients</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Registered Users</SelectItem>
                  <SelectItem value="registered_with_plan">With Premium Plan</SelectItem>
                  <SelectItem value="registered_without_plan">Free Users Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={planFilter} 
                onValueChange={setPlanFilter}
                disabled={isPlanFilterDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="gold">Gold Members</SelectItem>
                  <SelectItem value="platinum">Platinum Members</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
                disabled={isStatusFilterDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={purchaseFilter} onValueChange={setPurchaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Purchase Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="with_purchases">With Purchases</SelectItem>
                  <SelectItem value="without_purchases">Without Purchases</SelectItem>
                </SelectContent>
              </Select>

              <Select value={corporateFilter} onValueChange={setCorporateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Corporate Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="corporate_admins">🏢 Corporate Admins Only</SelectItem>
                  <SelectItem value="corporate_members">👥 Corporate Members Only</SelectItem>
                  <SelectItem value="corporate_all">🏢 All Corporate Users</SelectItem>
                  <SelectItem value="non_corporate">Non-Corporate Users</SelectItem>
                </SelectContent>
              </Select>

              {organizations.length > 0 && (
                <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Organizations</SelectItem>
                    {organizations.map(org => (
                      <SelectItem key={org} value={org}>
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{filteredUsers.length} users match filters</span>
            </div>
          </div>

          {/* User Selection Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Select Recipients</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserIds([])}
                  disabled={selectedUserIds.length === 0}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={selectedUserIds.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected ({selectedUserIds.length})
                </Button>
              </div>
            </div>
            
            <UserSelectionTable
              users={filteredUsers}
              selectedUserIds={selectedUserIds}
              onSelectionChange={setSelectedUserIds}
            />

            {/* Selected Recipients Summary */}
            {selectedUserIds.length > 0 && (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Selected Recipients: {selectedUserIds.length}</span>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {users
                    .filter(u => selectedUserIds.includes(u.user_id))
                    .map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between text-sm py-1 px-2 bg-background rounded">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{user.full_name || 'Unknown'}</span>
                          <span className="text-muted-foreground ml-2">({user.email})</span>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-wrap justify-end">
                          <Badge variant={user.plan_type === 'gold' || user.plan_type === 'platinum' ? 'default' : 'outline'} className="text-xs">
                            {user.plan_type.charAt(0).toUpperCase() + user.plan_type.slice(1)}
                          </Badge>
                          {renderCorporateBadge(user)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Compose Email</h3>
              {templates.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedTemplate}
                    onValueChange={(value) => {
                      setSelectedTemplate(value);
                      const template = templates.find(t => t.id === value);
                      if (template) {
                        setSubject(template.subject);
                        setMessage(template.body);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Use template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Subject</label>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Message</label>
              <Textarea
                placeholder="Your message to users..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                disabled={sending}
                className="break-words-safe resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Plain text will be converted to HTML. Line breaks will be preserved.
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {selectedUserIds.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email Preview</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>This email will be sent to <strong>{selectedUserIds.length}</strong> recipient{selectedUserIds.length !== 1 ? 's' : ''}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userTypeFilter !== "all" && (
                    <Badge variant="secondary">
                      {userTypeFilter === "registered_with_plan" && "Premium Users"}
                      {userTypeFilter === "registered_without_plan" && "Free Users"}
                    </Badge>
                  )}
                  {planFilter !== "all" && !isPlanFilterDisabled && (
                    <Badge variant="secondary">
                      {planFilter.charAt(0).toUpperCase() + planFilter.slice(1)} Plan
                    </Badge>
                  )}
                  {corporateFilter !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {corporateFilter === "corporate_admins" && "Corporate Admins"}
                      {corporateFilter === "corporate_members" && "Corporate Members"}
                      {corporateFilter === "corporate_all" && "All Corporate"}
                      {corporateFilter === "non_corporate" && "Non-Corporate"}
                    </Badge>
                  )}
                  {organizationFilter !== "all" && (
                    <Badge variant="secondary">
                      Org: {organizationFilter}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleSendEmails}
            disabled={sending || !subject || !message || selectedUserIds.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : `Send Email to ${selectedUserIds.length} Recipient${selectedUserIds.length !== 1 ? 's' : ''}`}
          </Button>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Email Sending</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to send an email to {selectedUserIds.length} recipient{selectedUserIds.length !== 1 ? 's' : ''}.
                  <br /><br />
                  <strong>Subject:</strong> {subject}
                  <br /><br />
                  This action cannot be undone. Are you sure you want to proceed?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmSendEmails}>
                  Send Emails
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}