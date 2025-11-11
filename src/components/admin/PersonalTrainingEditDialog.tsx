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
import { ProgramPreviewDialog } from "./ProgramPreviewDialog";
import { Eye } from "lucide-react";

const PROGRAM_CATEGORIES = [
  "CARDIO",
  "FUNCTIONAL STRENGTH",
  "MUSCLE HYPERTROPHY",
  "WEIGHT LOSS",
  "LOW BACK PAIN",
  "MOBILITY/STABILITY"
];

const EQUIPMENT_OPTIONS = ["Bodyweight", "Equipment"];

interface PersonalTrainingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  program: any;
  onSave: () => void;
}

export const PersonalTrainingEditDialog = ({ 
  open, 
  onOpenChange, 
  request, 
  program, 
  onSave 
}: PersonalTrainingEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    difficulty_stars: 1,
    weeks: 4,
    days_per_week: 4,
    equipment: '',
    training_program: '',
    program_description: '',
    construction: '',
    tips: '',
    image_url: '',
    generate_unique_image: false,
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
        category: program.category || '',
        difficulty_stars: program.difficulty_stars || 1,
        weeks: program.weeks || 4,
        days_per_week: program.days_per_week || 4,
        equipment: program.equipment || '',
        training_program: program.training_program || '',
        program_description: program.overview || '',
        construction: program.construction || '',
        tips: program.tips || '',
        image_url: program.image_url || '',
        generate_unique_image: false,
      });
    } else if (request) {
      // Pre-fill from request data
      setFormData({
        name: `Personal Training - ${request.user_name}`,
        category: '',
        difficulty_stars: request.fitness_level === 'beginner' ? 2 : request.fitness_level === 'intermediate' ? 4 : 6,
        weeks: parseInt(request.duration?.match(/\d+/)?.[0] || '4'),
        days_per_week: parseInt(request.training_days?.match(/\d+/)?.[0] || '4'),
        equipment: request.equipment?.includes('Only body weight') ? 'Bodyweight' : 'Equipment',
        training_program: '',
        program_description: `Custom program for ${request.user_name} - ${request.specific_goal}`,
        construction: '',
        tips: '',
        image_url: '',
        generate_unique_image: false,
      });
    }
  }, [program, request]);

  const handleSave = async () => {
    try {
      setIsGeneratingImage(true);
      
      let imageUrl = formData.image_url;
      
      if (formData.generate_unique_image) {
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-program-image', {
          body: {
            name: formData.name,
            category: formData.category,
            difficulty_stars: formData.difficulty_stars,
            weeks: formData.weeks,
          }
        });

        if (imageError) {
          console.error('Error generating image:', imageError);
        } else if (imageData?.image_url) {
          imageUrl = imageData.image_url;
        }
      }

      const serial_number = `PT-${Date.now()}`;
      
      const dataToSave = {
        request_id: program?.request_id || request.id,
        user_id: program?.user_id || request.user_id,
        name: formData.name,
        category: formData.category,
        difficulty_stars: formData.difficulty_stars,
        duration: `${formData.weeks} Weeks / ${formData.days_per_week} Days per Week`,
        weeks: formData.weeks,
        days_per_week: formData.days_per_week,
        equipment: formData.equipment,
        serial_number,
        image_url: imageUrl,
        overview: formData.program_description,
        target_audience: request?.fitness_level || '',
        training_program: formData.training_program,
        construction: formData.construction,
        progression_plan: '',
        tips: formData.tips,
        expected_results: request?.specific_goal || '',
      };

      if (program) {
        const { error } = await supabase
          .from('personal_training_programs')
          .update(dataToSave)
          .eq('id', program.id);

        if (error) throw error;
        toast({ title: "Success", description: "Personal training program updated successfully" });
      } else {
        const { error: insertError } = await supabase
          .from('personal_training_programs')
          .insert([dataToSave]);

        if (insertError) throw insertError;

        // Update request status
        await supabase
          .from('personal_training_requests')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', request.id);

        // Add to user purchases
        await supabase
          .from('user_purchases')
          .insert([{
            user_id: request.user_id,
            content_type: 'personal_training',
            content_id: serial_number,
            content_name: formData.name,
            price: 119.00, // Personal training price
          }]);

        // Send notification email to user
        try {
          await supabase.functions.invoke('send-program-notification', {
            body: {
              userId: request.user_id,
              userEmail: request.user_email,
              userName: request.user_name,
              programName: formData.name,
              notificationType: 'program_delivered',
            }
          });
        } catch (emailError) {
          console.error('Error sending notification email:', emailError);
          // Don't fail the operation if email fails
        }

        toast({ title: "Success", description: "Personal training program created and sent to user" });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving program:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save program",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{program ? 'Edit Personal Training Program' : 'Create Personal Training Program'}</DialogTitle>
          <DialogDescription>
            {request && `For: ${request.user_name} (${request.user_email})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Program Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Program name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAM_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty_stars: star })}
                  className="text-2xl focus:outline-none"
                >
                  {star <= formData.difficulty_stars ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weeks">Weeks</Label>
              <Input
                id="weeks"
                type="number"
                value={formData.weeks}
                onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) || 4 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days_per_week">Days per Week</Label>
              <Input
                id="days_per_week"
                type="number"
                value={formData.days_per_week}
                onChange={(e) => setFormData({ ...formData, days_per_week: parseInt(e.target.value) || 4 })}
              />
            </div>
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
            <Label htmlFor="training_program">Training Program Content</Label>
            <Textarea
              id="training_program"
              value={formData.training_program}
              onChange={(e) => setFormData({ ...formData, training_program: e.target.value })}
              placeholder="Enter the complete training program content..."
              rows={15}
              className="font-mono text-sm whitespace-pre-wrap"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program_description">Description</Label>
            <Textarea
              id="program_description"
              value={formData.program_description}
              onChange={(e) => setFormData({ ...formData, program_description: e.target.value })}
              placeholder="Program description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="construction">Instructions</Label>
            <Textarea
              id="construction"
              value={formData.construction}
              onChange={(e) => setFormData({ ...formData, construction: e.target.value })}
              placeholder="Program instructions"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tips">Tips</Label>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Tips and guidance"
              rows={4}
            />
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="generate_unique_image">Generate Unique Image</Label>
                <p className="text-sm text-muted-foreground">
                  AI will create a unique program cover image
                </p>
              </div>
              <Switch
                id="generate_unique_image"
                checked={formData.generate_unique_image}
                onCheckedChange={(checked) => setFormData({ ...formData, generate_unique_image: checked })}
              />
            </div>
            
            {!formData.generate_unique_image && (
              <div className="space-y-2">
                <Label htmlFor="image_url">Or Enter Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/src/assets/program-image.jpg"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGeneratingImage}>
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setShowPreview(true)}
              disabled={isGeneratingImage || !formData.name}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isGeneratingImage}>
              {isGeneratingImage ? "Generating..." : program ? "Update Program" : "Create & Send to User"}
            </Button>
          </div>
        </div>
      </DialogContent>

      <ProgramPreviewDialog 
        open={showPreview}
        onOpenChange={setShowPreview}
        programData={formData}
      />
    </Dialog>
  );
};
