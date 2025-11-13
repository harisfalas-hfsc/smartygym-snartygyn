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

const CATEGORIES = [
  "STRENGTH",
  "CARDIO",
  "MOBILITY",
  "CONDITIONING",
  "POWER",
  "RECOVERY",
  "CALORIE BURNING",
  "METABOLIC",
  "CHALLENGE"
];

const FORMATS = [
  "TABATA",
  "CIRCUIT",
  "AMRAP",
  "FOR TIME",
  "EMOM",
  "REPS & SETS",
  "MIX"
];

const EQUIPMENT_OPTIONS = ["BODYWEIGHT", "EQUIPMENT"];

const DURATION_OPTIONS = [
  "15 MINUTES",
  "20 MINUTES",
  "30 MINUTES",
  "45 MINUTES",
  "60 MINUTES",
  "VARIES"
];

const DIFFICULTY_STARS = [1, 2, 3, 4, 5, 6];

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
    serial_number: 0,
    name: '',
    category: '',
    focus: '',
    difficulty_stars: 3,
    equipment: '',
    format: '',
    duration: '',
    activation: '',
    warm_up: '',
    main_workout: '',
    finisher: '',
    cool_down: '',
    description: '',
    instructions: '',
    tips: '',
    image_url: '',
    generate_unique_image: false,
    is_premium: false,
    tier_required: '',
    is_standalone_purchase: false,
    price: '',
    stripe_product_id: '',
    stripe_price_id: '',
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const getCategoryPrefix = (category: string) => {
    const prefixMap: { [key: string]: string } = {
      'STRENGTH': 'S',
      'CARDIO': 'C',
      'MOBILITY': 'M',
      'CONDITIONING': 'CO',
      'POWER': 'P',
      'RECOVERY': 'R',
      'CALORIE BURNING': 'CB',
      'METABOLIC': 'ME',
      'CHALLENGE': 'CH',
    };
    return prefixMap[category] || 'W';
  };

  useEffect(() => {
    if (workout) {
      setFormData(workout);
    } else {
      setFormData({
        id: '',
        serial_number: 0,
        name: '',
        category: '',
        focus: '',
        difficulty_stars: 3,
        equipment: '',
        format: '',
        duration: '',
        activation: '',
        warm_up: '',
        main_workout: '',
        finisher: '',
        cool_down: '',
        description: '',
        instructions: '',
        tips: '',
        image_url: '',
        generate_unique_image: false,
        is_premium: false,
        tier_required: '',
        is_standalone_purchase: false,
        price: '',
        stripe_product_id: '',
        stripe_price_id: '',
      });
    }
  }, [workout]);

  // Auto-generate serial number when category changes
  useEffect(() => {
    if (!workout && formData.category) {
      const generateSerialNumber = async () => {
        const prefix = getCategoryPrefix(formData.category);
        const { data } = await supabase
          .from('admin_workouts')
          .select('id, serial_number')
          .like('id', `${prefix}-%`)
          .order('serial_number', { ascending: false })
          .limit(1);
        
        let nextSerial = 1;
        if (data && data.length > 0 && data[0].serial_number) {
          nextSerial = data[0].serial_number + 1;
        }
        
        setFormData(prev => ({
          ...prev,
          serial_number: nextSerial,
          id: `${prefix}-${nextSerial.toString().padStart(3, '0')}`
        }));
      };
      
      generateSerialNumber();
    }
  }, [formData.category, workout]);

  const getDifficultyLabel = (stars: number) => {
    if (stars <= 2) return "Beginner";
    if (stars <= 4) return "Intermediate";
    return "Advanced";
  };

  const handleSave = async () => {
    try {
      setIsGeneratingImage(true);
      
      let imageUrl = formData.image_url;
      
      // Generate unique image if requested
      if (formData.generate_unique_image) {
        const { data: imageData, error: imageError } = await supabase.functions.invoke('generate-workout-image', {
          body: {
            name: formData.name,
            category: formData.category,
            format: formData.format,
            difficulty_stars: formData.difficulty_stars,
          }
        });

        if (imageError) {
          console.error('Error generating image:', imageError);
          toast({
            title: "Warning",
            description: "Failed to generate image, saving without image",
            variant: "destructive",
          });
        } else if (imageData?.image_url) {
          imageUrl = imageData.image_url;
        }
      }

      // Create Stripe product if standalone purchase with price
      let stripeProductId = formData.stripe_product_id;
      let stripePriceId = formData.stripe_price_id;
      
      if (formData.is_standalone_purchase && formData.price && parseFloat(formData.price) > 0) {
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-product', {
          body: {
            name: formData.name,
            price: formData.price,
            contentType: "Workout",
            imageUrl: imageUrl
          }
        });

        if (stripeError) {
          console.error('Error creating Stripe product:', stripeError);
          toast({
            title: "Error",
            description: "Failed to create Stripe product. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (stripeData) {
          stripeProductId = stripeData.product_id;
          stripePriceId = stripeData.price_id;
        }
      }

      // Prepare data with backward compatibility
      const saveData = {
        ...formData,
        image_url: imageUrl,
        type: formData.format || formData.category,
        difficulty: getDifficultyLabel(formData.difficulty_stars),
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        price: formData.price ? parseFloat(formData.price) : null,
      };

      // Remove the generate_unique_image flag before saving
      const { generate_unique_image, ...dataToSave } = saveData;

      if (workout) {
        // Update existing
        const { error } = await supabase
          .from('admin_workouts')
          .update(dataToSave)
          .eq('id', workout.id);

        if (error) throw error;
        toast({ title: "Success", description: "Workout updated successfully" });
      } else {
        // Insert new
        const { error } = await supabase
          .from('admin_workouts')
          .insert([dataToSave]);

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
    } finally {
      setIsGeneratingImage(false);
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
          {/* 1. Category */}
          <div className="space-y-2">
            <Label htmlFor="category">1. Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value, focus: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serial_number">2. Serial Number</Label>
            <Input
              id="serial_number"
              type="number"
              value={formData.serial_number}
              onChange={(e) => {
                const serial = parseInt(e.target.value) || 0;
                const prefix = formData.category ? getCategoryPrefix(formData.category) : 'W';
                setFormData({ 
                  ...formData, 
                  serial_number: serial,
                  id: `${prefix}-${serial.toString().padStart(3, '0')}`
                });
              }}
              placeholder="Auto-generated based on category"
              disabled={!formData.category}
            />
            <p className="text-sm text-muted-foreground">Workout ID: {formData.id || 'Select category first'}</p>
          </div>

          {/* 3. Name */}
          <div className="space-y-2">
            <Label htmlFor="name">3. Workout Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter workout name"
            />
          </div>

          {/* 4. Focus (auto-filled from category) */}
          <div className="space-y-2">
            <Label htmlFor="focus">4. Focus (Auto-filled from Category)</Label>
            <Input
              id="focus"
              value={formData.focus}
              disabled
              className="bg-muted"
            />
          </div>

          {/* 5. Difficulty Level (Stars) */}
          <div className="space-y-2">
            <Label>5. Difficulty Level *</Label>
            <div className="flex items-center gap-4">
              <Select 
                value={formData.difficulty_stars.toString()} 
                onValueChange={(value) => setFormData({ ...formData, difficulty_stars: parseInt(value) })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_STARS.map(stars => (
                    <SelectItem key={stars} value={stars.toString()}>
                      {"⭐".repeat(stars)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {getDifficultyLabel(formData.difficulty_stars)}
              </span>
            </div>
          </div>

          {/* 6. Equipment */}
          <div className="space-y-2">
            <Label htmlFor="equipment">6. Equipment *</Label>
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

          {/* 7. Format */}
          <div className="space-y-2">
            <Label htmlFor="format">7. Format *</Label>
            <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map(format => (
                  <SelectItem key={format} value={format}>{format}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 8. Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">8. Duration *</Label>
            <Select value={formData.duration} onValueChange={(value) => setFormData({ ...formData, duration: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map(dur => (
                  <SelectItem key={dur} value={dur}>{dur}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 9. Workout Content - Single Box */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="main_workout">9. Workout Content *</Label>
            <Textarea
              id="main_workout"
              value={formData.main_workout}
              onChange={(e) => setFormData({ ...formData, main_workout: e.target.value })}
              placeholder="Enter the complete workout content here - use spaces, bold letters, capitals, bullets (•, -, *), and line breaks to format your content as needed..."
              rows={15}
              className="font-mono text-sm break-words-safe resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Write freely with full formatting control - add sections (Warm Up, Main Workout, Cool Down, etc.), bullets, emphasis as needed
            </p>
          </div>

          {/* 10. Description */}
          <div className="space-y-2">
            <Label htmlFor="description">10. Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the workout..."
              rows={3}
              className="break-words-safe resize-none"
            />
          </div>

          {/* 11. Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">11. Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Step-by-step instructions..."
              className="break-words-safe resize-none"
              rows={4}
            />
          </div>

          {/* 12. Tips */}
          <div className="space-y-2">
            <Label htmlFor="tips">12. Tips</Label>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
              placeholder="Helpful tips for this workout..."
              rows={3}
              className="break-words-safe resize-none"
            />
          </div>

          {/* Image Generation */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="generate_unique_image">Generate Unique Image</Label>
                <p className="text-sm text-muted-foreground">
                  AI will create a unique workout cover image based on title, category, and format
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
                <Label htmlFor="image_url">Or Enter Image URL Manually</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/src/assets/workout-image.jpg"
                />
              </div>
            )}
          </div>

          {/* 13. Free or Premium */}
          <div className="space-y-4 pt-4 border-t">
            <Label>13. Access Level *</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_premium: checked,
                  // Reset standalone when switching to free
                  is_standalone_purchase: checked ? formData.is_standalone_purchase : false,
                  price: checked ? formData.price : '',
                  tier_required: checked ? 'premium' : null
                })}
              />
              <Label htmlFor="is_premium" className="cursor-pointer">
                {formData.is_premium ? 'Premium Content' : 'Free Content'}
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.is_premium 
                ? 'This workout will be available to Gold and Platinum subscribers' 
                : 'This workout will be free for all visitors'}
            </p>
          </div>

          {/* 14. Standalone Purchase */}
          <div className="space-y-4 pt-4 border-t">
            <Label>14. Standalone Purchase Options</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_standalone_purchase"
                checked={formData.is_standalone_purchase}
                onCheckedChange={(checked) => setFormData({ ...formData, is_standalone_purchase: checked })}
                disabled={!formData.is_premium}
              />
              <Label 
                htmlFor="is_standalone_purchase" 
                className={`cursor-pointer ${!formData.is_premium ? 'opacity-50' : ''}`}
              >
                Available as Standalone Purchase
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {!formData.is_premium 
                ? 'Only premium content can be sold as standalone purchases. Switch to Premium first.' 
                : 'Enable this to allow users to buy this workout individually without a subscription'}
            </p>

            {formData.is_standalone_purchase && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="price">Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., 9.99"
                />
                <p className="text-sm text-muted-foreground">
                  This will automatically create a Stripe product when you save
                </p>
                {formData.stripe_product_id && (
                  <p className="text-xs text-green-600">
                    ✓ Stripe Product ID: {formData.stripe_product_id}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGeneratingImage}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isGeneratingImage}>
              {isGeneratingImage ? "Generating Image..." : "Save Workout"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
