import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Download, Filter, Bot, User, Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkoutEditDialog } from "./WorkoutEditDialog";

interface Workout {
  id: string;
  name: string;
  category: string;
  format: string;
  equipment: string;
  difficulty: string;
  duration: string;
  is_premium: boolean;
  tier_required: string | null;
  is_standalone_purchase: boolean;
  price: number | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  is_ai_generated: boolean;
  is_visible: boolean;
  created_at: string | null;
}

interface WorkoutsManagerProps {
  externalDialog?: boolean;
  setExternalDialog?: (value: boolean) => void;
}

export const WorkoutsManager = ({ externalDialog, setExternalDialog }: WorkoutsManagerProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [durationFilter, setDurationFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const { toast } = useToast();

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, searchTerm, categoryFilter, formatFilter, equipmentFilter, difficultyFilter, durationFilter, accessFilter, sourceFilter, sortOrder]);

  // Watch for external dialog trigger
  useEffect(() => {
    if (externalDialog) {
      handleNew();
      setExternalDialog?.(false);
    }
  }, [externalDialog]);

  const filterWorkouts = () => {
    let filtered = workouts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(term) ||
        w.id.toLowerCase().includes(term) ||
        (w.category?.toLowerCase() || '').includes(term) ||
        (w.format?.toLowerCase() || '').includes(term) ||
        (w.equipment?.toLowerCase() || '').includes(term) ||
        (w.difficulty?.toLowerCase() || '').includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(w => w.category === categoryFilter);
    }

    if (formatFilter !== "all") {
      filtered = filtered.filter(w => w.format === formatFilter);
    }

    if (equipmentFilter !== "all") {
      filtered = filtered.filter(w => w.equipment === equipmentFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(w => w.difficulty === difficultyFilter);
    }

    if (durationFilter !== "all") {
      if (durationFilter === "various") {
        // Show workouts that DON'T match any standard duration
        const standardDurations = ["15", "20", "30", "45", "60"];
        filtered = filtered.filter(w => {
          const durationNumber = w.duration?.match(/\d+/)?.[0];
          const workoutDuration = w.duration?.toLowerCase();
          const isStandardDuration = durationNumber && standardDurations.includes(durationNumber);
          const hasVariousText = workoutDuration?.includes("various") || workoutDuration?.includes("varies");
          return !isStandardDuration || hasVariousText;
        });
      } else {
        // For specific durations, match the number
        filtered = filtered.filter(w => {
          const durationNumber = w.duration?.match(/\d+/)?.[0];
          return durationNumber === durationFilter;
        });
      }
    }

    if (accessFilter === "free") {
      filtered = filtered.filter(w => !w.is_premium);
    } else if (accessFilter === "premium") {
      filtered = filtered.filter(w => w.is_premium);
    }

    if (sourceFilter === "ai") {
      filtered = filtered.filter(w => w.is_ai_generated && !w.id.startsWith("WOD-"));
    } else if (sourceFilter === "wod") {
      filtered = filtered.filter(w => w.id.startsWith("WOD-"));
    } else if (sourceFilter === "manual") {
      filtered = filtered.filter(w => !w.is_ai_generated);
    }

    // Apply sorting
    if (sortOrder === "newest") {
      filtered = [...filtered].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
    } else if (sortOrder === "oldest") {
      filtered = [...filtered].sort((a, b) => 
        new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
    } else if (sortOrder === "alphabetical") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredWorkouts(filtered);
  };

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_workouts')
        .select('*')
        .order('name');

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast({
        title: "Error",
        description: "Failed to load workouts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Get workout details to check if it's a WOD with standalone purchase
      const { data: workout, error: fetchError } = await supabase
        .from('admin_workouts')
        .select('stripe_product_id, is_workout_of_day, is_standalone_purchase, name')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // If it's a WOD with Stripe product, move to gallery instead of deleting
      if (workout?.is_workout_of_day && workout?.is_standalone_purchase && workout?.stripe_product_id) {
        if (!confirm(`"${workout.name}" is a purchasable WOD. Instead of deleting, it will be moved to the gallery (WOD status removed). Continue?`)) return;

        // Move to gallery - keep Stripe product, just remove WOD status
        const { error: updateError } = await supabase
          .from('admin_workouts')
          .update({ 
            is_workout_of_day: false, 
            generated_for_date: null 
          })
          .eq('id', id);

        if (updateError) throw updateError;

        toast({
          title: "Moved to Gallery",
          description: `"${workout.name}" is now a regular workout (purchasable). Stripe product preserved.`,
        });
        loadWorkouts();
        return;
      }

      // Regular delete for non-WOD or non-purchasable workouts
      if (!confirm('Are you sure you want to permanently delete this workout?')) return;

      // Delete from Stripe first if product exists
      if (workout?.stripe_product_id) {
        const { error: stripeError } = await supabase.functions.invoke('delete-stripe-product', {
          body: { productId: workout.stripe_product_id }
        });

        if (stripeError) {
          console.error('Error deleting from Stripe:', stripeError);
          toast({
            title: "Warning",
            description: "Failed to delete from Stripe, but continuing with database deletion",
            variant: "default",
          });
        }
      }

      // Soft-delete related purchases (preserve for accounting, but mark content as deleted)
      const { error: purchasesError } = await supabase
        .from('user_purchases')
        .update({ content_deleted: true })
        .eq('content_id', id)
        .eq('content_type', 'workout');

      if (purchasesError) {
        console.error('Error marking purchases as content_deleted:', purchasesError);
      }

      // Delete from database
      const { error } = await supabase
        .from('admin_workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout deleted successfully from database and Stripe",
      });
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast({
        title: "Error",
        description: "Failed to delete workout",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (workout: Workout) => {
    setEditLoading(true);
    try {
      const { data: fullWorkout, error } = await supabase
        .from('admin_workouts')
        .select('*')
        .eq('id', workout.id)
        .single();

      if (error) throw error;
      
      setEditingWorkout(fullWorkout);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Error fetching workout details:', error);
      toast({
        title: "Error",
        description: "Failed to load workout details",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleNew = () => {
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    loadWorkouts();
  };

  const handleDuplicate = async (workout: Workout) => {
    try {
      // Get full workout data
      const { data: fullWorkout, error: fetchError } = await supabase
        .from('admin_workouts')
        .select('*')
        .eq('id', workout.id)
        .single();

      if (fetchError) throw fetchError;

      // Create new ID and name
      const newId = `${workout.id}-copy-${Date.now()}`;
      const newName = `${workout.name} (Copy)`;

      // Create duplicate without Stripe IDs (will be created fresh if needed)
      const { error: insertError } = await supabase
        .from('admin_workouts')
        .insert({
          ...fullWorkout,
          id: newId,
          name: newName,
          stripe_product_id: null,
          stripe_price_id: null,
          is_visible: false, // Start as hidden
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      toast({
        title: "Success",
        description: "Workout duplicated. Opening edit dialog...",
      });

      // Reload and open edit dialog for the new workout
      await loadWorkouts();
      
      // Set the duplicated workout for editing
      const { data: newWorkout } = await supabase
        .from('admin_workouts')
        .select('*')
        .eq('id', newId)
        .single();

      if (newWorkout) {
        setEditingWorkout(newWorkout as Workout);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error duplicating workout:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate workout",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (workoutId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_workouts')
        .update({ is_visible: !currentVisibility })
        .eq('id', workoutId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Workout is now ${!currentVisibility ? 'visible' : 'hidden'}`,
      });
      loadWorkouts();
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
    if (selectedWorkouts.length === filteredWorkouts.length) {
      setSelectedWorkouts([]);
    } else {
      setSelectedWorkouts(filteredWorkouts.map(w => w.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedWorkouts(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedWorkouts.length === 0) return;
    
    if (!confirm(`Delete ${selectedWorkouts.length} selected workouts?`)) return;

    try {
      // Get all workouts to check for WODs with Stripe products
      const { data: workoutsToDelete, error: fetchError } = await supabase
        .from('admin_workouts')
        .select('id, stripe_product_id, is_workout_of_day, is_standalone_purchase, name')
        .in('id', selectedWorkouts);

      if (fetchError) throw fetchError;

      // Separate WODs that should be moved to gallery vs regular deletes
      const wodsToMove = (workoutsToDelete || []).filter(w => 
        w.is_workout_of_day && w.is_standalone_purchase && w.stripe_product_id
      );
      const regularDeletes = (workoutsToDelete || []).filter(w => 
        !w.is_workout_of_day || !w.is_standalone_purchase || !w.stripe_product_id
      );

      // Move WODs to gallery (preserve Stripe products)
      if (wodsToMove.length > 0) {
        const wodIds = wodsToMove.map(w => w.id);
        await supabase
          .from('admin_workouts')
          .update({ is_workout_of_day: false, generated_for_date: null })
          .in('id', wodIds);
      }

      // Delete Stripe products for regular deletes only
      for (const workout of regularDeletes) {
        if (workout.stripe_product_id) {
          await supabase.functions.invoke('delete-stripe-product', {
            body: { productId: workout.stripe_product_id }
          });
        }
      }

      // Soft-delete related purchases for regular deletes
      for (const workout of regularDeletes) {
        await supabase
          .from('user_purchases')
          .update({ content_deleted: true })
          .eq('content_id', workout.id)
          .eq('content_type', 'workout');
      }

      // Delete from database only regular deletes
      if (regularDeletes.length > 0) {
        const regularIds = regularDeletes.map(w => w.id);
        const { error } = await supabase
          .from('admin_workouts')
          .delete()
          .in('id', regularIds);

        if (error) throw error;
      }

      const movedCount = wodsToMove.length;
      const deletedCount = regularDeletes.length;
      
      toast({
        title: "Success",
        description: movedCount > 0 && deletedCount > 0 
          ? `Moved ${movedCount} WOD(s) to gallery, deleted ${deletedCount} workout(s)`
          : movedCount > 0 
            ? `Moved ${movedCount} WOD(s) to gallery (Stripe products preserved)`
            : `Deleted ${deletedCount} workout(s) from database and Stripe`,
      });
      setSelectedWorkouts([]);
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workouts:', error);
      toast({
        title: "Error",
        description: "Failed to delete workouts",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Format', 'Difficulty', 'Duration', 'Access', 'Source', 'Visible'].join(','),
      ...filteredWorkouts.map(w => [
        w.id,
        `"${w.name}"`,
        w.format,
        w.difficulty,
        w.duration,
        w.is_premium ? w.tier_required || 'Premium' : 'Free',
        w.is_ai_generated ? 'AI' : 'Manual',
        w.is_visible ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workouts.csv';
    a.click();
  };

  if (loading) {
    return <div className="text-center py-8">Loading workouts...</div>;
  }

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">Workouts Management</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''} 
                {selectedWorkouts.length > 0 && ` (${selectedWorkouts.length} selected)`}
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={handleExport} className="text-xs sm:text-sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Export
              </Button>
              {selectedWorkouts.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs sm:text-sm">
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Delete ({selectedWorkouts.length})
                </Button>
              )}
              <Button onClick={handleNew} size="sm" className="text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                New
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
                  placeholder="Search by name, category, format, equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai">🤖 AI</SelectItem>
                <SelectItem value="wod">📅 WOD</SelectItem>
                <SelectItem value="manual">👤 Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="STRENGTH">STRENGTH</SelectItem>
                <SelectItem value="CALORIE BURNING">CALORIE BURNING</SelectItem>
                <SelectItem value="METABOLIC">METABOLIC</SelectItem>
                <SelectItem value="CARDIO">CARDIO</SelectItem>
                <SelectItem value="MOBILITY & STABILITY">MOBILITY & STABILITY</SelectItem>
                <SelectItem value="CHALLENGE">CHALLENGE</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="CIRCUIT">CIRCUIT</SelectItem>
                <SelectItem value="AMRAP">AMRAP</SelectItem>
                <SelectItem value="EMOM">EMOM</SelectItem>
                <SelectItem value="TABATA">TABATA</SelectItem>
                <SelectItem value="REPS & SETS">REPS & SETS</SelectItem>
                <SelectItem value="FOR TIME">FOR TIME</SelectItem>
                <SelectItem value="MIX">MIX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="BODYWEIGHT">BODYWEIGHT</SelectItem>
                <SelectItem value="EQUIPMENT">EQUIPMENT</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={durationFilter} onValueChange={setDurationFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="15">15 Minutes</SelectItem>
                <SelectItem value="20">20 Minutes</SelectItem>
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="45">45 Minutes</SelectItem>
                <SelectItem value="60">60 Minutes</SelectItem>
                <SelectItem value="various">Various</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">🕐 Newest</SelectItem>
                <SelectItem value="oldest">⏰ Oldest</SelectItem>
                <SelectItem value="alphabetical">📝 A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedWorkouts.length === filteredWorkouts.length && filteredWorkouts.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {workouts.length === 0 ? 'No workouts yet. Create your first workout!' : 'No workouts match your filters.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkouts.map((workout) => (
                  <TableRow key={workout.id} className={!workout.is_visible ? 'opacity-50' : ''}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWorkouts.includes(workout.id)}
                        onCheckedChange={() => toggleSelect(workout.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          {workout.name}
                          {!workout.is_visible && (
                            <Badge variant="destructive" className="text-xs">Hidden</Badge>
                          )}
                        </div>
                        {workout.created_at && (
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(workout.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {workout.is_ai_generated ? (
                        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700">
                          <Bot className="h-3 w-3 mr-1" />
                          AI
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                          <User className="h-3 w-3 mr-1" />
                          Manual
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell><Badge variant="outline">{workout.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{workout.format}</Badge></TableCell>
                    <TableCell>{workout.difficulty}</TableCell>
                    <TableCell>{workout.duration}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {workout.is_premium ? (
                          <Badge variant="secondary">Premium</Badge>
                        ) : (
                          <Badge variant="outline">Free</Badge>
                        )}
                        {workout.is_standalone_purchase && workout.price && (
                          <Badge variant="default" className="bg-accent text-accent-foreground">
                            €{parseFloat(workout.price.toString()).toFixed(2)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/workout/${workout.category.toLowerCase().replace(/\s+/g, '-')}/${workout.id}`, '_blank')}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicate(workout)}
                          title="Duplicate"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleVisibility(workout.id, workout.is_visible)}
                          title={workout.is_visible ? 'Hide' : 'Show'}
                        >
                          {workout.is_visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(workout)}
                          title="Edit"
                          disabled={editLoading}
                        >
                          {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(workout.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <WorkoutEditDialog
        workout={editingWorkout}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
};
