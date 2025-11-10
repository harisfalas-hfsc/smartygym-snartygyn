import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, Send, Users, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";

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
  nickname: string | null;
  plan_type: string;
  status: string;
  user_type: 'registered' | 'newsletter'; // Track user type
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  active: boolean;
}

export function EmailComposer() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Filters
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Email content
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  
  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch registered users with emails from edge function
      const { data: usersData, error: usersError } = await supabase.functions.invoke('get-users-with-emails');
      
      if (usersError) throw usersError;

      const { data: subscriptions, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('user_id, plan_type, status');

      if (subsError) throw subsError;

      // Fetch newsletter subscribers
      const { data: newsletterSubs, error: newsletterError } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, name, active')
        .eq('active', true);

      if (newsletterError) throw newsletterError;

      // Combine registered users with emails
      const registeredUsers: UserData[] = (usersData?.users || []).map((user: any) => {
        const subscription = subscriptions?.find(sub => sub.user_id === user.id);
        
        return {
          user_id: user.id,
          email: user.email,
          full_name: user.full_name || user.email,
          nickname: user.nickname,
          plan_type: subscription?.plan_type || 'free',
          status: subscription?.status || 'inactive',
          user_type: 'registered' as const,
        };
      });

      // Add newsletter subscribers as separate user type
      const newsletterUsers: UserData[] = (newsletterSubs || []).map(sub => ({
        user_id: sub.id,
        email: sub.email,
        full_name: sub.name,
        nickname: null,
        plan_type: 'newsletter',
        status: 'active',
        user_type: 'newsletter' as const,
      }));

      const allUsers = [...registeredUsers, ...newsletterUsers];
      setUsers(allUsers);
      setFilteredUsers(allUsers);
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

    // User type filter (registered vs newsletter)
    if (userTypeFilter !== "all") {
      if (userTypeFilter === "registered_with_plan") {
        filtered = filtered.filter(user => 
          user.user_type === 'registered' && 
          (user.plan_type === 'gold' || user.plan_type === 'platinum')
        );
      } else if (userTypeFilter === "registered_without_plan") {
        filtered = filtered.filter(user => 
          user.user_type === 'registered' && 
          user.plan_type === 'free'
        );
      } else if (userTypeFilter === "registered_all") {
        filtered = filtered.filter(user => user.user_type === 'registered');
      } else if (userTypeFilter === "newsletter_only") {
        filtered = filtered.filter(user => user.user_type === 'newsletter');
      }
    }

    // Plan filter (only applies to registered users)
    if (planFilter !== "all") {
      filtered = filtered.filter(user => user.plan_type === planFilter);
    }

    // Status filter (only applies to registered users)
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [userTypeFilter, planFilter, statusFilter, users]);

  const handleSendEmails = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }

    if (filteredUsers.length === 0) {
      toast.error("No recipients selected");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSendEmails = async () => {
    setShowConfirm(false);
    setSending(true);

    try {
      // Separate registered users and newsletter subscribers
      const registeredUserIds = filteredUsers
        .filter(u => u.user_type === 'registered')
        .map(u => u.user_id);
      
      const newsletterEmails = filteredUsers
        .filter(u => u.user_type === 'newsletter')
        .map(u => ({ email: u.email!, name: u.full_name || 'Subscriber' }));
      
      const { data, error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          userIds: registeredUserIds,
          newsletterRecipients: newsletterEmails,
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
        
        // Clear form
        setSubject("");
        setMessage("");
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email Notifications
          </CardTitle>
          <CardDescription>
            Send email notifications to users based on subscription filters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filter Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select Recipients</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="registered_all">All Registered Users</SelectItem>
                  <SelectItem value="registered_with_plan">Registered with Plan</SelectItem>
                  <SelectItem value="registered_without_plan">Registered without Plan</SelectItem>
                  <SelectItem value="newsletter_only">Newsletter Subscribers</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Plan Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free Users</SelectItem>
                  <SelectItem value="gold">Gold Members</SelectItem>
                  <SelectItem value="platinum">Platinum Members</SelectItem>
                  <SelectItem value="newsletter">Newsletter Only</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

              <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{filteredUsers.length} recipients</span>
              </div>
            </div>
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
              />
              <p className="text-xs text-muted-foreground">
                Use {`{{name}}`}, {`{{plan_type}}`}, {`{{renewal_date}}`} as placeholders. Plain text will be converted to HTML.
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {filteredUsers.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email Preview</span>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>This email will be sent to <strong>{filteredUsers.length}</strong> recipient{filteredUsers.length !== 1 ? 's' : ''}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userTypeFilter !== "all" && (
                    <Badge variant="secondary">
                      {userTypeFilter === "registered_all" && "All Registered"}
                      {userTypeFilter === "registered_with_plan" && "With Plan"}
                      {userTypeFilter === "registered_without_plan" && "Without Plan"}
                      {userTypeFilter === "newsletter_only" && "Newsletter Only"}
                    </Badge>
                  )}
                  {planFilter !== "all" && (
                    <Badge variant="secondary">
                      {planFilter.charAt(0).toUpperCase() + planFilter.slice(1)} Plan
                    </Badge>
                  )}
                  {statusFilter !== "all" && (
                    <Badge variant="secondary">
                      {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Status
                    </Badge>
                  )}
                </div>
                <div className="text-xs mt-2 space-y-1">
                  <p>• Registered users: {filteredUsers.filter(u => u.user_type === 'registered').length}</p>
                  <p>• Newsletter subscribers: {filteredUsers.filter(u => u.user_type === 'newsletter').length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendEmails}
            disabled={sending || !subject.trim() || !message.trim() || filteredUsers.length === 0}
            className="w-full"
            size="lg"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {filteredUsers.length} Recipient{filteredUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Email</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to send an email to <strong>{filteredUsers.length}</strong> user{filteredUsers.length !== 1 ? 's' : ''}.
              <br /><br />
              <strong>Subject:</strong> {subject}
              <br /><br />
              This action cannot be undone. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSendEmails}>
              <Send className="h-4 w-4 mr-2" />
              Send Emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
