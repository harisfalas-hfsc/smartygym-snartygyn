import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkoutEditDialog } from "./WorkoutEditDialog";

interface Workout {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  duration: string;
  is_premium: boolean;
  tier_required: string | null;
}

export const WorkoutsManager = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_workouts')
        .select('id, name, type, difficulty, duration, is_premium, tier_required')
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
              <CardDescription>Manage all workout content and details</CardDescription>
            </div>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              New Workout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No workouts yet. Create your first workout!
                  </TableCell>
                </TableRow>
              ) : (
                workouts.map((workout) => (
                  <TableRow key={workout.id}>
                    <TableCell className="font-medium">{workout.name}</TableCell>
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
                          onClick={() => window.open(`/workout/${workout.id}`, '_blank')}
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
