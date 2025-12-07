import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sunrise, Sun, Moon } from "lucide-react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

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

interface RitualEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ritual: Ritual | null;
  onSave: () => void;
}

export const RitualEditDialog = ({ open, onOpenChange, ritual, onSave }: RitualEditDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ritual_date: "",
    day_number: 1,
    morning_content: "",
    midday_content: "",
    evening_content: "",
    is_visible: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (ritual) {
      setFormData({
        ritual_date: ritual.ritual_date,
        day_number: ritual.day_number,
        morning_content: ritual.morning_content,
        midday_content: ritual.midday_content,
        evening_content: ritual.evening_content,
        is_visible: ritual.is_visible,
      });
    } else {
      // Default for new ritual
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        ritual_date: today,
        day_number: 1,
        morning_content: "",
        midday_content: "",
        evening_content: "",
        is_visible: true,
      });
    }
  }, [ritual, open]);

  const handleSave = async () => {
    if (!formData.ritual_date) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    if (!formData.morning_content || !formData.midday_content || !formData.evening_content) {
      toast({
        title: "Error",
        description: "Please fill in all content sections",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (ritual) {
        // Update existing
        const { error } = await supabase
          .from('daily_smarty_rituals')
          .update({
            ritual_date: formData.ritual_date,
            day_number: formData.day_number,
            morning_content: formData.morning_content,
            midday_content: formData.midday_content,
            evening_content: formData.evening_content,
            is_visible: formData.is_visible,
          })
          .eq('id', ritual.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ritual updated successfully",
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('daily_smarty_rituals')
          .insert({
            ritual_date: formData.ritual_date,
            day_number: formData.day_number,
            morning_content: formData.morning_content,
            midday_content: formData.midday_content,
            evening_content: formData.evening_content,
            is_visible: formData.is_visible,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ritual created successfully",
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving ritual:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ritual",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ritual ? 'Edit Ritual' : 'Create New Ritual'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ritual_date">Date</Label>
              <Input
                id="ritual_date"
                type="date"
                value={formData.ritual_date}
                onChange={(e) => setFormData(prev => ({ ...prev, ritual_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day_number">Day Number</Label>
              <Input
                id="day_number"
                type="number"
                min="1"
                value={formData.day_number}
                onChange={(e) => setFormData(prev => ({ ...prev, day_number: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
              <Label htmlFor="is_visible">Visible to users</Label>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="morning" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="morning" className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-orange-500" />
                Morning
              </TabsTrigger>
              <TabsTrigger value="midday" className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-600" />
                Midday
              </TabsTrigger>
              <TabsTrigger value="evening" className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-600" />
                Evening
              </TabsTrigger>
            </TabsList>

            <TabsContent value="morning" className="mt-4">
              <div className="space-y-2">
                <Label>Morning Content (Activation ~8:00 AM)</Label>
                <RichTextEditor
                  value={formData.morning_content}
                  onChange={(value) => setFormData(prev => ({ ...prev, morning_content: value }))}
                  placeholder="Enter morning ritual content..."
                />
              </div>
            </TabsContent>

            <TabsContent value="midday" className="mt-4">
              <div className="space-y-2">
                <Label>Midday Content (Reset ~1:00 PM)</Label>
                <RichTextEditor
                  value={formData.midday_content}
                  onChange={(value) => setFormData(prev => ({ ...prev, midday_content: value }))}
                  placeholder="Enter midday ritual content..."
                />
              </div>
            </TabsContent>

            <TabsContent value="evening" className="mt-4">
              <div className="space-y-2">
                <Label>Evening Content (Unwind ~5:00 PM)</Label>
                <RichTextEditor
                  value={formData.evening_content}
                  onChange={(value) => setFormData(prev => ({ ...prev, evening_content: value }))}
                  placeholder="Enter evening ritual content..."
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {ritual ? 'Update Ritual' : 'Create Ritual'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
