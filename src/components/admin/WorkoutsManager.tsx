import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, Search, Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkoutEditDialog } from "./WorkoutEditDialog";

interface Workout {
  id: string;
  name: string;
  type: string;
  category: string;
  format: string;
  equipment: string;
  difficulty: string;
  duration: string;
  is_premium: boolean;
  tier_required: string | null;
}

export const WorkoutsManager = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    filterWorkouts();
  }, [workouts, searchTerm, categoryFilter, formatFilter, equipmentFilter, typeFilter, difficultyFilter, accessFilter]);

  const filterWorkouts = () => {
    let filtered = workouts;

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (typeFilter !== "all") {
      filtered = filtered.filter(w => w.type === typeFilter);
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(w => w.difficulty === difficultyFilter);
    }

    if (accessFilter === "free") {
      filtered = filtered.filter(w => !w.is_premium);
    } else if (accessFilter === "premium") {
      filtered = filtered.filter(w => w.is_premium);
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
    if (!confirm('Are you sure you want to delete this workout?')) return;

    try {
      const { error } = await supabase
        .from('admin_workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Workout deleted successfully",
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

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingWorkout(null);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    setIsDialogOpen(false);
    loadWorkouts();
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
      const { error } = await supabase
        .from('admin_workouts')
        .delete()
        .in('id', selectedWorkouts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Deleted ${selectedWorkouts.length} workouts`,
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
      ['ID', 'Name', 'Type', 'Difficulty', 'Duration', 'Access'].join(','),
      ...filteredWorkouts.map(w => [
        w.id,
        `"${w.name}"`,
        w.type,
        w.difficulty,
        w.duration,
        w.is_premium ? w.tier_required || 'Premium' : 'Free'
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workouts Management</CardTitle>
              <CardDescription>
                {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''} 
                {selectedWorkouts.length > 0 && ` (${selectedWorkouts.length} selected)`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {selectedWorkouts.length > 0 && (
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedWorkouts.length})
                </Button>
              )}
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
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
                  placeholder="Search workouts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="STRENGTH">STRENGTH</SelectItem>
                <SelectItem value="CARDIO">CARDIO</SelectItem>
                <SelectItem value="MOBILITY">MOBILITY</SelectItem>
                <SelectItem value="CONDITIONING">CONDITIONING</SelectItem>
                <SelectItem value="POWER">POWER</SelectItem>
                <SelectItem value="RECOVERY">RECOVERY</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="CIRCUIT">CIRCUIT</SelectItem>
                <SelectItem value="AMRAP">AMRAP</SelectItem>
                <SelectItem value="EMOM">EMOM</SelectItem>
                <SelectItem value="TABATA">TABATA</SelectItem>
                <SelectItem value="REPS & SETS">REPS & SETS</SelectItem>
                <SelectItem value="TIMED SETS">TIMED SETS</SelectItem>
                <SelectItem value="INTERVALS">INTERVALS</SelectItem>
                <SelectItem value="LADDER">LADDER</SelectItem>
                <SelectItem value="COMPLEX">COMPLEX</SelectItem>
              </SelectContent>
            </Select>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                <SelectItem value="BODYWEIGHT">BODYWEIGHT</SelectItem>
                <SelectItem value="DUMBBELLS">DUMBBELLS</SelectItem>
                <SelectItem value="BARBELL">BARBELL</SelectItem>
                <SelectItem value="KETTLEBELL">KETTLEBELL</SelectItem>
                <SelectItem value="RESISTANCE BANDS">RESISTANCE BANDS</SelectItem>
                <SelectItem value="MIXED">MIXED</SelectItem>
                <SelectItem value="MINIMAL">MINIMAL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HIIT">HIIT</SelectItem>
                <SelectItem value="STRENGTH">STRENGTH</SelectItem>
                <SelectItem value="CARDIO">CARDIO</SelectItem>
                <SelectItem value="MOBILITY">MOBILITY</SelectItem>
                <SelectItem value="CIRCUIT">CIRCUIT</SelectItem>
                <SelectItem value="AMRAP">AMRAP</SelectItem>
                <SelectItem value="EMOM">EMOM</SelectItem>
                <SelectItem value="TABATA">TABATA</SelectItem>
                <SelectItem value="METCON">METCON</SelectItem>
                <SelectItem value="ENDURANCE">ENDURANCE</SelectItem>
                <SelectItem value="POWER">POWER</SelectItem>
                <SelectItem value="RECOVERY">RECOVERY</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
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
                <TableHead>Category</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Type</TableHead>
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
                  <TableRow key={workout.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedWorkouts.includes(workout.id)}
                        onCheckedChange={() => toggleSelect(workout.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{workout.name}</TableCell>
                    <TableCell><Badge variant="outline">{workout.category}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{workout.format}</Badge></TableCell>
                    <TableCell>{workout.type}</TableCell>
                    <TableCell>{workout.difficulty}</TableCell>
                    <TableCell>{workout.duration}</TableCell>
                    <TableCell>
                      {workout.is_premium ? (
                        <Badge variant="secondary">{workout.tier_required || 'Premium'}</Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/workout/${workout.category.toLowerCase().replace(/\s+/g, '-')}/${workout.id}`, '_blank')}
                          title="View workout"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(workout)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(workout.id)}
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
    </>
  );
};
