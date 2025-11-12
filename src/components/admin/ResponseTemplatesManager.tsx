import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Plus, Edit, Trash2 } from "lucide-react";

interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export const ResponseTemplatesManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ResponseTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('response_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Error",
        description: "Name and content are required",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      const { error } = await supabase
        .from('response_templates')
        .update(formData)
        .eq('id', editingTemplate.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update template",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
        setShowDialog(false);
        resetForm();
        fetchTemplates();
      }
    } else {
      const { error } = await supabase
        .from('response_templates')
        .insert([formData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create template",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Template created successfully",
        });
        setShowDialog(false);
        resetForm();
        fetchTemplates();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from('response_templates')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
      fetchTemplates();
    }
  };

  const handleEdit = (template: ResponseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'general'
    });
  };

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Response Templates
              </CardTitle>
              <CardDescription>
                Create and manage reusable response templates for contact messages
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8">Loading templates...</p>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No templates yet. Create your first template to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        {template.subject && (
                          <p className="text-sm text-muted-foreground mt-1">Subject: {template.subject}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {template.content}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="capitalize">{template.category}</Badge>
                          {template.is_active && <Badge variant="default">Active</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(template.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update your response template' : 'Create a new reusable response template'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Welcome Response, Support Thank You"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="coach_direct">Coach Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Auto-fill subject when using this template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Response Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter your template content..."
                rows={10}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use placeholders like {`{{name}}`} or {`{{email}}`} for personalization
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};