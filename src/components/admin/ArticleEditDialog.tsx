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
import { Loader2, Sparkles, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  });
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUniqueness, setImageUniqueness] = useState<{
    isUnique: boolean;
    conflicts: any[];
    checked: boolean;
  }>({ isUnique: true, conflicts: [], checked: false });

  useEffect(() => {
    if (article) {
      setFormData(article);
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'Fitness',
        image_url: '',
        read_time: '',
        is_published: false,
      });
    }
  }, [article]);

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
        description: "Please enter article title and select category first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ad-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          prompt: `Professional blog article hero image about "${formData.title}", ${formData.category.toLowerCase()} theme, modern editorial style, high-quality photography, inspiring and informative, suitable for fitness/wellness blog, clean composition, professional lighting`,
          template: 'blog-article'
        })
      });

      if (!response.ok) throw new Error('Failed to generate image');

      const data = await response.json();
      
      if (data.imageUrl) {
        setFormData({ ...formData, image_url: data.imageUrl });
        await checkImageUniqueness(data.imageUrl);
        toast({
          title: "Success",
          description: "Unique image generated successfully",
        });
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.excerpt || !formData.content || !formData.category) {
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
          description: "Image is required. Please add an image URL or generate one.",
          variant: "destructive",
        });
        return;
      }

      const uniquenessCheck = await checkImageUniqueness(formData.image_url);
      if (!uniquenessCheck.isUnique) {
        const conflictsList = uniquenessCheck.conflicts.map(c => `${c.name} (${c.type})`).join(', ');
        toast({
          title: "Error",
          description: `This image is already used in: ${conflictsList}. Please choose a different image.`,
          variant: "destructive",
        });
        return;
      }

      const articleData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (article) {
        // Update existing
        const { error } = await supabase
          .from('blog_articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;
        toast({ title: "Success", description: "Article updated successfully" });
      } else {
        // Insert new
        const { error } = await supabase
          .from('blog_articles')
          .insert([articleData]);

        if (error) throw error;
        toast({ title: "Success", description: "Article created successfully" });
      }
      onSave();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article ? 'Edit Article' : 'Create New Article'}</DialogTitle>
          <DialogDescription>
            {article ? 'Update article details' : 'Add a new blog article'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="article-url-slug"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
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

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief article summary"
              rows={3}
              className="break-words-safe resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content * (Markdown supported)</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Article content in markdown format"
              rows={20}
              className="font-mono text-sm break-words-safe resize-none"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="image_url">Image URL *</Label>
                <Button
                  type="button"
                  onClick={generateUniqueImage}
                  disabled={isGeneratingImage}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Unique Image
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
              
              {imageUniqueness.checked && (
                <Alert variant={imageUniqueness.isUnique ? "default" : "destructive"}>
                  <div className="flex items-start gap-2">
                    {imageUniqueness.isUnique ? (
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                    )}
                    <AlertDescription>
                      {imageUniqueness.isUnique ? (
                        "Image is unique ✓"
                      ) : (
                        <>
                          Already used in: {imageUniqueness.conflicts.map(c => `${c.name} (${c.type})`).join(', ')}
                        </>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {formData.image_url && (
                <div className="mt-2 relative rounded-lg overflow-hidden border border-border">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="read_time">Read Time</Label>
              <Input
                id="read_time"
                value={formData.read_time || ''}
                onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                placeholder="e.g., 5 min read"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_published"
              checked={formData.is_published}
              onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
            />
            <Label htmlFor="is_published">Published</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Article
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};