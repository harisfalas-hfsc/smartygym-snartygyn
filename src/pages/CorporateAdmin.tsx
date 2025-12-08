import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Building2, 
  Users, 
  Crown,
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  RefreshCw,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface CorporateSubscription {
  id: string;
  organization_name: string;
  plan_type: string;
  max_users: number;
  current_users_count: number;
  current_period_start: string;
  current_period_end: string;
  status: string;
}

interface CorporateMember {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
  profile?: {
    full_name: string | null;
  };
}

export default function CorporateAdmin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<CorporateSubscription | null>(null);
  const [members, setMembers] = useState<CorporateMember[]>([]);
  const [addingMember, setAddingMember] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");

  useEffect(() => {
    // Check for success parameter
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Welcome to Smarty Corporate!",
        description: "Your corporate subscription is now active. Start adding team members below.",
      });
    }
  }, [searchParams, toast]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCorporateData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCorporateData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const fetchCorporateData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch corporate subscription
      const { data: corpSub, error: subError } = await supabase
        .from('corporate_subscriptions')
        .select('*')
        .eq('admin_user_id', userId)
        .maybeSingle();

      if (subError) {
        console.error('Error fetching corporate subscription:', subError);
      }

      if (corpSub) {
        setSubscription(corpSub);
        
        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('corporate_members')
          .select(`
            id,
            user_id,
            email,
            created_at
          `)
          .eq('corporate_subscription_id', corpSub.id)
          .order('created_at', { ascending: false });

        if (membersError) {
          console.error('Error fetching members:', membersError);
        } else if (membersData) {
          // Fetch profiles for members
          const memberIds = membersData.map(m => m.user_id);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, full_name')
            .in('user_id', memberIds);

          const membersWithProfiles = membersData.map(member => ({
            ...member,
            profile: profiles?.find(p => p.user_id === member.user_id) || null,
          }));

          setMembers(membersWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error fetching corporate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and name for the new member.",
        variant: "destructive",
      });
      return;
    }

    setAddingMember(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-corporate-member', {
        body: {
          email: newMemberEmail,
          fullName: newMemberName,
          password: newMemberPassword || undefined,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Member Added Successfully!",
        description: `${newMemberName} has been added to your team and will receive login credentials via email.`,
      });

      // Refresh data
      if (user) {
        fetchCorporateData(user.id);
      }

      // Reset form
      setNewMemberEmail("");
      setNewMemberName("");
      setNewMemberPassword("");
      setDialogOpen(false);

    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Failed to Add Member",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    try {
      // Delete from corporate_members
      const { error } = await supabase
        .from('corporate_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Update count
      if (subscription) {
        await supabase
          .from('corporate_subscriptions')
          .update({
            current_users_count: Math.max(0, subscription.current_users_count - 1),
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);
      }

      toast({
        title: "Member Removed",
        description: `${memberEmail} has been removed from your team.`,
      });

      // Refresh data
      if (user) {
        fetchCorporateData(user.id);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Failed to Remove Member",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewMemberPassword(password);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(newMemberPassword);
    toast({ title: "Password Copied", description: "Password copied to clipboard." });
  };

  const getPlanDisplayName = (planType: string) => {
    const names: Record<string, string> = {
      dynamic: 'Smarty Dynamic',
      power: 'Smarty Power',
      elite: 'Smarty Elite',
      enterprise: 'Smarty Enterprise',
    };
    return names[planType] || planType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-4xl p-4 py-8">
          <Card className="text-center p-8">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
              <p className="text-muted-foreground mb-4">
                Please sign in to access the Corporate Admin Dashboard.
              </p>
              <Button onClick={() => navigate('/auth')}>Sign In</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-4xl p-4 py-8">
          <Card className="text-center p-8">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No Corporate Subscription</h2>
              <p className="text-muted-foreground mb-4">
                You don't have an active corporate subscription. Get started with a corporate plan to manage team members.
              </p>
              <Button onClick={() => navigate('/corporate')}>View Corporate Plans</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isActive = subscription.status === 'active';
  const usagePercentage = (subscription.current_users_count / subscription.max_users) * 100;
  const canAddMore = subscription.current_users_count < subscription.max_users;

  return (
    <>
      <Helmet>
        <title>Corporate Admin Dashboard | SmartyGym</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto max-w-6xl p-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Corporate Admin Dashboard</h1>
              <p className="text-muted-foreground">{subscription.organization_name}</p>
            </div>
          </div>

          {/* Subscription Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold">{getPlanDisplayName(subscription.plan_type)}</span>
                </div>
                <Badge className={isActive ? "bg-green-100 text-green-800 mt-2" : "bg-red-100 text-red-800 mt-2"}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-xl font-bold">
                    {subscription.current_users_count} / {subscription.max_users === 9999 ? '∞' : subscription.max_users}
                  </span>
                </div>
                {subscription.max_users !== 9999 && (
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Subscription Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <p>Ends: <span className="font-semibold">{format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Member Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Add Team Member
                  </CardTitle>
                  <CardDescription>
                    Create accounts for your team members with Platinum access
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!canAddMore || !isActive}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Team Member</DialogTitle>
                      <DialogDescription>
                        Create a new account for your team member. They will receive login credentials via email.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="member@company.com"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="John Smith"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password (Optional)</Label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={generateRandomPassword}
                          >
                            Generate
                          </Button>
                        </div>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Leave empty for auto-generated password"
                            value={newMemberPassword}
                            onChange={(e) => setNewMemberPassword(e.target.value)}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            {newMemberPassword && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={copyPassword}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMember} disabled={addingMember}>
                        {addingMember ? "Creating..." : "Create Account"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            {!canAddMore && (
              <CardContent>
                <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  You've reached your member limit ({subscription.max_users} users). 
                  Upgrade your plan to add more team members.
                </p>
              </CardContent>
            )}
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Members ({members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {members.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No team members yet. Add your first member above.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.profile?.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {format(new Date(member.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/20 text-primary">
                            <Crown className="h-3 w-3 mr-1" />
                            Platinum
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {member.email} from your team. Their account will remain but they will lose Platinum access.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleRemoveMember(member.id, member.email)}
                                >
                                  Remove Member
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
