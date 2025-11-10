import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const WORKOUT_TYPES = [
  "HIIT", "Strength", "Cardio", "Mobility", "Core", "Full Body",
  "Upper Body", "Lower Body", "Endurance", "Circuit", "Functional"
];

const EQUIPMENT_OPTIONS = [
  "None (Bodyweight)", "Dumbbells", "Barbells", "Resistance Bands",
  "Kettlebells", "Pull-up Bar", "Bench", "Medicine Ball", "Jump Rope", "Mixed"
];

const FOCUS_OPTIONS = [
  "Full Body", "Upper Body", "Lower Body", "Core", "Cardio",
  "Strength", "Endurance", "Power", "Hypertrophy", "Fat Loss", "Mobility"
];

interface WorkoutEditDialogProps {
  workout: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const WorkoutEditDialog = ({ workout, open, onOpenChange, onSave }: WorkoutEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    description: '',
    duration: '',
    equipment: '',
    difficulty: '',
    focus: '',
    warm_up: '',
    main_workout: '',
    cool_down: '',
    notes: '',
    image_url: '',
    is_premium: false,
    tier_required: '',
  });

  useEffect(() => {
    const generateWorkoutId = async () => {
      const { data } = await supabase
        .from('admin_workouts')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        const lastId = data[0].id;
        const match = lastId.match(/W-(\d+)/);
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          return `W-${nextNum.toString().padStart(3, '0')}`;
        }
      }
      return 'W-001';
    };

    if (workout) {
      setFormData(workout);
    } else {
      generateWorkoutId().then(newId => {
        setFormData({
          id: newId,
          name: '',
          type: '',
          description: '',
          duration: '',
          equipment: '',
          difficulty: '',
          focus: '',
          warm_up: '',
          main_workout: '',
          cool_down: '',
          notes: '',
          image_url: '',
          is_premium: false,
          tier_required: '',
        });
      });
    }
  }, [workout]);

  const handleSave = async () => {
    try {
      if (workout) {
        // Update existing
        const { error } = await supabase
          .from('admin_workouts')
          .update(formData)
          .eq('id', workout.id);

        if (error) throw error;
        toast({ title: "Success", description: "Workout updated successfully" });
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_workouts')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Workout created successfully" });
      }
      onSave();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: "Failed to save workout",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{workout ? 'Edit Workout' : 'Create New Workout'}</DialogTitle>
          <DialogDescription>
            {workout ? 'Update workout details' : 'Add a new workout to your library'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Workout ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g., W-001"
                disabled={!!workout}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Workout name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {WORKOUT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 30 mins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_OPTIONS.map(eq => (
                    <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="focus">Focus</Label>
              <Select value={formData.focus} onValueChange={(value) => setFormData({ ...formData, focus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select focus" />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_OPTIONS.map(focus => (
                    <SelectItem key={focus} value={focus}>{focus}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warm_up">Warm Up</Label>
            <Textarea
              id="warm_up"
              value={formData.warm_up}
              onChange={(e) => setFormData({ ...formData, warm_up: e.target.value })}
              placeholder="Warm up exercises"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="main_workout">Main Workout</Label>
            <Textarea
              id="main_workout"
              value={formData.main_workout}
              onChange={(e) => setFormData({ ...formData, main_workout: e.target.value })}
              placeholder="Main workout content"
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cool_down">Cool Down</Label>
            <Textarea
              id="cool_down"
              value={formData.cool_down}
              onChange={(e) => setFormData({ ...formData, cool_down: e.target.value })}
              placeholder="Cool down exercises"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="/src/assets/workout-image.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_premium"
              checked={formData.is_premium}
              onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
            />
            <Label htmlFor="is_premium">Premium Content</Label>
          </div>

          {formData.is_premium && (
            <div className="space-y-2">
              <Label htmlFor="tier_required">Tier Required</Label>
              <Select value={formData.tier_required} onValueChange={(value) => setFormData({ ...formData, tier_required: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Workout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
