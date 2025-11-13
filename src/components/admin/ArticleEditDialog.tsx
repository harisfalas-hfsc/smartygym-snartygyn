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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
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