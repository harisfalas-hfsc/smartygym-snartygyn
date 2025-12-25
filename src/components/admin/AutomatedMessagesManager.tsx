import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Plus, 
  CheckCircle,
  ShoppingBag,
  Calendar,
  UserPlus,
  Crown,
  Bell,
  ThumbsUp,
  UserX,
  Settings,
  Mail
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
  welcome: { label: "Welcome Message", icon: UserPlus, color: "text-green-600", description: "Sent when a user signs up" },
  purchase_workout: { label: "Workout Purchase", icon: ShoppingBag, color: "text-blue-600", description: "Sent after purchasing a workout" },
  purchase_program: { label: "Program Purchase", icon: Calendar, color: "text-purple-600", description: "Sent after purchasing a program" },
  purchase_subscription: { label: "Subscription Purchase", icon: Crown, color: "text-yellow-600", description: "Sent after subscribing" },
  renewal_reminder: { label: "Renewal Reminder", icon: Bell, color: "text-cyan-600", description: "Sent before subscription expires" },
  renewal_thank_you: { label: "Renewal Thank You", icon: ThumbsUp, color: "text-emerald-600", description: "Sent after successful renewal" },
  cancellation: { label: "Cancellation Notice", icon: UserX, color: "text-red-600", description: "Sent when subscription is cancelled" }
};

export const AutomatedMessagesManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedType, setSelectedType] = useState("");
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

  const handleConfigure = (type: string) => {
    const typeTemplates = templates.filter(t => t.message_type === type);
    const defaultTemplate = typeTemplates.find(t => t.is_default) || typeTemplates[0];
    
    if (defaultTemplate) {
      setEditingTemplate(defaultTemplate);
      setFormData({
        template_name: defaultTemplate.template_name,
        subject: defaultTemplate.subject,
        content: defaultTemplate.content,
        is_active: defaultTemplate.is_active,
        is_default: defaultTemplate.is_default
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        template_name: "",
        subject: "",
        content: "",
        is_active: true,
        is_default: true
      });
    }
    setSelectedType(type);
    setShowDialog(true);
  };

  const handleToggleType = async (type: string, enabled: boolean) => {
    const typeTemplates = templates.filter(t => t.message_type === type);
    
    if (typeTemplates.length === 0 && enabled) {
      // Create a default template if enabling and none exists
      toast({
        title: "No template exists",
        description: "Please configure a template first",
      });
      handleConfigure(type);
      return;
    }

    // Update all templates for this type
    const { error } = await supabase
      .from('automated_message_templates')
      .update({ is_active: enabled })
      .eq('message_type', type as any);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update template status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${MESSAGE_TYPES[type as keyof typeof MESSAGE_TYPES].label} ${enabled ? 'enabled' : 'disabled'}`,
      });
      fetchTemplates();
    }
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

  const getTypeStatus = (type: string) => {
    const typeTemplates = templates.filter(t => t.message_type === type);
    if (typeTemplates.length === 0) return { hasTemplate: false, isEnabled: false };
    const hasActiveTemplate = typeTemplates.some(t => t.is_active);
    return { hasTemplate: true, isEnabled: hasActiveTemplate };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading automated messages...</div>
      </div>
    );
  }

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Automated Messages
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure automated dashboard messages sent to users
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(MESSAGE_TYPES).map(([type, { label, icon: Icon, color, description }]) => {
          const status = getTypeStatus(type);
          const typeTemplates = templates.filter(t => t.message_type === type);
          const defaultTemplate = typeTemplates.find(t => t.is_default) || typeTemplates[0];

          return (
            <Card key={type} className={!status.isEnabled ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${color}`} />
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                  <Switch
                    checked={status.isEnabled}
                    onCheckedChange={(checked) => handleToggleType(type, checked)}
                  />
                </div>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {status.hasTemplate ? (
                  <>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Template: </span>
                      <span className="font-medium">{defaultTemplate?.template_name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {defaultTemplate?.subject}
                    </div>
                    {typeTemplates.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        +{typeTemplates.length - 1} more template{typeTemplates.length > 2 ? 's' : ''}
                      </Badge>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No template configured
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Dashboard
                  </Badge>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleConfigure(type)}
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                className="font-mono text-sm break-words-safe resize-none"
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