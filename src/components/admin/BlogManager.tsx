import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, AlertTriangle, CheckCircle, Calendar, Clock } from "lucide-react";
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
  const [imageStatuses, setImageStatuses] = useState<Record<string, { hasImage: boolean; isUnique: boolean }>>({});

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
      
      if (data) {
        checkImageStatuses(data);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const checkImageStatuses = async (articles: any[]) => {
    const statuses: Record<string, { hasImage: boolean; isUnique: boolean }> = {};

    for (const article of articles) {
      const hasImage = !!article.image_url && article.image_url.trim() !== '';
      
      if (hasImage) {
        try {
          const [workoutsRes, programsRes, articlesRes] = await Promise.all([
            supabase.from('admin_workouts').select('image_url').eq('image_url', article.image_url),
            supabase.from('admin_training_programs').select('image_url').eq('image_url', article.image_url),
            supabase.from('blog_articles').select('image_url').eq('image_url', article.image_url).neq('id', article.id)
          ]);

          const conflicts = [
            ...(workoutsRes.data || []),
            ...(programsRes.data || []),
            ...(articlesRes.data || [])
          ];

          statuses[article.id] = {
            hasImage: true,
            isUnique: conflicts.length === 0
          };
        } catch (error) {
          statuses[article.id] = { hasImage: true, isUnique: true };
        }
      } else {
        statuses[article.id] = { hasImage: false, isUnique: true };
      }
    }

    setImageStatuses(statuses);
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
    <div className="pt-6">
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
              filteredArticles.map((article) => {
                const imageStatus = imageStatuses[article.id];
                return (
                  <div
                    key={article.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        {article.image_url ? (
                          <div className="relative flex-shrink-0">
                            <img 
                              src={article.image_url} 
                              alt={article.title}
                              className="w-20 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            {imageStatus && !imageStatus.isUnique && (
                              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1">
                                <AlertTriangle className="h-3 w-3" />
                              </div>
                            )}
                            {imageStatus && imageStatus.isUnique && (
                              <div className="absolute -top-1 -right-1 bg-green-600 text-white rounded-full p-1">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
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
                                <Badge variant="secondary" className="gap-1">
                                  <EyeOff className="h-3 w-3" />
                                  Draft
                                </Badge>
                              </>
                            )}
                            {article.author_name && (
                              <Badge variant="outline" className="bg-primary/5">
                                By {article.author_name}
                              </Badge>
                            )}
                            {imageStatus && !imageStatus.hasImage && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                No Image
                              </Badge>
                            )}
                            {imageStatus && imageStatus.hasImage && !imageStatus.isUnique && (
                              <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400 gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Duplicate
                              </Badge>
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
                      </div>
                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePublished(article)}
                          className="flex-1 sm:flex-none"
                        >
                          {article.is_published ? (
                            <>
                              <EyeOff className="h-4 w-4 sm:mr-0" />
                              <span className="sm:hidden ml-2">Unpublish</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 sm:mr-0" />
                              <span className="sm:hidden ml-2">Publish</span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                          disabled={!article.is_published}
                          className="flex-1 sm:flex-none"
                        >
                          <Eye className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Preview</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(article)}
                          className="flex-1 sm:flex-none"
                        >
                          <Pencil className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(article)}
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
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
    </div>
  );
}