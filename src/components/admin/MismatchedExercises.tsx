import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Link as LinkIcon, 
  Trash2, 
  Upload,
  RefreshCw,
  Search
} from "lucide-react";

interface MismatchedExercise {
  id: string;
  exercise_name: string;
  source_type: string;
  source_id: string | null;
  source_name: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_exercise_id: string | null;
}

interface ExerciseFormData {
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  secondary_muscles: string;
  instructions: string;
  difficulty: string;
  category: string;
  description: string;
}

const BODY_PARTS = ["back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"];
const EQUIPMENT_OPTIONS = ["body weight", "barbell", "dumbbell", "cable", "machine", "kettlebell", "band", "medicine ball", "stability ball", "foam roller", "other"];
const DIFFICULTY_OPTIONS = ["beginner", "intermediate", "advanced"];

export const MismatchedExercises = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedMismatch, setSelectedMismatch] = useState<MismatchedExercise | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  
  const [formData, setFormData] = useState<ExerciseFormData>({
    name: "",
    body_part: "",
    equipment: "",
    target: "",
    secondary_muscles: "",
    instructions: "",
    difficulty: "",
    category: "",
    description: "",
  });

  // Fetch mismatched exercises
  const { data: mismatchedExercises, isLoading, refetch } = useQuery({
    queryKey: ["mismatched-exercises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mismatched_exercises")
        .select("*")
        .is("resolved_at", null)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as MismatchedExercise[];
    },
  });

  // Fetch existing exercises for linking
  const { data: existingExercises } = useQuery({
    queryKey: ["exercises-for-linking", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("exercises")
        .select("id, name, body_part, equipment, target")
        .order("name")
        .limit(50);
      
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Create new exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: async (data: { formData: ExerciseFormData; mismatchId: string }) => {
      const exerciseId = `custom-${Date.now()}`;
      
      const { error: insertError } = await supabase
        .from("exercises")
        .insert({
          id: exerciseId,
          name: data.formData.name,
          body_part: data.formData.body_part,
          equipment: data.formData.equipment,
          target: data.formData.target,
          secondary_muscles: data.formData.secondary_muscles.split(",").map(s => s.trim()).filter(Boolean),
          instructions: data.formData.instructions.split("\n").filter(Boolean),
          difficulty: data.formData.difficulty,
          category: data.formData.category,
          description: data.formData.description,
        });
      
      if (insertError) throw insertError;

      // Mark mismatch as resolved
      const { error: updateError } = await supabase
        .from("mismatched_exercises")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_exercise_id: exerciseId,
        })
        .eq("id", data.mismatchId);
      
      if (updateError) throw updateError;
      
      return exerciseId;
    },
    onSuccess: () => {
      toast.success("Exercise created and mismatch resolved");
      queryClient.invalidateQueries({ queryKey: ["mismatched-exercises"] });
      queryClient.invalidateQueries({ queryKey: ["exercise-library-all"] });
      setCreateDialogOpen(false);
      setSelectedMismatch(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create exercise: ${error.message}`);
    },
  });

  // Link to existing exercise mutation
  const linkExerciseMutation = useMutation({
    mutationFn: async (data: { mismatchId: string; exerciseId: string }) => {
      const { error } = await supabase
        .from("mismatched_exercises")
        .update({
          resolved_at: new Date().toISOString(),
          resolved_exercise_id: data.exerciseId,
        })
        .eq("id", data.mismatchId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mismatch linked to existing exercise");
      queryClient.invalidateQueries({ queryKey: ["mismatched-exercises"] });
      setLinkDialogOpen(false);
      setSelectedMismatch(null);
      setSelectedExerciseId("");
    },
    onError: (error) => {
      toast.error(`Failed to link exercise: ${error.message}`);
    },
  });

  // Delete mismatch (mark as not an exercise)
  const deleteMismatchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("mismatched_exercises")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mismatch dismissed");
      queryClient.invalidateQueries({ queryKey: ["mismatched-exercises"] });
    },
    onError: (error) => {
      toast.error(`Failed to dismiss: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      body_part: "",
      equipment: "",
      target: "",
      secondary_muscles: "",
      instructions: "",
      difficulty: "",
      category: "",
      description: "",
    });
  };

  const handleOpenCreateDialog = (mismatch: MismatchedExercise) => {
    setSelectedMismatch(mismatch);
    setFormData({
      ...formData,
      name: mismatch.exercise_name,
    });
    setCreateDialogOpen(true);
  };

  const handleOpenLinkDialog = (mismatch: MismatchedExercise) => {
    setSelectedMismatch(mismatch);
    setSearchTerm(mismatch.exercise_name);
    setLinkDialogOpen(true);
  };

  const filteredMismatches = mismatchedExercises?.filter(m => 
    m.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.source_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Mismatched Exercises</CardTitle>
            <Badge variant="secondary" className="ml-2">
              {mismatchedExercises?.length || 0} unresolved
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Exercises from AI-generated content that couldn't be matched to the library. 
          Create new exercises or link to existing ones.
        </p>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by exercise name or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Table */}
        {filteredMismatches && filteredMismatches.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercise Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMismatches.map((mismatch) => (
                  <TableRow key={mismatch.id}>
                    <TableCell className="font-medium">
                      {mismatch.exercise_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {mismatch.source_type}
                        </Badge>
                        {mismatch.source_name && (
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {mismatch.source_name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(mismatch.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenCreateDialog(mismatch)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Create
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLinkDialog(mismatch)}
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Link
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMismatchMutation.mutate(mismatch.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium">All Caught Up!</h3>
            <p className="text-sm text-muted-foreground">
              No unresolved mismatched exercises at the moment.
            </p>
          </div>
        )}

        {/* Create Exercise Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Exercise</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Exercise Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_part">Body Part</Label>
                  <Select
                    value={formData.body_part}
                    onValueChange={(v) => setFormData({ ...formData, body_part: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body part" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_PARTS.map((bp) => (
                        <SelectItem key={bp} value={bp}>{bp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Select
                    value={formData.equipment}
                    onValueChange={(v) => setFormData({ ...formData, equipment: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {EQUIPMENT_OPTIONS.map((eq) => (
                        <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Muscle</Label>
                  <Input
                    id="target"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    placeholder="e.g., quads, biceps"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., strength, cardio"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_muscles">Secondary Muscles (comma-separated)</Label>
                <Input
                  id="secondary_muscles"
                  value={formData.secondary_muscles}
                  onChange={(e) => setFormData({ ...formData, secondary_muscles: e.target.value })}
                  placeholder="e.g., glutes, hamstrings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the exercise"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (one per line)</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Step 1: Stand with feet shoulder-width apart&#10;Step 2: Lower into squat position"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => {
                  if (!selectedMismatch) return;
                  if (!formData.name || !formData.body_part || !formData.equipment || !formData.target) {
                    toast.error("Please fill in all required fields");
                    return;
                  }
                  createExerciseMutation.mutate({
                    formData,
                    mismatchId: selectedMismatch.id,
                  });
                }}
                disabled={createExerciseMutation.isPending}
              >
                {createExerciseMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exercise
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Link to Existing Exercise Dialog */}
        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Link to Existing Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Link "<strong>{selectedMismatch?.exercise_name}</strong>" to an existing exercise in the library.
              </p>
              
              <div className="space-y-2">
                <Label>Search Exercises</Label>
                <Input
                  placeholder="Type to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {existingExercises?.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`p-3 cursor-pointer border-b last:border-b-0 hover:bg-muted/50 ${
                      selectedExerciseId === exercise.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => setSelectedExerciseId(exercise.id)}
                  >
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {exercise.body_part} • {exercise.equipment} • {exercise.target}
                    </div>
                  </div>
                ))}
                {existingExercises?.length === 0 && (
                  <div className="p-4 text-center text-muted-foreground">
                    No exercises found
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (!selectedMismatch || !selectedExerciseId) {
                    toast.error("Please select an exercise to link");
                    return;
                  }
                  linkExerciseMutation.mutate({
                    mismatchId: selectedMismatch.id,
                    exerciseId: selectedExerciseId,
                  });
                }}
                disabled={!selectedExerciseId || linkExerciseMutation.isPending}
              >
                {linkExerciseMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Linking...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Exercise
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MismatchedExercises;
