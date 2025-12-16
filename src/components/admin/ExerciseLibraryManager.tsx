import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Video, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeId, getYouTubeThumbnail, isValidYouTubeUrl, getRestrictedEmbedUrl } from "@/utils/youtube";

interface ExerciseVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  youtube_url: string;
  thumbnail_url: string | null;
  category: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

const CATEGORIES = [
  'Upper Body',
  'Lower Body',
  'Core',
  'Full Body',
  'Cardio',
  'Mobility',
  'Warm-Up',
  'Cool-Down',
  'General'
];

const ExerciseLibraryManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ExerciseVideo | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: 'General',
    display_order: 0,
    is_visible: true
  });
  const [previewVideoId, setPreviewVideoId] = useState<string | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['admin-exercise-library-videos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_library_videos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExerciseVideo[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const videoId = extractYouTubeId(data.youtube_url);
      if (!videoId) throw new Error('Invalid YouTube URL');

      const { error } = await supabase
        .from('exercise_library_videos')
        .insert({
          title: data.title,
          description: data.description || null,
          youtube_url: data.youtube_url,
          youtube_video_id: videoId,
          thumbnail_url: getYouTubeThumbnail(videoId, 'hq'),
          category: data.category,
          display_order: data.display_order,
          is_visible: data.is_visible
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercise-library-videos'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library-videos'] });
      toast.success('Video added successfully');
      closeDialog();
    },
    onError: (error) => {
      toast.error(`Failed to add video: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const videoId = extractYouTubeId(data.youtube_url);
      if (!videoId) throw new Error('Invalid YouTube URL');

      const { error } = await supabase
        .from('exercise_library_videos')
        .update({
          title: data.title,
          description: data.description || null,
          youtube_url: data.youtube_url,
          youtube_video_id: videoId,
          thumbnail_url: getYouTubeThumbnail(videoId, 'hq'),
          category: data.category,
          display_order: data.display_order,
          is_visible: data.is_visible
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercise-library-videos'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library-videos'] });
      toast.success('Video updated successfully');
      closeDialog();
    },
    onError: (error) => {
      toast.error(`Failed to update video: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exercise_library_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercise-library-videos'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library-videos'] });
      toast.success('Video deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete video: ${error.message}`);
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('exercise_library_videos')
        .update({ is_visible })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-exercise-library-videos'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-library-videos'] });
    }
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingVideo(null);
    setPreviewVideoId(null);
    setFormData({
      title: '',
      description: '',
      youtube_url: '',
      category: 'General',
      display_order: 0,
      is_visible: true
    });
  };

  const openEditDialog = (video: ExerciseVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      category: video.category,
      display_order: video.display_order,
      is_visible: video.is_visible
    });
    setPreviewVideoId(video.youtube_video_id);
    setIsDialogOpen(true);
  };

  const handleYouTubeUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, youtube_url: url }));
    const videoId = extractYouTubeId(url);
    setPreviewVideoId(videoId);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!isValidYouTubeUrl(formData.youtube_url)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exercise Library Videos</h2>
          <p className="text-muted-foreground">Manage YouTube videos for workout demonstrations</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Videos ({videos?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading videos...</div>
          ) : !videos || videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos added yet.</p>
              <p className="text-sm">Click "Add Video" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thumbnail</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Visible</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell>
                        <img
                          src={getYouTubeThumbnail(video.youtube_video_id, 'default')}
                          alt={video.title}
                          className="w-24 h-auto rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px]">
                        <p className="line-clamp-2">{video.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>{video.category}</TableCell>
                      <TableCell>{video.display_order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={video.is_visible}
                          onCheckedChange={(checked) => 
                            toggleVisibilityMutation.mutate({ id: video.id, is_visible: checked })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(video.youtube_url, '_blank')}
                            title="View on YouTube"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(video)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(video.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtube_url">YouTube URL *</Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {formData.youtube_url && !isValidYouTubeUrl(formData.youtube_url) && (
                <p className="text-sm text-destructive">Invalid YouTube URL</p>
              )}
            </div>

            {previewVideoId && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-lg"
                    src={getRestrictedEmbedUrl(previewVideoId, false)}
                    title="Video Preview"
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Exercise demonstration title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
              <Label htmlFor="is_visible">Visible to users</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingVideo ? 'Update' : 'Add Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this video? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExerciseLibraryManager;
