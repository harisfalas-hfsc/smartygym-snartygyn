import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, User, Calendar, Pencil, Trash2, Quote, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";
import { CompactFilters } from "@/components/CompactFilters";

interface Testimonial {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  testimonial_text: string;
  created_at: string;
  updated_at: string;
}

interface TestimonialsSectionProps {
  compact?: boolean;
  desktopCarouselMode?: boolean;
}

export const TestimonialsSection = ({ compact = false, desktopCarouselMode = false }: TestimonialsSectionProps) => {
  const { user, userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // User's own testimonial
  const [userTestimonial, setUserTestimonial] = useState<Testimonial | null>(null);
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [expandedTestimonials, setExpandedTestimonials] = useState<Set<string>>(new Set());

  const toggleTestimonialExpanded = (testimonialId: string) => {
    setExpandedTestimonials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testimonialId)) {
        newSet.delete(testimonialId);
      } else {
        newSet.add(testimonialId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchTestimonials();
  }, [sortOrder]);

  useEffect(() => {
    if (user?.id && testimonials.length > 0) {
      const found = testimonials.find(t => t.user_id === user.id);
      setUserTestimonial(found || null);
    }
  }, [user?.id, testimonials]);


  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: sortOrder === "oldest" });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user?.id || !formText.trim()) return;

    setIsSubmitting(true);
    try {
      // Get user's display name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const displayName = profile?.full_name || "Anonymous User";

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from("testimonials")
          .update({
            testimonial_text: formText.trim(),
            rating: formRating,
            display_name: displayName,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Testimonial updated successfully!");
      } else {
        // Insert new
        const { error } = await supabase
          .from("testimonials")
          .insert({
            user_id: user.id,
            display_name: displayName,
            rating: formRating,
            testimonial_text: formText.trim(),
          });

        if (error) {
          if (error.code === "23505") {
            toast.error("You have already submitted a testimonial.");
          } else {
            throw error;
          }
          return;
        }
        toast.success("Thank you for your testimonial!");
      }

      resetForm();
      fetchTestimonials();
    } catch (error: any) {
      console.error("Error submitting testimonial:", error);
      toast.error(error.message || "Failed to submit testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormText(testimonial.testimonial_text);
    setFormRating(testimonial.rating);
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    setTestimonialToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!testimonialToDelete) return;

    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", testimonialToDelete);

      if (error) throw error;
      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    } finally {
      setDeleteDialogOpen(false);
      setTestimonialToDelete(null);
    }
  };

  const resetForm = () => {
    setFormText("");
    setFormRating(5);
    setEditingId(null);
    setShowForm(false);
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect?.(star)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star
              className={`h-4 w-4 md:h-5 md:w-5 ${
                star <= rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getTopTestimonials = () => {
    return testimonials.slice(0, 6);
  };

  // Desktop carousel mode - content only, no Card wrapper (rendered inside parent Card)
  if (desktopCarouselMode) {
    return (
      <>
        {/* Sort filter for desktop carousel mode */}
        <div className="mb-4">
          <CompactFilters
            filters={[
              {
                name: "Sort",
                value: sortOrder,
                onChange: (value) => setSortOrder(value as "newest" | "oldest"),
                options: [
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" }
                ],
                placeholder: "Sort by"
              }
            ]}
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Quote className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No testimonials yet</p>
            <p className="text-sm">Be the first premium member to share your experience!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:space-y-4">
              {getTopTestimonials().map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-3 md:p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-xs md:text-sm truncate">
                      {testimonial.display_name}
                    </span>
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                    "{testimonial.testimonial_text}"
                  </p>
                </div>
              ))}
            </div>
            {testimonials.length > 6 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowViewAllModal(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View All ({testimonials.length})
                </Button>
              </div>
            )}
          </>
        )}

        {/* View All Testimonials Modal */}
        <Dialog open={showViewAllModal} onOpenChange={setShowViewAllModal}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                All Community Testimonials
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="p-3 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-sm">{testimonial.display_name}</span>
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      "{testimonial.testimonial_text}"
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Compact mode for mobile carousel
  if (compact) {
    return (
      <Card className="border-2 border-primary/30 shadow-lg h-full flex flex-col">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Quote className="h-5 w-5 text-primary" />
            Testimonials
          </CardTitle>
          <CompactFilters
            filters={[
              {
                name: "Sort",
                value: sortOrder,
                onChange: (value) => setSortOrder(value as "newest" | "oldest"),
                options: [
                  { value: "newest", label: "Newest" },
                  { value: "oldest", label: "Oldest" }
                ],
                placeholder: "Sort"
              }
            ]}
          />
        </CardHeader>
        <CardContent className="p-3 flex-1 overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Quote className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No testimonials yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {getTopTestimonials().map((testimonial) => {
                  const isExpanded = expandedTestimonials.has(testimonial.id);
                  return (
                    <div
                      key={testimonial.id}
                      onClick={() => toggleTestimonialExpanded(testimonial.id)}
                      className="p-2 rounded-lg border border-primary/20 bg-gradient-to-r from-background to-primary/5 cursor-pointer active:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="font-semibold text-xs truncate max-w-[80px]">
                            {testimonial.display_name}
                          </span>
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed text-foreground/90 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        "{testimonial.testimonial_text}"
                      </p>
                      {!isExpanded && testimonial.testimonial_text.length > 80 && (
                        <p className="text-[10px] text-muted-foreground mt-1">Tap to read more</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {testimonials.length > 6 && (
                <div className="mt-3 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowViewAllModal(true)}
                    className="gap-1 text-xs h-8"
                  >
                    <Eye className="h-3 w-3" />
                    View All ({testimonials.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>

        {/* View All Testimonials Modal - for compact mode */}
        <Dialog open={showViewAllModal} onOpenChange={setShowViewAllModal}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                All Community Testimonials
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-3">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="p-3 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-sm">{testimonial.display_name}</span>
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      "{testimonial.testimonial_text}"
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
          <Quote className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          Community Testimonials
        </CardTitle>
        
        {/* Write testimonial button or status message - on its own line */}
        <div className="mt-3">
          {isPremium && !userTestimonial && (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto"
              size="sm"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Write Your Testimonial
            </Button>
          )}
          {!isPremium && !userTestimonial && (
            <div className="text-xs text-muted-foreground italic">
              Premium members can share their testimonials
            </div>
          )}
          {userTestimonial && (
            <div className="text-xs text-muted-foreground italic">
              You have already shared your testimonial
            </div>
          )}
        </div>
        
        {/* CompactFilters - below the button, matching other sections */}
        <div className="mt-3">
          <CompactFilters
            filters={[
              {
                name: "Sort",
                value: sortOrder,
                onChange: (value) => setSortOrder(value as "newest" | "oldest"),
                options: [
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" }
                ],
                placeholder: "Sort by"
              }
            ]}
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Quote className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No testimonials yet</p>
            <p className="text-sm">Be the first premium member to share your experience!</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:space-y-4">
              {getTopTestimonials().map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-3 md:p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm truncate">
                        {testimonial.display_name}
                      </span>
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        <span className="text-[10px] md:text-xs">
                          {format(new Date(testimonial.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      
                      {/* Edit/Delete buttons - only for owner */}
                      {user?.id === testimonial.user_id && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(testimonial)}
                            className="h-7 w-7 p-0 hover:bg-primary/10"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(testimonial.id)}
                            className="h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                    "{testimonial.testimonial_text}"
                  </p>
                </div>
              ))}
            </div>
            {testimonials.length > 6 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowViewAllModal(true)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View All ({testimonials.length})
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Write/Edit Testimonial Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Your Testimonial" : "Share Your Experience"}
            </DialogTitle>
            <DialogDescription>
              Tell us about your experience with SmartyGym. Your testimonial will be visible to everyone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <div className="flex items-center gap-2">
                {renderStars(formRating, true, setFormRating)}
                <span className="text-sm text-muted-foreground ml-2">{formRating}/5</span>
              </div>
            </div>
            
            {/* Testimonial Text */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Testimonial</label>
              <Textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Share your experience with SmartyGym..."
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {formText.length}/500
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formText.trim()}
            >
              {isSubmitting ? "Submitting..." : editingId ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View All Testimonials Modal */}
      <Dialog open={showViewAllModal} onOpenChange={setShowViewAllModal}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Quote className="h-5 w-5 text-primary" />
              All Community Testimonials
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-3 md:space-y-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-3 md:p-4 rounded-lg border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-xs md:text-sm truncate">
                        {testimonial.display_name}
                      </span>
                      {renderStars(testimonial.rating)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        <span className="text-[10px] md:text-xs">
                          {format(new Date(testimonial.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      
                      {/* Edit/Delete buttons - only for owner */}
                      {user?.id === testimonial.user_id && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowViewAllModal(false);
                              handleEdit(testimonial);
                            }}
                            className="h-7 w-7 p-0 hover:bg-primary/10"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowViewAllModal(false);
                              handleDeleteClick(testimonial.id);
                            }}
                            className="h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                    "{testimonial.testimonial_text}"
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
