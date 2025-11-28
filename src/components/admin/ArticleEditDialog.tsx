import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "react-router-dom";
import { A4Container } from "@/components/ui/a4-container";

const ARTICLE_CATEGORIES = ["Fitness", "Wellness", "Nutrition"];

interface ArticleEditDialogProps {
  article: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const ArticleEditDialog = ({ article, open, onOpenChange, onSave }: ArticleEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Fitness',
    image_url: '',
    read_time: '',
    is_published: false,
    author_name: '',
    author_credentials: '',
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUniqueness, setImageUniqueness] = useState<{
    isUnique: boolean;
    conflicts: any[];
    checked: boolean;
  }>({ isUnique: true, conflicts: [], checked: false });
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [savedDraft, setSavedDraft] = useState<any>(null);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || 'Fitness',
        image_url: article.image_url || '',
        read_time: article.read_time || '',
        is_published: article.is_published || false,
        author_name: article.author_name || '',
        author_credentials: article.author_credentials || '',
      });
      if (article.image_url) {
        checkImageUniqueness(article.image_url);
      }
    } else {
      // Check for draft
      const draftKey = `blog-article-draft-${article?.id || 'new'}`;
      const savedDraftStr = localStorage.getItem(draftKey);
      
      if (savedDraftStr) {
        try {
          const draft = JSON.parse(savedDraftStr);
          setSavedDraft(draft);
          setShowDraftDialog(true);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
      
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Fitness',
        image_url: '',
        read_time: '',
        is_published: false,
        author_name: '',
        author_credentials: '',
      });
    }
  }, [article, open]);

  // Draft management
  const saveDraft = (data: typeof formData) => {
    const draftKey = `blog-article-draft-${article?.id || 'new'}`;
    const draft = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setDraftTimestamp(Date.now());
  };

  const clearDraft = () => {
    const draftKey = `blog-article-draft-${article?.id || 'new'}`;
    localStorage.removeItem(draftKey);
    setDraftTimestamp(null);
  };

  const restoreDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft);
      setDraftTimestamp(savedDraft.timestamp);
      setShowDraftDialog(false);
    }
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
    setSavedDraft(null);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      if (formData.title || formData.content) {
        saveDraft(formData);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, open]);

  // Debounced save on content changes
  const debouncedSave = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return (data: typeof formData) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (data.title || data.content) {
          saveDraft(data);
        }
      }, 3000);
    };
  }, []);

  useEffect(() => {
    if (formData.title || formData.content) {
      debouncedSave(formData);
    }
  }, [formData.content, formData.title]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({ 
      ...formData, 
      title,
      slug: generateSlug(title)
    });
  };

  const checkImageUniqueness = async (imageUrl: string) => {
    if (!imageUrl || !imageUrl.trim()) {
      setImageUniqueness({ isUnique: true, conflicts: [], checked: false });
      return { isUnique: true, conflicts: [] };
    }

    try {
      const [workoutsRes, programsRes, articlesRes] = await Promise.all([
        supabase.from('admin_workouts').select('name, image_url').eq('image_url', imageUrl),
        supabase.from('admin_training_programs').select('name, image_url').eq('image_url', imageUrl),
        supabase.from('blog_articles').select('title, image_url').eq('image_url', imageUrl).neq('id', article?.id || '')
      ]);

      const conflicts = [
        ...(workoutsRes.data || []).map(w => ({ name: w.name, type: 'Workout' })),
        ...(programsRes.data || []).map(p => ({ name: p.name, type: 'Program' })),
        ...(articlesRes.data || []).map(a => ({ name: a.title, type: 'Article' }))
      ];

      const result = {
        isUnique: conflicts.length === 0,
        conflicts,
        checked: true
      };

      setImageUniqueness(result);
      return result;
    } catch (error) {
      console.error('Error checking image uniqueness:', error);
      return { isUnique: true, conflicts: [] };
    }
  };

  const handleImageUrlChange = async (url: string) => {
    setFormData({ ...formData, image_url: url });
    if (url && url.trim()) {
      await checkImageUniqueness(url);
    } else {
      setImageUniqueness({ isUnique: true, conflicts: [], checked: false });
    }
  };

  const generateUniqueImage = async () => {
    if (!formData.title || !formData.category) {
      toast({
        title: "Error",
        description: "Please enter a title and select a category first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    let attempts = 0;
    const maxAttempts = 3;

    try {
      while (attempts < maxAttempts) {
        // Use the new generate-blog-image function that uploads to storage
        const { data, error } = await supabase.functions.invoke('generate-blog-image', {
          body: {
            title: formData.title,
            category: formData.category,
            slug: formData.slug,
          },
        });

        if (error) throw error;

        const imageUrl = data.imageUrl;
        const uniquenessCheck = await checkImageUniqueness(imageUrl);

        if (uniquenessCheck.isUnique) {
          setFormData({ ...formData, image_url: imageUrl });
          toast({
            title: "Success",
            description: "Unique image generated and uploaded successfully",
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          toast({
            title: "Duplicate Image",
            description: `Image already exists. Generating another attempt (${attempts}/${maxAttempts})...`,
          });
        }
      }

      toast({
        title: "Warning",
        description: "Could not generate a unique image after 3 attempts. Please try again or use a custom URL.",
        variant: "destructive",
      });
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAuthorToggle = (checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        author_name: 'Haris Falas',
        author_credentials: 'BSc Sports Science\nEXOS Specialist\nCSCS'
      });
    } else {
      setFormData({
        ...formData,
        author_name: '',
        author_credentials: ''
      });
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.image_url || !formData.image_url.trim()) {
      toast({
        title: "Error",
        description: "Please generate or enter an image URL",
        variant: "destructive",
      });
      return;
    }

    if (imageUniqueness.checked && !imageUniqueness.isUnique) {
      toast({
        title: "Error",
        description: "Image is already used by another content. Please generate a unique image or use a different URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataToSave = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        image_url: formData.image_url,
        read_time: formData.read_time,
        is_published: formData.is_published,
        published_at: formData.is_published ? new Date().toISOString() : null,
        author_name: formData.author_name || null,
        author_credentials: formData.author_credentials || null,
      };

      if (article) {
        const { error } = await supabase
          .from('blog_articles')
          .update(dataToSave)
          .eq('id', article.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_articles')
          .insert([dataToSave]);

        if (error) throw error;
      }

      // Clear draft on successful save
      clearDraft();

      toast({
        title: "Success",
        description: `Article ${article ? "updated" : "created"} successfully`,
      });
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save article",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Draft Found</AlertDialogTitle>
            <AlertDialogDescription>
              A draft was found from {savedDraft?.timestamp && new Date(savedDraft.timestamp).toLocaleString()}. 
              Would you like to restore it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={discardDraft}>Discard Draft</AlertDialogCancel>
            <AlertDialogAction onClick={restoreDraft}>Restore Draft</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>{article ? 'Edit Article' : 'Create New Article'}</DialogTitle>
            <DialogDescription>
              {article ? 'Update the article details' : 'Fill in the article information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pb-4">
            {draftTimestamp && (
              <p className="text-xs text-muted-foreground">
                Draft saved at {new Date(draftTimestamp).toLocaleTimeString()}
              </p>
            )}
            
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Article title"
              />
            </div>

            <div>
              <Label htmlFor="slug">Slug (auto-generated)</Label>
              <Input
                id="slug"
                value={formData.slug}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ARTICLE_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Author Attribution</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="author-toggle"
                  checked={!!formData.author_name}
                  onCheckedChange={handleAuthorToggle}
                />
                <Label htmlFor="author-toggle" className="cursor-pointer">
                  Mark as written by Haris Falas
                </Label>
              </div>
              
              {formData.author_name && (
                <div className="border border-border bg-muted/50 p-4 rounded-md">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-muted-foreground">By:</span>
                    <div>
                      <Link 
                        to="/coach-profile" 
                        className="font-semibold text-primary hover:underline whitespace-nowrap pointer-events-none"
                      >
                        {formData.author_name}
                      </Link>
                      {formData.author_credentials && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {formData.author_credentials.split('\n').map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description"
                rows={2}
              />
            </div>

            <div>
              <Label>Content *</Label>
              <A4Container>
                <RichTextEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your article content..."
                  minHeight="300px"
                />
              </A4Container>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL *</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="Enter image URL or generate one"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={generateUniqueImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Unique Image
                    </>
                  )}
                </Button>
              </div>

              {imageUniqueness.checked && (
                <Alert variant={imageUniqueness.isUnique ? "default" : "destructive"} className="mt-2">
                  <div className="flex items-center gap-2">
                    {imageUniqueness.isUnique ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {imageUniqueness.isUnique 
                        ? "Image is unique!" 
                        : `Image already used by: ${imageUniqueness.conflicts.map(c => `${c.name} (${c.type})`).join(', ')}`
                      }
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {formData.image_url && (
                <div className="mt-2">
                  <img 
                    src={formData.image_url} 
                    alt="Article preview"
                    className="max-w-full h-auto rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="read_time">Read Time</Label>
              <Input
                id="read_time"
                value={formData.read_time}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                placeholder="e.g., 5 min read"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_published"
                checked={formData.is_published}
                onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Publish article
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {article ? 'Update' : 'Create'} Article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
