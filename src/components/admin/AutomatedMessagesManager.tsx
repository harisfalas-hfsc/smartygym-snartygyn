import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Copy,
  CheckCircle,
  ShoppingBag,
  Calendar,
  UserPlus,
  Crown,
  Bell,
  ThumbsUp,
  UserX
} from "lucide-react";
import { format } from "date-fns";

interface MessageTemplate {
  id: string;
  message_type: string;
  template_name: string;
  subject: string;
  content: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

const MESSAGE_TYPES = {
  welcome: { label: "Welcome Message", icon: UserPlus, color: "text-green-600" },
  purchase_workout: { label: "Workout Purchase", icon: ShoppingBag, color: "text-blue-600" },
  purchase_program: { label: "Program Purchase", icon: Calendar, color: "text-purple-600" },
  purchase_personal_training: { label: "Personal Training", icon: UserPlus, color: "text-orange-600" },
  purchase_subscription: { label: "Subscription", icon: Crown, color: "text-yellow-600" },
  renewal_reminder: { label: "Renewal Reminder", icon: Bell, color: "text-cyan-600" },
  renewal_thank_you: { label: "Renewal Thank You", icon: ThumbsUp, color: "text-emerald-600" },
  cancellation: { label: "Cancellation", icon: UserX, color: "text-red-600" }
};

export const AutomatedMessagesManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("welcome");
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    template_name: "",
    subject: "",
    content: "",
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('automated_message_templates')
      .select('*')
      .order('message_type', { ascending: true })
      .order('is_default', { ascending: false });

    if (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } else {
      setTemplates(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      subject: template.subject,
      content: template.content,
      is_active: template.is_active,
      is_default: template.is_default
    });
    setShowDialog(true);
  };

  const handleCreate = (messageType: string) => {
    setEditingTemplate(null);
    setSelectedType(messageType);
    setFormData({
      template_name: "",
      subject: "",
      content: "",
      is_active: true,
      is_default: false
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.template_name || !formData.subject || !formData.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const { error } = await supabase
        .from('automated_message_templates')
        .update({
          template_name: formData.template_name,
          subject: formData.subject,
          content: formData.content,
          is_active: formData.is_active,
          is_default: formData.is_default
        })
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
        fetchTemplates();
        setShowDialog(false);
      }
    } else {
      // Create new template
      const { error } = await supabase
        .from('automated_message_templates')
        .insert([{
          message_type: selectedType as any,
          template_name: formData.template_name,
          subject: formData.subject,
          content: formData.content,
          is_active: formData.is_active,
          is_default: formData.is_default
        }]);

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
        fetchTemplates();
        setShowDialog(false);
      }
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from('automated_message_templates')
      .delete()
      .eq('id', templateId);

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

  const handleSetDefault = async (templateId: string, messageType: string) => {
    // First, unset all defaults for this message type
    await supabase
      .from('automated_message_templates')
      .update({ is_default: false })
      .eq('message_type', messageType as any);

    // Then set this one as default
    const { error } = await supabase
      .from('automated_message_templates')
      .update({ is_default: true })
      .eq('id', templateId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default template",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Default template updated",
      });
      fetchTemplates();
    }
  };

  const handleDuplicate = async (template: MessageTemplate) => {
    const { error } = await supabase
      .from('automated_message_templates')
      .insert([{
        message_type: template.message_type as any,
        template_name: `${template.template_name} (Copy)`,
        subject: template.subject,
        content: template.content,
        is_active: template.is_active,
        is_default: false
      }]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Template duplicated successfully",
      });
      fetchTemplates();
    }
  };

  const getTemplatesByType = (type: string) => {
    return templates.filter(t => t.message_type === type);
  };

  const TemplateCard = ({ template }: { template: MessageTemplate }) => (
    <Card className={template.is_default ? 'border-primary border-2' : ''}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{template.template_name}</h3>
                {template.is_default && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Default
                  </Badge>
                )}
                {!template.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-primary mb-2">{template.subject}</p>
              <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                {template.content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {format(new Date(template.updated_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            {!template.is_default && (
              <Button size="sm" variant="outline" onClick={() => handleSetDefault(template.id, template.message_type)}>
                <Star className="h-4 w-4 mr-1" />
                Set Default
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleDuplicate(template)}>
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Automated Messages
          </CardTitle>
          <CardDescription>
            Manage automated message templates for user actions. Messages are sent automatically to user dashboards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="welcome" onValueChange={setSelectedType} value={selectedType}>
            <TabsList className="w-full flex flex-wrap gap-1 h-auto p-2 justify-start">
              {Object.entries(MESSAGE_TYPES).map(([key, { label, icon: Icon, color }]) => {
                const count = getTemplatesByType(key).length;
                return (
                  <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs px-2 py-1.5">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
                    <span className="hidden sm:inline">{label}</span>
                    <Badge variant="secondary" className="ml-1 h-4 text-[10px]">{count}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.keys(MESSAGE_TYPES).map((type) => {
              const typeTemplates = getTemplatesByType(type);
              const typeInfo = MESSAGE_TYPES[type as keyof typeof MESSAGE_TYPES];
              
              return (
                <TabsContent key={type} value={type} className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <typeInfo.icon className={`h-5 w-5 ${typeInfo.color}`} />
                        {typeInfo.label} Templates
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {typeTemplates.length} template{typeTemplates.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <Button onClick={() => handleCreate(type)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Template
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">Loading templates...</div>
                  ) : typeTemplates.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <typeInfo.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No templates yet for this message type</p>
                        <Button className="mt-4" onClick={() => handleCreate(type)}>
                          Create First Template
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {typeTemplates.map((template) => (
                        <TemplateCard key={template.id} template={template} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {MESSAGE_TYPES[selectedType as keyof typeof MESSAGE_TYPES]?.label} Template
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                value={formData.template_name}
                onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                placeholder="e.g., Enthusiastic Welcome"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject Line *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Message subject line"
              />
            </div>

            <div>
              <Label htmlFor="content">Message Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your message here..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use placeholders like [Plan], [Date], [Amount] which will be replaced automatically
              </p>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label htmlFor="is_active" className="text-base">Active Template</Label>
                <p className="text-sm text-muted-foreground">
                  Inactive templates won't be used for automated messages
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-4">
              <div>
                <Label htmlFor="is_default" className="text-base">Default Template</Label>
                <p className="text-sm text-muted-foreground">
                  This template will be used automatically for this message type
                </p>
              </div>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};