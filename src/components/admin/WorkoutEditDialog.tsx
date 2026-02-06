import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { A4Container } from "@/components/ui/a4-container";
import { normalizeWorkoutHtml } from "@/utils/htmlNormalizer";

import { WORKOUT_CATEGORIES, getDifficultyFromStars } from "@/constants/workoutCategories";

// Micro-workout fixed values (enforced by DB trigger too)
const MICRO_WORKOUT_RULES = {
  equipment: 'BODYWEIGHT',
  difficulty: 'All Levels',
  difficulty_stars: null as number | null,
  duration: '5 min'
};

const FORMATS = [
  "TABATA",
  "CIRCUIT",
  "AMRAP",
  "FOR TIME",
  "EMOM",
  "REPS & SETS",
  "MIX"
];

// Categories with FIXED formats - auto-set and disable dropdown
const FIXED_FORMAT_CATEGORIES: Record<string, string> = {
  'STRENGTH': 'REPS & SETS',
  'MOBILITY & STABILITY': 'REPS & SETS',
  'PILATES': 'REPS & SETS',
  'RECOVERY': 'MIX'
};

// Helper to get required format for a category
const getRequiredFormat = (category: string): string | null => {
  return FIXED_FORMAT_CATEGORIES[category] || null;
};

const EQUIPMENT_OPTIONS = ["BODYWEIGHT", "EQUIPMENT"];

const DURATION_OPTIONS = [
  "30 MINUTES",
  "35 MINUTES",
  "40 MINUTES",
  "45 MINUTES",
  "50 MINUTES",
  "55 MINUTES",
  "60 MINUTES",
  "65 MINUTES",
  "70 MINUTES",
  "75 MINUTES",
  "VARIOUS"
];

// 0 = All Levels, 1-6 = stars
const DIFFICULTY_STARS = [0, 1, 2, 3, 4, 5, 6];

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
    is_free: false,
    is_premium: false,
    tier_required: '',
    is_standalone_purchase: false,
    price: '',
    stripe_product_id: '',
    stripe_price_id: '',
  });
  const [sendNotification, setSendNotification] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const getCategoryPrefix = (category: string) => {
    const prefixMap: { [key: string]: string } = {
      'STRENGTH': 'S',
      'CALORIE BURNING': 'CB',
      'METABOLIC': 'ME',
      'CARDIO': 'C',
      'MOBILITY & STABILITY': 'M',
      'CHALLENGE': 'CH',
      'PILATES': 'PIL',
      'RECOVERY': 'REC',
      'MICRO-WORKOUTS': 'MW',
      // Legacy support for old values still in DB
      'MOBILITY': 'M',
      'CALORIE_BURNING': 'CB',
      'CONDITIONING': 'ME',
      'POWER': 'S',
    };
    return prefixMap[category] || 'W';
  };

  // Check if current category is micro-workout (fields should be locked)
  const isMicroWorkout = formData.category === 'MICRO-WORKOUTS';

  useEffect(() => {
    if (workout) {
      setFormData(workout);
      setSendNotification(false); // Don't send notifications for edits by default
    } else {
      setFormData({
        id: '',
        serial_number: 0,
        name: '',
        category: '',
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
        is_free: false,
        is_premium: false,
        tier_required: '',
        is_standalone_purchase: false,
        price: '',
        stripe_product_id: '',
        stripe_price_id: '',
      });
      setSendNotification(false); // Default to NOT sending notifications
    }
  }, [workout]);

  // Auto-generate serial number when category changes using persistent counters
  useEffect(() => {
    if (!workout && formData.category) {
      const generateSerialNumber = async () => {
        const prefix = getCategoryPrefix(formData.category);
        
        // Fetch persistent counter from system_settings
        const { data: settings, error: settingsError } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'serial_number_counters')
          .single();
        
        if (settingsError) {
          console.error('Error fetching serial counters:', settingsError);
          // Fallback to old logic if counters not found
          const { data } = await supabase
            .from('admin_workouts')
            .select('serial_number')
            .eq('category', formData.category)
            .eq('is_workout_of_day', false)
            .order('serial_number', { ascending: false, nullsFirst: false })
            .limit(1);
          
          const nextSerial = (data?.[0]?.serial_number || 0) + 1;
          setFormData(prev => ({
            ...prev,
            serial_number: nextSerial,
            id: `${prefix}-${nextSerial.toString().padStart(3, '0')}`
          }));
          return;
        }
        
        const counters = settings?.setting_value as { workouts?: Record<string, number> } || { workouts: {} };
        const nextSerial = counters.workouts?.[formData.category] || 1;
        
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
    if (stars === 0) return "All Levels";
    if (stars <= 2) return "Beginner";
    if (stars <= 4) return "Intermediate";
    return "Advanced";
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Workout name is required. Please provide a name for this workout.",
        });
        return;
      }

      if (!formData.category) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Category is required. Please select a category.",
        });
        return;
      }

      // Validate that free content cannot be standalone purchase
      if (!formData.is_premium && formData.is_standalone_purchase) {
        toast({
          variant: "destructive",
          title: "Invalid Configuration",
          description: "Free content cannot be sold as standalone purchase. Please enable Premium first.",
        });
        return;
      }

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

      // ═══════════════════════════════════════════════════════════════════════════════
      // GOLD STANDARD V3: Normalize main_workout HTML before saving
      // This prevents spacing issues from rich text editor output
      // ═══════════════════════════════════════════════════════════════════════════════
      const normalizedMainWorkout = normalizeWorkoutHtml(formData.main_workout || '');

      // Prepare data with backward compatibility
      const saveData = {
        ...formData,
        image_url: imageUrl,
        main_workout: normalizedMainWorkout,  // Use normalized content
        type: formData.format || formData.category,
        difficulty: getDifficultyLabel(formData.difficulty_stars),
        price: formData.price ? parseFloat(formData.price) : null,
      };

      // Remove the generate_unique_image flag before saving
      const { generate_unique_image, stripe_product_id: existingStripeProductId, stripe_price_id: existingStripePriceId, ...dataToSave } = saveData;

      if (workout) {
        // Update existing workout
        const { error } = await supabase
          .from('admin_workouts')
          .update({
            ...dataToSave,
            stripe_product_id: formData.stripe_product_id,
            stripe_price_id: formData.stripe_price_id,
          })
          .eq('id', workout.id);

        if (error) throw error;

        // Sync image to Stripe if image changed and Stripe product exists
        if (formData.stripe_product_id && imageUrl && imageUrl !== workout.image_url) {
          try {
            let stripeUpdateImageUrl = imageUrl;
            if (imageUrl && imageUrl.startsWith('/')) {
              stripeUpdateImageUrl = `${window.location.origin}${imageUrl}`;
            }
            
            const { error: stripeUpdateError } = await supabase.functions.invoke('update-stripe-product', {
              body: {
                productId: formData.stripe_product_id,
                imageUrl: stripeUpdateImageUrl
              }
            });
            if (stripeUpdateError) {
              console.error('Failed to sync image to Stripe:', stripeUpdateError);
            } else {
              console.log('✅ Image synced to Stripe product');
            }
          } catch (syncError) {
            console.error('Error syncing image to Stripe:', syncError);
          }
        }

        toast({ title: "Success", description: "Workout updated successfully" });
      } else {
        // NEW WORKOUT: First increment the counter, then save to DB, then create Stripe product
        
        // Step 1: Increment counter atomically BEFORE saving
        const { data: counterSettings, error: counterError } = await supabase
          .from('system_settings')
          .select('setting_value')
          .eq('setting_key', 'serial_number_counters')
          .single();
        
        if (!counterError && counterSettings) {
          const counters = counterSettings.setting_value as { workouts?: Record<string, number>, programs?: Record<string, number> };
          const currentSerial = counters.workouts?.[formData.category] || 1;
          
          // Increment for next use
          counters.workouts = counters.workouts || {};
          counters.workouts[formData.category] = currentSerial + 1;
          
          await supabase
            .from('system_settings')
            .update({ setting_value: counters, updated_at: new Date().toISOString() })
            .eq('setting_key', 'serial_number_counters');
          
          console.log(`✅ Counter incremented: ${formData.category} now at ${currentSerial + 1}`);
        }
        
        // Step 2: Save to database FIRST (before Stripe)
        const { error: insertError } = await supabase
          .from('admin_workouts')
          .insert([{
            ...dataToSave,
            stripe_product_id: null,
            stripe_price_id: null,
          }]);

        if (insertError) throw insertError;
        
        // Step 3: Create Stripe product AFTER DB save succeeds
        let stripeProductId = null;
        let stripePriceId = null;
        
        const shouldCreateStripeProduct =
          formData.is_standalone_purchase &&
          formData.price &&
          parseFloat(formData.price) > 0;
        
        if (shouldCreateStripeProduct) {
          let stripeImageUrl = imageUrl;
          if (imageUrl && imageUrl.startsWith('/')) {
            stripeImageUrl = `${window.location.origin}${imageUrl}`;
          }
          
          // CRITICAL: Set contentType dynamically - Micro-Workouts get "Micro-Workout"
          const contentType = formData.category === "MICRO-WORKOUTS" ? "Micro-Workout" : "Workout";
          
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-product', {
            body: {
              name: formData.name,
              price: formData.price,
              contentType: contentType,
              imageUrl: stripeImageUrl
            }
          });

          if (stripeError) {
            console.error('Error creating Stripe product:', stripeError);
            toast({
              title: "Warning",
              description: "Workout saved but Stripe product creation failed. You can retry from the edit dialog.",
              variant: "destructive",
            });
          } else if (stripeData) {
            stripeProductId = stripeData.product_id;
            stripePriceId = stripeData.price_id;
            
            // Step 4: Update workout with Stripe IDs
            await supabase
              .from('admin_workouts')
              .update({
                stripe_product_id: stripeProductId,
                stripe_price_id: stripePriceId,
              })
              .eq('id', dataToSave.id);
          }
        }

        // Only schedule notification if admin explicitly enabled it
        // Skip notifications for test workouts (names containing "test", "TEST", etc.)
        const isTestWorkout = formData.name && /test/i.test(formData.name.trim());
        
        if (sendNotification && formData.name && formData.name.trim() && !isTestWorkout) {
          try {
            // Use the pending_content_notifications table which has an actual processor
            await supabase
              .from('pending_content_notifications')
              .insert([{
                content_type: 'workout',
                content_id: dataToSave.id,
                content_name: formData.name,
                content_category: formData.category || null,
              }]);
            
            if (import.meta.env.DEV) {
              console.log('✅ Notification queued for new workout:', formData.name);
            }
            toast({ title: "Success", description: "Workout created and notification queued!" });
          } catch (notifError) {
            if (import.meta.env.DEV) {
              console.error('Error queueing notification:', notifError);
            }
            toast({ title: "Success", description: "Workout created successfully!" });
          }
        } else {
          const reason = isTestWorkout ? ' (test workout - no notification)' : '';
          toast({ title: "Success", description: `Workout created successfully!${reason}` });
        }
      }
      onSave();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save workout",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{workout ? 'Edit Workout' : 'Create New Workout'}</DialogTitle>
          <DialogDescription>
            {workout ? 'Update workout details' : 'Add a new workout to your library'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          {/* 1. Category */}
          <div className="space-y-2">
            <Label htmlFor="category">1. Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => {
                const requiredFormat = getRequiredFormat(value);
                // If micro-workout, auto-set all fixed fields
                if (value === 'MICRO-WORKOUTS') {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    equipment: MICRO_WORKOUT_RULES.equipment,
                    difficulty_stars: 0, // Will be set to NULL by DB trigger, 0 means "All Levels"
                    duration: MICRO_WORKOUT_RULES.duration,
                  }));
                } else {
                  setFormData(prev => ({ 
                    ...prev, 
                    category: value,
                    // Auto-set format for restricted categories
                    ...(requiredFormat ? { format: requiredFormat } : {})
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {WORKOUT_CATEGORIES.map(cat => (
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

          {/* 4. Difficulty Level (Stars) */}
          <div className="space-y-2">
            <Label>5. Difficulty Level *</Label>
            <div className="flex items-center gap-4">
              <Select 
                value={formData.difficulty_stars.toString()} 
                onValueChange={(value) => setFormData({ ...formData, difficulty_stars: parseInt(value) })}
                disabled={isMicroWorkout}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {DIFFICULTY_STARS.map(stars => (
                    <SelectItem key={stars} value={stars.toString()}>
                      {stars === 0 ? "All Levels" : `${"⭐".repeat(stars)} (${stars})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {getDifficultyLabel(formData.difficulty_stars)}
                {isMicroWorkout && " (locked for Micro-Workouts)"}
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
            {getRequiredFormat(formData.category) ? (
              <>
                <Input 
                  value={formData.format} 
                  disabled 
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-amber-600 font-medium">
                  ⚠️ {formData.category} category requires "{getRequiredFormat(formData.category)}" format (auto-set)
                </p>
              </>
            ) : (
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
            )}
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

          {/* 9. Workout Content - Single Box with Exercise Search in toolbar */}
          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="main_workout">9. Workout Content *</Label>
            <A4Container>
              <RichTextEditor
                value={formData.main_workout}
                onChange={(value) => setFormData({ ...formData, main_workout: value })}
                placeholder="Enter the complete workout content here - format with bold, bullets, headings, tables, etc..."
                minHeight="300px"
                showExerciseSearch={true}
              />
            </A4Container>
            <p className="text-xs text-muted-foreground">
              Use the Exercises button in the toolbar to add exercises with View buttons
            </p>
          </div>

          {/* 10. Description */}
          <div className="space-y-2">
            <Label htmlFor="description">10. Description</Label>
            <A4Container>
              <RichTextEditor
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder="Brief description of the workout..."
                minHeight="120px"
              />
            </A4Container>
          </div>

          {/* 11. Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">11. Instructions</Label>
            <p className="text-sm text-muted-foreground italic">
              Note: A link to the Exercise Library will automatically appear above your instructions when displayed to users.
            </p>
            <A4Container>
              <RichTextEditor
                value={formData.instructions}
                onChange={(value) => setFormData({ ...formData, instructions: value })}
                placeholder="Step-by-step instructions..."
                minHeight="150px"
              />
            </A4Container>
          </div>

          {/* 12. Tips */}
          <div className="space-y-2">
            <Label htmlFor="tips">12. Tips</Label>
            <A4Container>
              <RichTextEditor
                value={formData.tips}
                onChange={(value) => setFormData({ ...formData, tips: value })}
                placeholder="Helpful tips for this workout..."
                minHeight="120px"
              />
            </A4Container>
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

          {/* Notification Toggle - Only for NEW workouts */}
          {!workout && (
            <div className="space-y-2 pt-4 border-t border-orange-200 bg-orange-50/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="send_notification" className="text-orange-800 font-semibold">
                    📢 Send Notification to Users
                  </Label>
                  <p className="text-sm text-orange-700">
                    Enable to notify all users about this new workout via email and dashboard
                  </p>
                </div>
                <Switch
                  id="send_notification"
                  checked={sendNotification}
                  onCheckedChange={setSendNotification}
                />
              </div>
              {sendNotification && (
                <p className="text-sm text-orange-600 bg-orange-100 p-2 rounded mt-2">
                  ⚠️ Users will receive a notification about this workout. Make sure content is ready!
                </p>
              )}
              {formData.name && /test/i.test(formData.name) && (
                <p className="text-sm text-amber-600 bg-amber-100 p-2 rounded mt-2">
                  🧪 Test workout detected - notifications will be automatically skipped
                </p>
              )}
            </div>
          )}

          {/* 13. Free Content Toggle */}
          <div className="space-y-4 pt-4 border-t">
            <Label>13. Content Type *</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_free: checked,
                  // If marking as free, disable premium and standalone purchase
                  is_premium: checked ? false : formData.is_premium,
                  is_standalone_purchase: checked ? false : formData.is_standalone_purchase,
                  price: checked ? '' : formData.price,
                  tier_required: checked ? null : formData.tier_required
                })}
              />
              <Label htmlFor="is_free" className="cursor-pointer">
                {formData.is_free ? '🆓 Free Content (no Stripe product)' : 'Paid Content'}
              </Label>
            </div>
            {formData.is_free && (
              <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
                ✓ This workout is marked as FREE. It will be accessible to all users and will not require a Stripe product.
              </p>
            )}
          </div>

          {/* 14. Premium Toggle - Only show if not free */}
          {!formData.is_free && (
            <div className="space-y-4 pt-4 border-t">
              <Label>14. Access Level *</Label>
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
                  {formData.is_premium ? '🔒 Premium Content' : '🆓 Free Content'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.is_premium 
                  ? 'This workout will be available to Gold and Platinum subscribers' 
                  : 'This workout will be free for all visitors'}
              </p>
            </div>
          )}

          {/* 15. Standalone Purchase - Only show if premium and not free */}
          {!formData.is_free && (
            <div className="space-y-4 pt-4 border-t">
              <Label>15. Standalone Purchase Options</Label>
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
                  {!formData.stripe_product_id ? (
                    <p className="text-sm text-muted-foreground">
                      This will automatically create a Stripe product when you save.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Stripe product already created for this workout.
                    </p>
                  )}
                  {formData.stripe_product_id && (
                    <p className="text-xs text-green-600">
                      ✓ Stripe Product ID: {formData.stripe_product_id}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
