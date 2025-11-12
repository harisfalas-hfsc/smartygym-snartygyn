import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Flag, Ban, Trash2, CheckCircle2, XCircle, AlertTriangle, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Comment {
  id: string;
  comment_text: string;
  user_id: string;
  workout_name: string | null;
  program_name: string | null;
  created_at: string;
  user_profile?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  };
}

interface ContentFlag {
  id: string;
  content_type: string;
  content_id: string;
  reason: string;
  status: string;
  created_at: string;
  flagged_by_profile?: {
    full_name: string | null;
    nickname: string | null;
  };
}

interface BannedUser {
  id: string;
  user_id: string;
  reason: string;
  banned_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  user_profile?: {
    full_name: string | null;
    nickname: string | null;
    avatar_url: string | null;
  };
}

export function ModerationDashboard() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Ban form
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");
  const [banDays, setBanDays] = useState(7);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_comments')
        .select(`
          id,
          comment_text,
          user_id,
          workout_name,
          program_name,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, nickname, avatar_url')
        .in('user_id', userIds);

      const commentsWithProfiles = data.map(comment => ({
        ...comment,
        user_profile: profiles?.find(p => p.user_id === comment.user_id)
      }));

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    }
  };

  const fetchFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('content_flags')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch flagged by profiles
      const userIds = [...new Set(data.map(f => f.flagged_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, nickname')
        .in('user_id', userIds);

      const flagsWithProfiles = data.map(flag => ({
        ...flag,
        flagged_by_profile: profiles?.find(p => p.user_id === flag.flagged_by)
      }));

      setFlags(flagsWithProfiles);
    } catch (error) {
      console.error('Error fetching flags:', error);
      toast.error('Failed to load flags');
    }
  };

  const fetchBannedUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('banned_users')
        .select('*')
        .order('banned_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set(data.map(b => b.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, nickname, avatar_url')
        .in('user_id', userIds);

      const bannedWithProfiles = data.map(ban => ({
        ...ban,
        user_profile: profiles?.find(p => p.user_id === ban.user_id)
      }));

      setBannedUsers(bannedWithProfiles);
    } catch (error) {
      console.error('Error fetching banned users:', error);
      toast.error('Failed to load banned users');
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchComments(), fetchFlags(), fetchBannedUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: deleteError } = await supabase
        .from('workout_comments')
        .delete()
        .eq('id', selectedComment.id);

      if (deleteError) throw deleteError;

      // Log moderation action
      await supabase.from('moderation_actions').insert({
        action_type: 'delete_comment',
        target_type: 'comment',
        target_id: selectedComment.id,
        moderator_id: user.id,
        reason: 'Deleted via moderation dashboard'
      });

      toast.success("Comment deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedComment(null);
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleBanUser = async () => {
    if (!selectedUserId || !banReason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const expiresAt = banDuration === "permanent" 
        ? null 
        : new Date(Date.now() + banDays * 24 * 60 * 60 * 1000).toISOString();

      const { error: banError } = await supabase
        .from('banned_users')
        .insert({
          user_id: selectedUserId,
          banned_by: user.id,
          reason: banReason,
          is_permanent: banDuration === "permanent",
          expires_at: expiresAt
        });

      if (banError) throw banError;

      // Log moderation action
      await supabase.from('moderation_actions').insert({
        action_type: 'ban_user',
        target_type: 'user',
        target_id: selectedUserId,
        moderator_id: user.id,
        reason: banReason
      });

      toast.success("User banned successfully");
      setShowBanDialog(false);
      setBanReason("");
      setBanDuration("permanent");
      setSelectedUserId(null);
      fetchBannedUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error('Failed to ban user');
    }
  };

  const handleUnbanUser = async (banId: string, userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('id', banId);

      if (error) throw error;

      // Log moderation action
      await supabase.from('moderation_actions').insert({
        action_type: 'unban_user',
        target_type: 'user',
        target_id: userId,
        moderator_id: user.id
      });

      toast.success("User unbanned successfully");
      fetchBannedUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Failed to unban user');
    }
  };

  const handleReviewFlag = async (flagId: string, status: 'reviewed' | 'dismissed') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('content_flags')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', flagId);

      if (error) throw error;

      toast.success(`Flag ${status}`);
      fetchFlags();
    } catch (error) {
      console.error('Error reviewing flag:', error);
      toast.error('Failed to review flag');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-lg">Loading moderation data...</div>
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
            <Shield className="h-5 w-5" />
            Community Moderation
          </CardTitle>
          <CardDescription>
            Manage comments, flags, and user bans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comments" className="w-full">
            <div className="w-full overflow-x-auto">
              <TabsList className="w-full inline-flex sm:grid sm:grid-cols-3 min-w-max sm:min-w-0">
                <TabsTrigger value="comments" className="flex-shrink-0 whitespace-nowrap">
                  Comments ({comments.length})
                </TabsTrigger>
                <TabsTrigger value="flags" className="flex-shrink-0 whitespace-nowrap">
                  Flags ({flags.filter(f => f.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="banned" className="flex-shrink-0 whitespace-nowrap">
                  Banned ({bannedUsers.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4 mt-4">
              {comments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No comments found
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          <Avatar>
                            <AvatarImage src={comment.user_profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {comment.user_profile?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {comment.user_profile?.full_name || comment.user_profile?.nickname || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              On: {comment.workout_name || comment.program_name || 'Unknown'}
                            </p>
                            <p className="text-sm">{comment.comment_text}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(comment.user_id);
                              setShowBanDialog(true);
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedComment(comment);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Flags Tab */}
            <TabsContent value="flags" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Flagged By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No flags found
                      </TableCell>
                    </TableRow>
                  ) : (
                    flags.map((flag) => (
                      <TableRow key={flag.id}>
                        <TableCell>
                          <Badge variant="outline">{flag.content_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{flag.reason}</TableCell>
                        <TableCell>
                          {flag.flagged_by_profile?.full_name || flag.flagged_by_profile?.nickname || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              flag.status === 'pending' ? 'secondary' :
                              flag.status === 'reviewed' ? 'default' : 'outline'
                            }
                          >
                            {flag.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(flag.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {flag.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReviewFlag(flag.id, 'reviewed')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReviewFlag(flag.id, 'dismissed')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            {/* Banned Users Tab */}
            <TabsContent value="banned" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Banned</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bannedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No banned users
                      </TableCell>
                    </TableRow>
                  ) : (
                    bannedUsers.map((ban) => (
                      <TableRow key={ban.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={ban.user_profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {ban.user_profile?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <span>
                              {ban.user_profile?.full_name || ban.user_profile?.nickname || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{ban.reason}</TableCell>
                        <TableCell>
                          <Badge variant={ban.is_permanent ? 'destructive' : 'secondary'}>
                            {ban.is_permanent ? 'Permanent' : 'Temporary'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {ban.expires_at ? format(new Date(ban.expires_at), 'MMM d, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(ban.banned_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnbanUser(ban.id, ban.user_id)}
                          >
                            Unban
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Comment Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this comment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Specify the reason and duration for this ban
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Why is this user being banned?"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="temporary">Temporary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {banDuration === "temporary" && (
              <div className="space-y-2">
                <Label>Days</Label>
                <Select value={banDays.toString()} onValueChange={(v) => setBanDays(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBanUser} disabled={!banReason.trim()}>
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
