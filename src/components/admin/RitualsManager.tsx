import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Search, Copy, Loader2, Sparkles, Calendar, RefreshCw, HeartPulse, ExternalLink, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RitualEditDialog } from "./RitualEditDialog";
import { RitualSchedulePreview } from "./RitualSchedulePreview";
import { RitualViewDialog } from "./RitualViewDialog";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast as sonnerToast } from "sonner";
import { addDays } from "date-fns";

interface Ritual {
  id: string;
  ritual_date: string;
  day_number: number;
  morning_content: string;
  midday_content: string;
  evening_content: string;
  created_at: string;
}

interface RitualsManagerProps {
  externalDialog?: boolean;
  setExternalDialog?: (value: boolean) => void;
}

export const RitualsManager = ({ externalDialog, setExternalDialog }: RitualsManagerProps) => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [filteredRituals, setFilteredRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingRitual, setViewingRitual] = useState<Ritual | null>(null);
  const [selectedRituals, setSelectedRituals] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshingSchedule, setRefreshingSchedule] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const tomorrowStr = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const { data: todayAssignment } = useQuery({
    queryKey: ["ritual-today", todayStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_date, cycle_number, daily_smarty_rituals(day_number)")
        .eq("ritual_date", todayStr)
        .maybeSingle();
      return data;
    },
  });

  const { data: tomorrowAssignment } = useQuery({
    queryKey: ["ritual-tomorrow", tomorrowStr],
    queryFn: async () => {
      const { data } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_date, cycle_number, daily_smarty_rituals(day_number)")
        .eq("ritual_date", tomorrowStr)
        .maybeSingle();
      return data;
    },
  });

  const { data: cycleStats } = useQuery({
    queryKey: ["ritual-cycle-stats"],
    queryFn: async () => {
      const [{ count: libCount }, { data: latest }] = await Promise.all([
        supabase.from("daily_smarty_rituals").select("id", { count: "exact", head: true }),
        supabase
          .from("daily_ritual_assignments")
          .select("cycle_number")
          .order("cycle_number", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      const cycle = latest?.cycle_number ?? 1;
      const { count: usedCount } = await supabase
        .from("daily_ritual_assignments")
        .select("ritual_id", { count: "exact", head: true })
        .eq("cycle_number", cycle);
      return {
        library: libCount || 0,
        cycle,
        used: usedCount || 0,
        remaining: (libCount || 0) - (usedCount || 0),
      };
    },
  });

  const handleRefreshSchedule = async () => {
    setRefreshingSchedule(true);
    try {
      const { error } = await supabase.functions.invoke("assign-daily-ritual", { body: { action: "topup" } });
      if (error) throw error;
      sonnerToast.success("Schedule refreshed", { description: "Next 7 days topped up." });
      queryClient.invalidateQueries({ queryKey: ["ritual-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-today"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-tomorrow"] });
      queryClient.invalidateQueries({ queryKey: ["ritual-cycle-stats"] });
    } catch (e: any) {
      sonnerToast.error("Refresh failed", { description: e?.message || String(e) });
    } finally {
      setRefreshingSchedule(false);
    }
  };

  const handleHealthCheck = () => {
    const issues: string[] = [];
    const passed: string[] = [];
    if (!todayAssignment) issues.push(`No ritual assigned for today (${todayStr}) — click Refresh Schedule.`);
    else passed.push(`Today: Ritual ${(todayAssignment as any)?.daily_smarty_rituals?.day_number} assigned`);
    if (!tomorrowAssignment) issues.push(`No ritual assigned for tomorrow (${tomorrowStr}).`);
    else passed.push(`Tomorrow: Ritual ${(tomorrowAssignment as any)?.daily_smarty_rituals?.day_number} assigned`);
    if ((cycleStats?.library ?? 0) === 0) issues.push("Ritual library is empty.");
    else passed.push(`Library has ${cycleStats?.library} rituals`);
    if (issues.length === 0) sonnerToast.success("Ritual Health Check passed", { description: passed.join(" • ") });
    else sonnerToast.error(`${issues.length} issue(s)`, { description: issues[0] });
  };

  // Handle external dialog control
  useEffect(() => {
    if (externalDialog) {
      setEditingRitual(null);
      setIsDialogOpen(true);
      setExternalDialog?.(false);
    }
  }, [externalDialog, setExternalDialog]);

  useEffect(() => {
    loadRituals();
  }, []);

  useEffect(() => {
    filterRituals();
  }, [rituals, searchTerm]);

  const filterRituals = () => {
    let filtered = rituals;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        // Match raw date (YYYY-MM-DD)
        if (r.ritual_date.toLowerCase().includes(term)) return true;
        
        // Match formatted date (e.g., "Dec 25, 2024" or "December 25, 2024")
        try {
          const dateObj = new Date(r.ritual_date);
          const formattedShort = format(dateObj, 'MMM dd, yyyy').toLowerCase();
          const formattedFull = format(dateObj, 'MMMM dd, yyyy').toLowerCase();
          const formattedMonthOnly = format(dateObj, 'MMMM').toLowerCase();
          const formattedMonthShort = format(dateObj, 'MMM').toLowerCase();
          if (formattedShort.includes(term) || formattedFull.includes(term) ||
              formattedMonthOnly.includes(term) || formattedMonthShort.includes(term)) return true;
        } catch (e) {
          // Skip date parsing errors
        }
        
        // Match day number
        if (r.day_number.toString().includes(term)) return true;
        
        // Match content (morning, midday, evening)
        const morningText = stripHtml(r.morning_content || '').toLowerCase();
        const middayText = stripHtml(r.midday_content || '').toLowerCase();
        const eveningText = stripHtml(r.evening_content || '').toLowerCase();
        if (morningText.includes(term) || middayText.includes(term) || eveningText.includes(term)) return true;
        
        return false;
      });
    }

    setFilteredRituals(filtered);
  };

  const loadRituals = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_smarty_rituals')
        .select('*')
        .order('ritual_date', { ascending: false });

      if (error) throw error;
      setRituals(data || []);
    } catch (error) {
      console.error('Error loading rituals:', error);
      toast({
        title: "Error",
        description: "Failed to load rituals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ritual?')) return;

    try {
      const { error } = await supabase
        .from('daily_smarty_rituals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ritual deleted successfully",
      });
      loadRituals();
    } catch (error) {
      console.error('Error deleting ritual:', error);
      toast({
        title: "Error",
        description: "Failed to delete ritual",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (ritual: Ritual) => {
    setEditingRitual(ritual);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingRitual(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    loadRituals();
  };

  const handleDuplicate = async (ritual: Ritual) => {
    try {
      // Calculate next available date
      const existingDates = rituals.map(r => r.ritual_date);
      let newDate = new Date();
      while (existingDates.includes(newDate.toISOString().split('T')[0])) {
        newDate.setDate(newDate.getDate() + 1);
      }

      const maxDayNumber = Math.max(...rituals.map(r => r.day_number), 0);

      const { error: insertError } = await supabase
        .from('daily_smarty_rituals')
        .insert({
          ritual_date: newDate.toISOString().split('T')[0],
          day_number: maxDayNumber + 1,
          morning_content: ritual.morning_content,
          midday_content: ritual.midday_content,
          evening_content: ritual.evening_content,
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Ritual duplicated successfully",
      });
      loadRituals();
    } catch (error) {
      console.error('Error duplicating ritual:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate ritual",
        variant: "destructive",
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedRituals.length === filteredRituals.length) {
      setSelectedRituals([]);
    } else {
      setSelectedRituals(filteredRituals.map(r => r.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedRituals(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedRituals.length === 0) return;
    
    if (!confirm(`Delete ${selectedRituals.length} selected rituals?`)) return;

    try {
      const { error } = await supabase
        .from('daily_smarty_rituals')
        .delete()
        .in('id', selectedRituals);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedRituals.length} rituals`,
      });
      setSelectedRituals([]);
      loadRituals();
    } catch (error) {
      console.error('Error deleting rituals:', error);
      toast({
        title: "Error",
        description: "Failed to delete rituals",
        variant: "destructive",
      });
    }
  };

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const truncate = (text: string, maxLength: number = 50) => {
    const stripped = stripHtml(text);
    return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-6">
      {/* Header status + actions (mirrors WOD Manager) */}
      <div className="space-y-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Smarty Ritual Management
            </h3>
            <p className="text-sm text-muted-foreground">
              Library rotation — each day picks one ritual from your library; cycle resets after all are used.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handleHealthCheck} className="border-green-500">
              <HeartPulse className="h-4 w-4 text-green-500 mr-1" />
              <span className="hidden sm:inline">Ritual Health Check</span>
              <span className="sm:hidden">Health</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshSchedule}
              disabled={refreshingSchedule}
              className="border-cyan-500"
            >
              {refreshingSchedule ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 text-cyan-500 mr-1" />}
              <span className="hidden sm:inline">Refresh Schedule</span>
              <span className="sm:hidden">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/daily-smarty-ritual" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Live
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Today's Ritual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todayAssignment ? (
                <>
                  <Badge variant="outline" className="text-sm font-semibold">
                    Ritual {(todayAssignment as any)?.daily_smarty_rituals?.day_number}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(), "EEE, MMM d")} • Cycle {(todayAssignment as any).cycle_number}
                  </p>
                </>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Not assigned</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Tomorrow's Ritual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tomorrowAssignment ? (
                <>
                  <Badge variant="outline" className="text-sm font-semibold">
                    Ritual {(tomorrowAssignment as any)?.daily_smarty_rituals?.day_number}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(addDays(new Date(), 1), "EEE, MMM d")} • Cycle {(tomorrowAssignment as any).cycle_number}
                  </p>
                </>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Not assigned</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Cycle Progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Cycle {cycleStats?.cycle ?? 1}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {cycleStats?.used ?? 0}/{cycleStats?.library ?? 0} used • {cycleStats?.remaining ?? 0} remaining
              </p>
            </CardContent>
          </Card>
        </div>

        <RitualSchedulePreview />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Rituals Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredRituals.length} ritual{filteredRituals.length !== 1 ? 's' : ''} 
                {selectedRituals.length > 0 && ` (${selectedRituals.length} selected)`}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedRituals.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs sm:text-sm">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Delete ({selectedRituals.length})
                </Button>
              )}
              <Button onClick={handleNew} size="sm" className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                New Ritual
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by date, month, day #, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRituals.length === filteredRituals.length && filteredRituals.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Ritual #</TableHead>
                  <TableHead className="hidden md:table-cell">Morning</TableHead>
                  <TableHead className="hidden md:table-cell">Midday</TableHead>
                  <TableHead className="hidden md:table-cell">Evening</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRituals.map((ritual) => (
                  <TableRow key={ritual.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRituals.includes(ritual.id)}
                        onCheckedChange={() => toggleSelect(ritual.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(ritual.ritual_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Ritual {ritual.day_number}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[150px]">
                      <span className="text-sm text-muted-foreground">{truncate(ritual.morning_content)}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[150px]">
                      <span className="text-sm text-muted-foreground">{truncate(ritual.midday_content)}</span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[150px]">
                      <span className="text-sm text-muted-foreground">{truncate(ritual.evening_content)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-0.5 sm:gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => setViewingRitual(ritual)}
                          title="View"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleDuplicate(ritual)}
                          title="Duplicate"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleEdit(ritual)}
                          title="Edit"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(ritual.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRituals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No rituals found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RitualEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        ritual={editingRitual}
        onSave={handleSave}
      />

      <RitualViewDialog
        open={!!viewingRitual}
        onOpenChange={(o) => !o && setViewingRitual(null)}
        ritual={viewingRitual}
      />
    </div>
  );
};
