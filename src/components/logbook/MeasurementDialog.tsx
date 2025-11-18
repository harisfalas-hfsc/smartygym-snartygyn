import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface MeasurementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const MeasurementDialog = ({ isOpen, onClose, userId }: MeasurementDialogProps) => {
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one field is filled
    if (!weight && !bodyFat && !muscleMass) {
      toast.error("Please enter at least one measurement");
      return;
    }

    // Validate body fat percentage range
    if (bodyFat && (parseFloat(bodyFat) < 0 || parseFloat(bodyFat) > 100)) {
      toast.error("Body fat percentage must be between 0 and 100");
      return;
    }

    setIsSubmitting(true);

    try {
      const toolResult: any = {};
      if (weight) toolResult.weight = parseFloat(weight);
      if (bodyFat) toolResult.body_fat = parseFloat(bodyFat);
      if (muscleMass) toolResult.muscle_mass = parseFloat(muscleMass);

      const today = new Date();
      const activityDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const { error } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: userId,
          content_type: 'measurement',
          item_id: 'body_measurement',
          item_name: 'Body Measurements',
          action_type: 'recorded',
          tool_result: toolResult,
          activity_date: activityDate,
        });

      if (error) throw error;

      toast.success("Measurements recorded successfully");
      queryClient.invalidateQueries({ queryKey: ['activity-log'] });
      
      // Reset form
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      onClose();
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast.error("Failed to save measurements");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Record Body Measurements
          </DialogTitle>
        </DialogHeader>

        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Body Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 75.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bodyFat">Body Fat (%)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 18.5"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="muscleMass">Muscle Mass (kg)</Label>
                <Input
                  id="muscleMass"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 35.0"
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                * Enter at least one measurement
              </p>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Measurement"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
