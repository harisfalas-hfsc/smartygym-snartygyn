import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RitualEditDialog } from "./RitualEditDialog";
import { format } from "date-fns";

interface Ritual {
  id: string;
  ritual_date: string;
  day_number: number;
  morning_content: string;
  midday_content: string;
  evening_content: string;
  is_visible: boolean;
  created_at: string;
}

export const RitualsManager = () => {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [filteredRituals, setFilteredRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRituals, setSelectedRituals] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadRituals();
  }, []);

  useEffect(() => {
    filterRituals();
  }, [rituals, searchTerm]);

  const filterRituals = () => {
    let filtered = rituals;

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.ritual_date.includes(searchTerm) ||
        r.day_number.toString().includes(searchTerm)
      );
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
          is_visible: false,
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

  const handleToggleVisibility = async (ritualId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('daily_smarty_rituals')
        .update({ is_visible: !currentVisibility })
        .eq('id', ritualId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ritual is now ${!currentVisibility ? 'visible' : 'hidden'}`,
      });
      loadRituals();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
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
                  placeholder="Search by date or day number..."
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
                  <TableHead>Day #</TableHead>
                  <TableHead className="hidden md:table-cell">Morning</TableHead>
                  <TableHead className="hidden md:table-cell">Midday</TableHead>
                  <TableHead className="hidden md:table-cell">Evening</TableHead>
                  <TableHead>Visible</TableHead>
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
                      <Badge variant="secondary">Day {ritual.day_number}</Badge>
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
                    <TableCell>
                      {ritual.is_visible ? (
                        <Badge variant="default" className="bg-green-600">Visible</Badge>
                      ) : (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(ritual.id, ritual.is_visible)}
                          title={ritual.is_visible ? "Hide" : "Show"}
                        >
                          {ritual.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(ritual)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ritual)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(ritual.id)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRituals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
};
