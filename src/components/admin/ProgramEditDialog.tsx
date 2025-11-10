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

interface ProgramEditDialogProps {
  program: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const ProgramEditDialog = ({ program, open, onOpenChange, onSave }: ProgramEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    duration: '',
    description: '',
    overview: '',
    target_audience: '',
    program_structure: '',
    weekly_schedule: '',
    progression_plan: '',
    nutrition_tips: '',
    expected_results: '',
    image_url: '',
    is_premium: false,
    tier_required: '',
  });

  useEffect(() => {
    if (program) {
      setFormData(program);
    } else {
      setFormData({
        id: '',
        name: '',
        category: '',
        duration: '',
        description: '',
        overview: '',
        target_audience: '',
        program_structure: '',
        weekly_schedule: '',
        progression_plan: '',
        nutrition_tips: '',
        expected_results: '',
        image_url: '',
        is_premium: false,
        tier_required: '',
      });
    }
  }, [program]);

  const handleSave = async () => {
    try {
      if (program) {
        // Update existing
        const { error } = await supabase
          .from('admin_training_programs')
          .update(formData)
          .eq('id', program.id);

        if (error) throw error;
        toast({ title: "Success", description: "Program updated successfully" });
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_training_programs')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Program created successfully" });
      }
      onSave();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: "Error",
        description: "Failed to save program",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program ? 'Edit Program' : 'Create New Program'}</DialogTitle>
          <DialogDescription>
            {program ? 'Update program details' : 'Add a new training program to your library'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Program ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="e.g., T-F001"
                disabled={!!program}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Program name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Functional Strength"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12 weeks"
              />
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
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              placeholder="Program overview"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience</Label>
            <Textarea
              id="target_audience"
              value={formData.target_audience}
              onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
              placeholder="Who is this program for?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program_structure">Program Structure</Label>
            <Textarea
              id="program_structure"
              value={formData.program_structure}
              onChange={(e) => setFormData({ ...formData, program_structure: e.target.value })}
              placeholder="How is the program structured?"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly_schedule">Weekly Schedule</Label>
            <Textarea
              id="weekly_schedule"
              value={formData.weekly_schedule}
              onChange={(e) => setFormData({ ...formData, weekly_schedule: e.target.value })}
              placeholder="Weekly training schedule"
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="progression_plan">Progression Plan</Label>
            <Textarea
              id="progression_plan"
              value={formData.progression_plan}
              onChange={(e) => setFormData({ ...formData, progression_plan: e.target.value })}
              placeholder="How to progress through the program"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nutrition_tips">Nutrition Tips</Label>
            <Textarea
              id="nutrition_tips"
              value={formData.nutrition_tips}
              onChange={(e) => setFormData({ ...formData, nutrition_tips: e.target.value })}
              placeholder="Nutrition recommendations"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_results">Expected Results</Label>
            <Textarea
              id="expected_results"
              value={formData.expected_results}
              onChange={(e) => setFormData({ ...formData, expected_results: e.target.value })}
              placeholder="What results can users expect?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="/src/assets/program-image.jpg"
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
              Save Program
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
