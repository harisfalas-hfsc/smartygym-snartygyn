import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Megaphone, Send, Users, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { UserSelectionTable } from "./UserSelectionTable";

interface UserData {
  user_id: string;
  email?: string;
  full_name: string | null;
  plan_type: string;
  status: string;
}

export function UnifiedAnnouncementSender() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Filters
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  
  // Announcement content
  const [announcementType, setAnnouncementType] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Confirmation dialog
  const [showConfirm, setShowConfirm] = useState(false);

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
      }));

      setUsers(registeredUsers);
      setFilteredUsers(registeredUsers);
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

  useEffect(() => {
    let filtered = users;

    if (userTypeFilter !== "all") {
      if (userTypeFilter === "premium") {
        filtered = filtered.filter(user => 
          user.plan_type === 'gold' || user.plan_type === 'platinum'
        );
      } else if (userTypeFilter === "free") {
        filtered = filtered.filter(user => user.plan_type === 'free');
      }
    }

    if (planFilter !== "all") {
      filtered = filtered.filter(user => user.plan_type === planFilter);
    }

    setFilteredUsers(filtered);
  }, [userTypeFilter, planFilter, users]);

  const handleSendAnnouncement = async () => {
    if (!announcementType) {
      toast.error("Please select an announcement type");
      return;
    }

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

  const confirmSendAnnouncement = async () => {
    setShowConfirm(false);
    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-unified-announcement', {
        body: {
          userIds: selectedUserIds,
          messageType: announcementType,
          subject,
          content: message,
        }
      });

      if (error) throw error;

      const result = data as { success: boolean; sent: number; failed: number; total: number };
      
      if (result.success) {
        toast.success(
          `Announcement sent to ${result.sent} recipient${result.sent !== 1 ? 's' : ''}${
            result.failed > 0 ? ` (${result.failed} failed)` : ''
          } via dashboard messages and email`
        );
        
        // Clear form
        setAnnouncementType("");
        setSubject("");
        setMessage("");
        setSelectedUserIds([]);
      } else {
        throw new Error("Failed to send announcement");
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Unified Content Announcements
        </CardTitle>
        <CardDescription>
          Send announcements about new workouts, programs, or blog articles via dashboard messages AND email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Announcement Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Announcement Type</label>
          <Select value={announcementType} onValueChange={setAnnouncementType}>
            <SelectTrigger>
              <SelectValue placeholder="Select announcement type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="announcement_new_workout">🏋️ New Workout</SelectItem>
              <SelectItem value="announcement_new_program">📅 New Training Program</SelectItem>
              <SelectItem value="announcement_new_service">✨ New Service</SelectItem>
              <SelectItem value="announcement_special_offer">🎁 Special Offer</SelectItem>
              <SelectItem value="announcement_update">📢 Platform Update</SelectItem>
              <SelectItem value="announcement_event">🎉 Special Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Recipients */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Filter Recipients</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium Members Only</SelectItem>
                <SelectItem value="free">Free Users Only</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{filteredUsers.length} users match filters</span>
          </div>
        </div>

        {/* User Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Select Recipients</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedUserIds([])}
              disabled={selectedUserIds.length === 0}
            >
              Clear Selection
            </Button>
          </div>
          
          <UserSelectionTable
            users={filteredUsers}
            selectedUserIds={selectedUserIds}
            onSelectionChange={setSelectedUserIds}
          />
        </div>

        {/* Announcement Content */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Compose Announcement</h3>
          
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Subject</label>
            <Input
              placeholder="Announcement subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Message</label>
            <Textarea
              placeholder="Your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={10}
              disabled={sending}
              className="break-words-safe resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This message will be sent both as a dashboard notification AND as an email
            </p>
          </div>
        </div>

        {/* Preview */}
        {selectedUserIds.length > 0 && (
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Announcement Preview</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>This announcement will be sent to <strong>{selectedUserIds.length}</strong> recipient{selectedUserIds.length !== 1 ? 's' : ''}</p>
              <p className="flex items-center gap-2">
                <Badge variant="secondary">Dashboard Message</Badge>
                <span>+</span>
                <Badge variant="secondary">Email</Badge>
              </p>
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSendAnnouncement}
          disabled={sending || !announcementType || !subject || !message || selectedUserIds.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {sending ? "Sending..." : `Send Announcement (Dashboard + Email)`}
        </Button>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Announcement Sending</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to send this announcement to {selectedUserIds.length} recipient{selectedUserIds.length !== 1 ? 's' : ''} via:
                <ul className="list-disc list-inside mt-2">
                  <li>Dashboard messages (internal notifications)</li>
                  <li>Email (to their registered email addresses)</li>
                </ul>
                <br />
                This action cannot be undone. Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSendAnnouncement}>
                Send Announcement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
