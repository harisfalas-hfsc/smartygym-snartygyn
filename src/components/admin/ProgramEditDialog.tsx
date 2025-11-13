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

const PROGRAM_CATEGORIES = [
  "CARDIO",
  "FUNCTIONAL STRENGTH",
  "MUSCLE HYPERTROPHY",
  "WEIGHT LOSS",
  "LOW BACK PAIN",
  "MOBILITY/STABILITY"
];

const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const WEEKS_OPTIONS = [4, 6, 8];
const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6];

const EQUIPMENT_OPTIONS = [
  "Bodyweight",
  "Equipment"
];

interface WeekDayContent {
  week: number;
  day: number;
  content: string;
}

interface ProgramEditDialogProps {
  program: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  isPersonalTraining?: boolean;
  request?: any; // For personal training requests
}

export const ProgramEditDialog = ({ program, open, onOpenChange, onSave, isPersonalTraining = false, request }: ProgramEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    serial_number: 0,
    name: '',
    category: '',
    difficulty_stars: 1,
    weeks: 4,
    days_per_week: 4,
    equipment: '',
    training_program: '',
    program_description: '',
    construction: '',
    final_tips: '',
    image_url: '',
    generate_unique_image: false,
    is_premium: false,
    is_standalone_purchase: false,
    price: '',
    stripe_product_id: '',
    stripe_price_id: '',
  });
  const [weekDayContents, setWeekDayContents] = useState<WeekDayContent[]>([]);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const getCategoryPrefix = (category: string) => {
    const prefixMap: { [key: string]: string } = {
      'CARDIO': 'C',
      'FUNCTIONAL STRENGTH': 'F',
      'MUSCLE HYPERTROPHY': 'M',
      'WEIGHT LOSS': 'W',
      'LOW BACK PAIN': 'L',
      'MOBILITY/STABILITY': 'MS',
    };
    return prefixMap[category] || 'P';
  };

  useEffect(() => {
    const generateSerialNumber = async (category: string) => {
      const prefix = getCategoryPrefix(category);
      const tableName = isPersonalTraining ? 'personal_training_programs' : 'admin_training_programs';
      const { data } = await supabase
        .from(tableName)
        .select('id, serial_number')
        .like('id', `${prefix}-%`)
        .order('serial_number', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0 && data[0].serial_number) {
        const currentSerial = typeof data[0].serial_number === 'string' 
          ? parseInt(data[0].serial_number) 
          : data[0].serial_number;
        return currentSerial + 1;
      }
      return 1;
    };

    if (program) {
      setFormData({
        id: program.id,
        serial_number: program.serial_number || 0,
        name: program.name,
        category: program.category,
        difficulty_stars: program.difficulty_stars || 1,
        weeks: program.weeks || 4,
        days_per_week: program.days_per_week || 4,
        equipment: program.equipment || '',
        training_program: program.weekly_schedule || '',
        program_description: program.description || '',
        construction: program.program_structure || '',
        final_tips: program.nutrition_tips || '',
        image_url: program.image_url || '',
        generate_unique_image: false,
        is_premium: program.is_premium || false,
        is_standalone_purchase: program.is_standalone_purchase || false,
        price: program.price ? program.price.toString() : '',
        stripe_product_id: program.stripe_product_id || '',
        stripe_price_id: program.stripe_price_id || '',
      });
      
      // Parse weekly_schedule if exists
      if (program.weekly_schedule) {
        try {
          const parsed = JSON.parse(program.weekly_schedule);
          setWeekDayContents(parsed);
        } catch {
          setWeekDayContents([]);
        }
      }
    } else {
      setFormData({
        id: '',
        serial_number: 0,
        name: '',
        category: '',
        difficulty_stars: 1,
        weeks: 4,
        days_per_week: 4,
        equipment: '',
        training_program: '',
        program_description: '',
        construction: '',
        final_tips: '',
        image_url: '',
        generate_unique_image: false,
        is_premium: false,
        is_standalone_purchase: false,
        price: '',
        stripe_product_id: '',
        stripe_price_id: '',
      });
      setWeekDayContents([]);
    }
  }, [program]);

  // Auto-generate serial number when category changes
  useEffect(() => {
    if (!program && formData.category) {
      const generateSerialNumber = async () => {
        const prefix = getCategoryPrefix(formData.category);
        const tableName = isPersonalTraining ? 'personal_training_programs' : 'admin_training_programs';
        const { data } = await supabase
          .from(tableName)
          .select('id, serial_number')
          .like('id', `${prefix}-%`)
          .order('serial_number', { ascending: false })
          .limit(1);
        
        let nextSerial = 1;
        if (data && data.length > 0 && data[0].serial_number) {
          const currentSerial = typeof data[0].serial_number === 'string' 
            ? parseInt(data[0].serial_number) 
            : data[0].serial_number;
          nextSerial = currentSerial + 1;
        }
        
        setFormData(prev => ({
          ...prev,
          serial_number: nextSerial,
          id: `${prefix}-${nextSerial.toString().padStart(3, '0')}`
        }));
      };
      
      generateSerialNumber();
    }
  }, [formData.category, program, isPersonalTraining]);

  // Generate week/day boxes when weeks or days_per_week changes
  useEffect(() => {
    const boxes: WeekDayContent[] = [];
    for (let week = 1; week <= formData.weeks; week++) {
      for (let day = 1; day <= formData.days_per_week; day++) {
        const existing = weekDayContents.find(wdc => wdc.week === week && wdc.day === day);
        boxes.push({
          week,
          day,
          content: existing?.content || ''
        });
      }
    }
    setWeekDayContents(boxes);
  }, [formData.weeks, formData.days_per_week]);

  const updateWeekDayContent = (week: number, day: number, content: string) => {
    setWeekDayContents(prev => 
      prev.map(wdc => 
        wdc.week === week && wdc.day === day ? { ...wdc, content } : wdc
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsGeneratingImage(true);
      
      let imageUrl = formData.image_url;
      
      // Generate unique image if requested
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
          toast({
            title: "Warning",
            description: "Failed to generate image, saving without image",
            variant: "destructive",
          });
        } else if (imageData?.image_url) {
          imageUrl = imageData.image_url;
        }
      }

      // Create Stripe product if premium + standalone purchase with price (not for personal training)
      let stripeProductId = formData.stripe_product_id;
      let stripePriceId = formData.stripe_price_id;
      
      if (!isPersonalTraining && formData.is_premium && formData.is_standalone_purchase && formData.price && parseFloat(formData.price) > 0) {
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-stripe-product', {
          body: {
            name: formData.name,
            price: formData.price,
            contentType: "Training Program",
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
      
      const duration = `${formData.weeks} Weeks / ${formData.days_per_week} Days per Week`;
      
      // Map difficulty stars to difficulty level
      let difficultyLevel = 'Beginner';
      if (formData.difficulty_stars >= 5) {
        difficultyLevel = 'Advanced';
      } else if (formData.difficulty_stars >= 3) {
        difficultyLevel = 'Intermediate';
      }

      const baseData = {
        id: formData.id,
        serial_number: formData.serial_number,
        name: formData.name,
        category: formData.category,
        difficulty: difficultyLevel,
        difficulty_stars: formData.difficulty_stars,
        weeks: formData.weeks,
        days_per_week: formData.days_per_week,
        equipment: formData.equipment,
        duration,
        weekly_schedule: formData.training_program,
        description: formData.program_description,
        program_structure: formData.construction,
        nutrition_tips: formData.final_tips,
        image_url: imageUrl,
      };

      if (isPersonalTraining) {
        // Personal training programs - always prepaid, no premium/price logic
        // Note: personal_training_programs.serial_number is string type
        const personalTrainingData = {
          ...baseData,
          serial_number: baseData.serial_number.toString(),
          request_id: request?.id || null,
          user_id: request?.user_id || null,
        };

        if (program) {
          const { error } = await supabase
            .from('personal_training_programs')
            .update(personalTrainingData)
            .eq('id', program.id);

          if (error) throw error;
        } else {
          const { error: insertError } = await supabase
            .from('personal_training_programs')
            .insert([personalTrainingData]);

          if (insertError) throw insertError;

          // Update request status to completed and add to user_purchases
          if (request) {
            await supabase
              .from('personal_training_requests')
              .update({ status: 'completed', completed_at: new Date().toISOString() })
              .eq('id', request.id);

            await supabase
              .from('user_purchases')
              .insert([{
                user_id: request.user_id,
                content_type: 'personal_training_program',
                content_id: formData.id,
                content_name: formData.name,
                price: 119,
                purchased_at: new Date().toISOString(),
              }]);

            // Send dashboard notification to user
            try {
              await supabase.functions.invoke('send-system-message', {
                body: {
                  userId: request.user_id,
                  messageType: 'program_delivered',
                  customData: {
                    contentName: formData.name,
                    contentType: 'personal_training_program'
                  }
                }
              });
            } catch (messageError) {
              console.error('Error sending dashboard notification:', messageError);
            }
          }
        }
        toast({ title: "Success", description: program ? "Personal training program updated successfully" : "Personal training program created and delivered to user" });
      } else {
        // Regular training programs with premium/standalone options
        const dataToSave = {
          ...baseData,
          is_premium: formData.is_premium,
          tier_required: null,
          is_standalone_purchase: formData.is_premium && formData.is_standalone_purchase,
          price: formData.is_premium && formData.price ? parseFloat(formData.price) : null,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        };

        if (program) {
          const { error } = await supabase
            .from('admin_training_programs')
            .update(dataToSave)
            .eq('id', program.id);

          if (error) throw error;
          toast({ title: "Success", description: "Program updated successfully" });
        } else {
          const { error } = await supabase
            .from('admin_training_programs')
            .insert([dataToSave]);

          if (error) throw error;
          toast({ title: "Success", description: "Program created successfully" });
        }
      }
      onSave();
      onOpenChange(false);
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
          <DialogTitle>{program ? 'Edit Program' : 'Create New Program'}</DialogTitle>
          <DialogDescription>
            {program ? 'Update program details' : 'Add a new training program to your library'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 1. Category */}
          <div className="space-y-2">
            <Label htmlFor="category">1. Category</Label>
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

          {/* 2. Serial Number */}
          <div className="space-y-2">
            <Label htmlFor="serial_number">2. Serial Number</Label>
            <Input
              id="serial_number"
              type="number"
              value={formData.serial_number}
              onChange={(e) => {
                const serial = parseInt(e.target.value) || 0;
                setFormData({ 
                  ...formData, 
                  serial_number: serial,
                  id: `P-${serial.toString().padStart(3, '0')}`
                });
              }}
              placeholder="Auto-generated"
            />
            <p className="text-sm text-muted-foreground">Program ID: {formData.id}</p>
          </div>

          {/* 3. Name */}
          <div className="space-y-2">
            <Label htmlFor="name">3. Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Program name"
            />
          </div>

          {/* 4. Difficulty Level */}
          <div className="space-y-2">
            <Label htmlFor="difficulty_stars">4. Difficulty Level</Label>
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
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.difficulty_stars <= 2 ? 'Beginner' : formData.difficulty_stars <= 4 ? 'Intermediate' : 'Advanced'}
              </span>
            </div>
          </div>

          {/* 5. Duration */}
          <div className="space-y-2">
            <Label>5. Duration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weeks">Weeks</Label>
                <Select 
                  value={formData.weeks.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, weeks: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weeks" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKS_OPTIONS.map(weeks => (
                      <SelectItem key={weeks} value={weeks.toString()}>{weeks} Weeks</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="days_per_week">Training Days per Week</Label>
                <Select 
                  value={formData.days_per_week.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, days_per_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_PER_WEEK_OPTIONS.map(days => (
                      <SelectItem key={days} value={days.toString()}>{days} Days</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 6. Equipment */}
          <div className="space-y-2">
            <Label htmlFor="equipment">6. Equipment</Label>
            <Select value={formData.equipment} onValueChange={(value) => setFormData({ ...formData, equipment: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {EQUIPMENT_OPTIONS.map(equip => (
                  <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 7. Training Program Content - Single Box */}
          <div className="space-y-2">
            <Label htmlFor="training_program">7. Training Program</Label>
            <p className="text-sm text-muted-foreground">
              Enter the complete training program content. You can use formatting like bold, bullets, spacing, etc.
            </p>
            <Textarea
              id="training_program"
              value={formData.training_program}
              onChange={(e) => setFormData({ ...formData, training_program: e.target.value })}
              placeholder="Enter your complete training program content here..."
              rows={12}
            />
          </div>

          {/* 8. Description */}
          <div className="space-y-2">
            <Label htmlFor="program_description">8. Description</Label>
            <Textarea
              id="program_description"
              value={formData.program_description}
              onChange={(e) => setFormData({ ...formData, program_description: e.target.value })}
              placeholder="Brief description of the program"
              rows={3}
            />
          </div>

          {/* 9. Instructions */}
          <div className="space-y-2">
            <Label htmlFor="construction">9. Instructions</Label>
            <Textarea
              id="construction"
              value={formData.construction}
              onChange={(e) => setFormData({ ...formData, construction: e.target.value })}
              placeholder="Program instructions and structure details"
              rows={4}
            />
          </div>

          {/* 10. Tips */}
          <div className="space-y-2">
            <Label htmlFor="final_tips">10. Tips</Label>
            <Textarea
              id="final_tips"
              value={formData.final_tips}
              onChange={(e) => setFormData({ ...formData, final_tips: e.target.value })}
              placeholder="Tips and additional guidance"
              rows={4}
            />
          </div>

          {/* 11. Image Generation */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="generate_unique_image">11. Generate Unique Image</Label>
                <p className="text-sm text-muted-foreground">
                  AI will create a unique program cover image that doesn't match any existing workout or program
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
                  placeholder="/src/assets/program-image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  For best results: 800x600px, .jpg format, under 200KB
                </p>
              </div>
            )}
          </div>

          {/* Premium/Free and Standalone Purchase - Not shown for personal training */}
          {!isPersonalTraining && (
            <>
              <div className="space-y-2">
                <Label htmlFor="is_premium" className="text-base font-semibold">Premium or Free</Label>
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Switch
                    id="is_premium"
                    checked={formData.is_premium}
                    onCheckedChange={(checked) => setFormData({ 
                      ...formData, 
                      is_premium: checked,
                      is_standalone_purchase: checked ? formData.is_standalone_purchase : false,
                      price: checked ? formData.price : ''
                    })}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium">
                      {formData.is_premium ? '🔒 Premium Content' : '🆓 Free Content'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Toggle ON for Premium (requires subscription), toggle OFF for Free (accessible to all)
                </p>
              </div>

              {formData.is_premium && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_standalone_purchase"
                      checked={formData.is_standalone_purchase}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_standalone_purchase: checked })}
                    />
                    <Label htmlFor="is_standalone_purchase">Available as Standalone Purchase</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable this to allow users to buy this program individually without a subscription
                  </p>

                  {formData.is_standalone_purchase && (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (€) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g., 29.99"
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
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGeneratingImage}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isGeneratingImage}>
              {isGeneratingImage ? "Generating Image..." : "Save Program"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
