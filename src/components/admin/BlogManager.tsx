import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Download, AlertTriangle, CheckCircle, ExternalLink, Bot, User, Copy, Eye, EyeOff } from "lucide-react";
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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
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
    let filtered = articles;
    
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    if (sourceFilter === "ai") {
      filtered = filtered.filter(article => article.is_ai_generated);
    } else if (sourceFilter === "manual") {
      filtered = filtered.filter(article => !article.is_ai_generated);
    }

    setFilteredArticles(filtered);
  }, [searchQuery, categoryFilter, sourceFilter, articles]);

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

  const handleDuplicate = async (article: any) => {
    try {
      // Get full article data
      const { data: fullArticle, error: fetchError } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('id', article.id)
        .single();

      if (fetchError) throw fetchError;

      // Create new slug
      const newSlug = `${article.slug}-copy-${Date.now()}`;
      const newTitle = `${article.title} (Copy)`;

      // Create duplicate as draft
      const { data: newArticle, error: insertError } = await supabase
        .from('blog_articles')
        .insert({
          ...fullArticle,
          id: undefined, // Let database generate new ID
          title: newTitle,
          slug: newSlug,
          is_published: false, // Start as draft
          published_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Article duplicated. Opening edit dialog...");

      // Reload and open edit dialog for the new article
      await fetchArticles();
      
      if (newArticle) {
        setSelectedArticle(newArticle);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error duplicating article:', error);
      toast.error("Failed to duplicate article");
    }
  };

  const handleTogglePublish = async (articleId: string, currentPublished: boolean) => {
    try {
      const updateData: any = { 
        is_published: !currentPublished,
        updated_at: new Date().toISOString()
      };
      
      // Set published_at when publishing for the first time
      if (!currentPublished) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_articles')
        .update(updateData)
        .eq('id', articleId);

      if (error) throw error;

      toast.success(`Article ${!currentPublished ? 'published' : 'unpublished'}`);
      fetchArticles();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error("Failed to update publish status");
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Slug', 'Title', 'Category', 'Author', 'Status', 'Published Date', 'Read Time', 'Source'].join(','),
      ...filteredArticles.map(article => [
        article.id,
        article.slug,
        `"${article.title}"`,
        article.category,
        article.author_name || 'N/A',
        article.is_published ? 'Published' : 'Draft',
        article.published_at ? new Date(article.published_at).toLocaleDateString() : 'N/A',
        article.read_time || 'N/A',
        article.is_ai_generated ? 'AI' : 'Manual'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-articles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle>Blog Articles</CardTitle>
            <CardDescription>Manage your blog content across all categories</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              New Article
            </Button>
          </div>
        </div>
      </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Fitness">💪 Fitness</SelectItem>
                <SelectItem value="Nutrition">🥗 Nutrition</SelectItem>
                <SelectItem value="Wellness">🧘 Wellness</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai">🤖 AI Generated</SelectItem>
                <SelectItem value="manual">👤 Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchQuery || sourceFilter !== "all" ? 'No articles found matching your filters.' : 'No articles yet. Create your first one!'}
              </div>
            ) : (
              filteredArticles.map((article) => {
                const imageStatus = imageStatuses[article.id];
                return (
                  <div
                    key={article.id}
                    className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors ${!article.is_published ? 'opacity-60' : ''}`}
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
                            {article.is_ai_generated ? (
                              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700">
                                <Bot className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
                                <User className="h-3 w-3 mr-1" />
                                Manual
                              </Badge>
                            )}
                            {article.is_published ? (
                              <Badge className={getCategoryColor(article.category)}>
                                {article.category}
                              </Badge>
                            ) : (
                              <>
                                <Badge className={getCategoryColor(article.category)}>
                                  {article.category}
                                </Badge>
                                <Badge variant="destructive" className="gap-1">
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
                      <div className="flex gap-1 flex-wrap sm:flex-nowrap">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                          disabled={!article.is_published}
                          title="Preview"
                          className="flex-1 sm:flex-none"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(article)}
                          title="Duplicate"
                          className="flex-1 sm:flex-none"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePublish(article.id, article.is_published)}
                          title={article.is_published ? 'Unpublish' : 'Publish'}
                          className="flex-1 sm:flex-none"
                        >
                          {article.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(article)}
                          title="Edit"
                          className="flex-1 sm:flex-none"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(article)}
                          title="Delete"
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
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
