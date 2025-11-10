import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { ArticleEditDialog } from "./ArticleEditDialog";
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

export function BlogManager() {
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [searchQuery, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
      setFilteredArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (article: any) => {
    setSelectedArticle(article);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (article: any) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;

    try {
      const { error } = await supabase
        .from('blog_articles')
        .delete()
        .eq('id', articleToDelete.id);

      if (error) throw error;

      toast.success("Article deleted successfully");
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error("Failed to delete article");
    } finally {
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
    }
  };

  const togglePublished = async (article: any) => {
    try {
      const { error } = await supabase
        .from('blog_articles')
        .update({
          is_published: !article.is_published,
          published_at: !article.is_published ? new Date().toISOString() : null,
        })
        .eq('id', article.id);

      if (error) throw error;

      toast.success(`Article ${!article.is_published ? 'published' : 'unpublished'} successfully`);
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error("Failed to update article status");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Fitness: "bg-blue-500",
      Wellness: "bg-green-500",
      Nutrition: "bg-orange-500",
    };
    return colors[category] || "bg-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-lg">Loading articles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Blog Articles</CardTitle>
              <CardDescription>Manage your blog content across all categories</CardDescription>
            </div>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles by title, category, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery ? 'No articles found matching your search.' : 'No articles yet. Create your first one!'}
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{article.title}</h3>
                        {article.is_published ? (
                          <Badge className={getCategoryColor(article.category)}>
                            {article.category}
                          </Badge>
                        ) : (
                          <>
                            <Badge className={getCategoryColor(article.category)}>
                              {article.category}
                            </Badge>
                            <Badge variant="outline">Draft</Badge>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{article.read_time || 'No read time'}</span>
                        <span>•</span>
                        <span>
                          {article.created_at
                            ? new Date(article.created_at).toLocaleDateString()
                            : 'Unknown date'}
                        </span>
                        {article.published_at && (
                          <>
                            <span>•</span>
                            <span>
                              Published: {new Date(article.published_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePublished(article)}
                      >
                        {article.is_published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(article)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(article)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ArticleEditDialog
        article={selectedArticle}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={() => {
          setIsDialogOpen(false);
          fetchArticles();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article "{articleToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}