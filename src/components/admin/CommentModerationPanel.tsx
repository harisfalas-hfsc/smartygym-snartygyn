import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Flag, Ban, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
  workout_id: string | null;
  workout_name: string | null;
  program_id: string | null;
  program_name: string | null;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    nickname: string | null;
  };
}

interface ContentFlag {
  id: string;
  content_id: string;
  content_type: string;
  reason: string;
  status: string;
  created_at: string;
  flagged_by: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
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
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    nickname: string | null;
  };
}

export const CommentModerationPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [flags, setFlags] = useState<ContentFlag[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("permanent");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchComments(), fetchFlags(), fetchBannedUsers()]);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data: commentsData, error } = await supabase
      .from('workout_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      return;
    }

    // Fetch profiles separately
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, nickname')
      .in('user_id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));
    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      profile: profilesMap.get(comment.user_id)
    }));

    setComments(commentsWithProfiles as Comment[]);
  };

  const fetchFlags = async () => {
    const { data: flagsData, error } = await supabase
      .from('content_flags')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flags:', error);
      return;
    }

    if (!flagsData || flagsData.length === 0) {
      setFlags([]);
      return;
    }

    // Fetch profiles separately
    const userIds = [...new Set(flagsData.map(f => f.flagged_by))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, nickname')
      .in('user_id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));
    const flagsWithProfiles = flagsData.map(flag => ({
      ...flag,
      profile: profilesMap.get(flag.flagged_by)
    }));

    setFlags(flagsWithProfiles as ContentFlag[]);
  };

  const fetchBannedUsers = async () => {
    const { data: banData, error } = await supabase
      .from('banned_users')
      .select('*')
      .order('banned_at', { ascending: false });

    if (error) {
      console.error('Error fetching banned users:', error);
      return;
    }

    if (!banData || banData.length === 0) {
      setBannedUsers([]);
      return;
    }

    // Fetch profiles separately
    const userIds = [...new Set(banData.map(b => b.user_id))];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, nickname')
      .in('user_id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.user_id, p]));
    const bansWithProfiles = banData.map(ban => ({
      ...ban,
      profile: profilesMap.get(ban.user_id)
    }));

    setBannedUsers(bansWithProfiles as BannedUser[]);
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('workout_comments')
      .delete()
      .eq('id', selectedComment.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
      return;
    }

    // Log moderation action
    await supabase.from('moderation_actions').insert({
      moderator_id: user.id,
      target_id: selectedComment.id,
      target_type: 'comment',
      action_type: 'delete',
      reason: 'Admin deletion'
    });

    toast({
      title: "Success",
      description: "Comment deleted successfully"
    });

    setDeleteDialogOpen(false);
    setSelectedComment(null);
    fetchComments();
  };

  const handleBanUser = async () => {
    if (!selectedUserId || !banReason) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const expiresAt = banDuration === "permanent" ? null : 
      new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: selectedUserId,
        banned_by: user.id,
        reason: banReason,
        is_permanent: banDuration === "permanent",
        expires_at: expiresAt
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive"
      });
      return;
    }

    // Log moderation action
    await supabase.from('moderation_actions').insert({
      moderator_id: user.id,
      target_id: selectedUserId,
      target_type: 'user',
      action_type: 'ban',
      reason: banReason
    });

    toast({
      title: "Success",
      description: "User banned successfully"
    });

    setBanDialogOpen(false);
    setSelectedUserId(null);
    setBanReason("");
    setBanDuration("permanent");
    fetchBannedUsers();
  };

  const handleUnbanUser = async (banId: string, userId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('banned_users')
      .delete()
      .eq('id', banId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive"
      });
      return;
    }

    // Log moderation action
    await supabase.from('moderation_actions').insert({
      moderator_id: user.id,
      target_id: userId,
      target_type: 'user',
      action_type: 'unban'
    });

    toast({
      title: "Success",
      description: "User unbanned successfully"
    });

    fetchBannedUsers();
  };

  const handleReviewFlag = async (flagId: string, status: 'reviewed' | 'dismissed') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('content_flags')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', flagId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update flag",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Flag ${status} successfully`
    });

    fetchFlags();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="flags">
            <Flag className="h-4 w-4 mr-2" />
            Flagged ({flags.length})
          </TabsTrigger>
          <TabsTrigger value="banned">
            <Ban className="h-4 w-4 mr-2" />
            Banned ({bannedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Comments</CardTitle>
              <CardDescription>Review and moderate user comments</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar>
                              <AvatarImage src={comment.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {comment.profile?.full_name?.[0] || comment.profile?.nickname?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {comment.profile?.full_name || comment.profile?.nickname || 'Anonymous'}
                                </span>
                                <Badge variant="outline">
                                  {format(new Date(comment.created_at), 'MMM d, yyyy')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{comment.comment_text}</p>
                              <p className="text-xs text-muted-foreground">
                                On: {comment.workout_name || comment.program_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUserId(comment.user_id);
                                setBanDialogOpen(true);
                              }}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedComment(comment);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No comments yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Content</CardTitle>
              <CardDescription>Review content flagged by users</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {flags.map((flag) => (
                    <Card key={flag.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge>{flag.content_type}</Badge>
                            <Badge variant="outline">
                              {format(new Date(flag.created_at), 'MMM d, yyyy')}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Reason:</p>
                            <p className="text-sm text-muted-foreground">{flag.reason}</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Flagged by:</p>
                            <p className="text-sm text-muted-foreground">
                              {flag.profile?.full_name || flag.profile?.nickname || 'Anonymous'}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReviewFlag(flag.id, 'reviewed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Reviewed
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReviewFlag(flag.id, 'dismissed')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {flags.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No pending flags
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banned Users</CardTitle>
              <CardDescription>Manage banned users</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {bannedUsers.map((ban) => (
                    <Card key={ban.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <Avatar>
                              <AvatarImage src={ban.profile?.avatar_url || undefined} />
                              <AvatarFallback>
                                {ban.profile?.full_name?.[0] || ban.profile?.nickname?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                  {ban.profile?.full_name || ban.profile?.nickname || 'Anonymous'}
                                </span>
                                <Badge variant={ban.is_permanent ? "destructive" : "secondary"}>
                                  {ban.is_permanent ? "Permanent" : "Temporary"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Reason:</span> {ban.reason}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Banned: {format(new Date(ban.banned_at), 'MMM d, yyyy')}
                              </p>
                              {ban.expires_at && (
                                <p className="text-xs text-muted-foreground">
                                  Expires: {format(new Date(ban.expires_at), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnbanUser(ban.id, ban.user_id)}
                          >
                            Unban
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {bannedUsers.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No banned users
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Enter the reason and duration for banning this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter ban reason..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={banDuration}
                onChange={(e) => setBanDuration(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="permanent">Permanent</option>
                <option value="7">7 Days</option>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBanUser} disabled={!banReason}>
              Ban User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
