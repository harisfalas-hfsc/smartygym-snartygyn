import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAccessControl } from "@/hooks/useAccessControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Star, User, Calendar, Pencil, Trash2, Quote } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  testimonial_text: string;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 8;

export const TestimonialsSection = () => {
  const { user, userTier } = useAccessControl();
  const isPremium = userTier === "premium";
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  
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

  useEffect(() => {
    fetchTestimonials();
  }, [sortOrder]);

  useEffect(() => {
    if (user?.id && testimonials.length > 0) {
      const found = testimonials.find(t => t.user_id === user.id);
      setUserTestimonial(found || null);
    }
  }, [user?.id, testimonials]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortOrder]);

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

  const getPaginatedTestimonials = () => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return testimonials.slice(start, end);
  };

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);

  return (
    <Card className="border-2 border-primary/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-xl md:text-2xl mb-4">
          <Quote className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          Community Testimonials
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Write testimonial button - only for premium users without existing testimonial */}
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
          
          {/* Sort filter */}
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:pt-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
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
          <ScrollArea className="h-[550px] md:h-[600px] pr-2 md:pr-4">
            <div className="space-y-3 md:space-y-4">
              {getPaginatedTestimonials().map((testimonial) => (
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
          </ScrollArea>
        )}
        
        {!isLoading && testimonials.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-primary/20 pt-4">
            <p className="text-xs md:text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, testimonials.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, testimonials.length)} of {testimonials.length}
            </p>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
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
    </Card>
  );
};
