import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Building2, 
  Users, 
  Search, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Calendar,
  Crown
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CorporateSubscription {
  id: string;
  admin_user_id: string;
  organization_name: string;
  plan_type: string;
  max_users: number;
  current_users_count: number;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  adminEmail?: string;
  adminName?: string;
  members: CorporateMember[];
}

interface CorporateMember {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export function CorporateDashboard() {
  const [subscriptions, setSubscriptions] = useState<CorporateSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [expandedOrgs, setExpandedOrgs] = useState<Set<string>>(new Set());

  const fetchCorporateData = async () => {
    setLoading(true);
    try {
      // Fetch all corporate subscriptions
      const { data: corpSubs, error: corpError } = await supabase
        .from('corporate_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (corpError) throw corpError;

      // Fetch all corporate members
      const { data: members, error: membersError } = await supabase
        .from('corporate_members')
        .select('*');

      if (membersError) throw membersError;

      // Fetch user emails from edge function
      const { data: usersData } = await supabase.functions.invoke('get-users-with-emails');
      const usersMap = new Map(usersData?.users?.map((u: any) => [u.user_id, u]) || []);

      // Build the combined data
      const enrichedSubs: CorporateSubscription[] = (corpSubs || []).map(sub => {
        const adminUser = usersMap.get(sub.admin_user_id) as any;
        const orgMembers = (members || [])
          .filter(m => m.corporate_subscription_id === sub.id)
          .map(m => {
            const memberUser = usersMap.get(m.user_id) as any;
            return {
              id: m.id,
              user_id: m.user_id,
              email: memberUser?.email || m.email,
              full_name: memberUser?.full_name || null,
              created_at: m.created_at
            };
          });

        return {
          ...sub,
          adminEmail: adminUser?.email,
          adminName: adminUser?.full_name,
          members: orgMembers
        };
      });

      setSubscriptions(enrichedSubs);
    } catch (error) {
      console.error('Error fetching corporate data:', error);
      toast.error('Failed to load corporate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCorporateData();
  }, []);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedOrgs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedOrgs(newExpanded);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.adminName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === "all" || sub.plan_type === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'dynamic': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'power': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'elite': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'enterprise': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return '';
    }
  };

  const getMaxUsers = (plan: string) => {
    switch (plan) {
      case 'dynamic': return 10;
      case 'power': return 20;
      case 'elite': return 30;
      case 'enterprise': return '∞';
      default: return 0;
    }
  };

  const totalOrganizations = subscriptions.length;
  const totalMembers = subscriptions.reduce((sum, s) => sum + s.members.length, 0);
  const activeOrganizations = subscriptions.filter(s => s.status === 'active').length;

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-2xl font-bold">{totalOrganizations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">{activeOrganizations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Members/Org</p>
                <p className="text-2xl font-bold">
                  {totalOrganizations > 0 ? (totalMembers / totalOrganizations).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Corporate Organizations
              </CardTitle>
              <CardDescription>
                Manage all corporate subscriptions and their team members
              </CardDescription>
            </div>
            <Button onClick={fetchCorporateData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by organization or admin..."
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
                <SelectItem value="dynamic">Dynamic (10)</SelectItem>
                <SelectItem value="power">Power (20)</SelectItem>
                <SelectItem value="elite">Elite (30)</SelectItem>
                <SelectItem value="enterprise">Enterprise (∞)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Organizations List */}
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No corporate organizations found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((sub) => (
                <Collapsible
                  key={sub.id}
                  open={expandedOrgs.has(sub.id)}
                  onOpenChange={() => toggleExpand(sub.id)}
                >
                  <Card className="border-2">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{sub.organization_name}</CardTitle>
                              <CardDescription>
                                Admin: {sub.adminName || sub.adminEmail || 'Unknown'}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getPlanColor(sub.plan_type)}>
                              {sub.plan_type.toUpperCase()}
                            </Badge>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {sub.members.length} / {getMaxUsers(sub.plan_type)} members
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Expires: {format(new Date(sub.current_period_end), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <Badge variant={sub.status === 'active' ? 'default' : 'destructive'}>
                              {sub.status}
                            </Badge>
                            {expandedOrgs.has(sub.id) ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="border-t pt-4">
                        {/* Admin Info */}
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800">Administrator</p>
                              <p className="text-sm">{sub.adminName || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{sub.adminEmail}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sub.adminEmail && (window.location.href = `mailto:${sub.adminEmail}`)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Email Admin
                            </Button>
                          </div>
                        </div>

                        {/* Members Table */}
                        <div>
                          <h4 className="text-sm font-medium mb-2">Team Members ({sub.members.length})</h4>
                          {sub.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No team members added yet
                            </p>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Added</TableHead>
                                  <TableHead>Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {sub.members.map((member) => (
                                  <TableRow key={member.id}>
                                    <TableCell className="font-medium">
                                      {member.full_name || 'Anonymous'}
                                    </TableCell>
                                    <TableCell>{member.email}</TableCell>
                                    <TableCell>
                                      {format(new Date(member.created_at), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = `mailto:${member.email}`}
                                      >
                                        <Mail className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </div>

                        {/* Subscription Details */}
                        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Created</p>
                            <p>{format(new Date(sub.created_at), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Period Start</p>
                            <p>{format(new Date(sub.current_period_start), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Period End</p>
                            <p>{format(new Date(sub.current_period_end), 'MMM d, yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Slots Used</p>
                            <p>{sub.members.length} / {getMaxUsers(sub.plan_type)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
