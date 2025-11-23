import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const TestEmailSender = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [formData, setFormData] = useState({
    testEmail: "",
    subject: "",
    message: "",
    selectedTemplate: "",
  });

  useEffect(() => {
    fetchAdminEmail();
    fetchTemplates();
  }, []);

  const fetchAdminEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setAdminEmail(user.email);
        setFormData(prev => ({ ...prev, testEmail: user.email }));
      }
    } catch (error) {
      console.error("Error fetching admin email:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("id, name, subject, body")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        selectedTemplate: templateId,
        subject: template.subject,
        message: template.body,
      }));
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.testEmail || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get admin user ID for logging
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase.functions.invoke("send-bulk-email", {
        body: {
          userIds: [], // Empty array means use recipient_emails
          recipient_emails: [formData.testEmail],
          subject: formData.subject,
          message: formData.message,
          isTest: true,
        },
      });

      if (error) throw error;

      const result = data as { success: boolean; sent: number; failed: number };

      if (result.success && result.sent > 0) {
        toast({
          title: "Success",
          description: `Test email sent to ${formData.testEmail}`,
        });
      } else {
        throw new Error("Failed to send test email");
      }
    } catch (error: any) {
      console.error("Error sending test email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email to verify your email templates and delivery system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendTestEmail} className="space-y-4">
            {/* Template Selection */}
            {templates.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="template">Use Template (optional)</Label>
                <Select
                  value={formData.selectedTemplate}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template to test" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No template</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address *</Label>
              <Input
                id="testEmail"
                type="email"
                value={formData.testEmail}
                onChange={(e) => setFormData({ ...formData, testEmail: e.target.value })}
                placeholder={adminEmail || "your-email@example.com"}
                required
              />
              <p className="text-xs text-muted-foreground">
                Default: Your admin account email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Test Email - SmartyGym"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Email Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Your test message..."
                rows={10}
                required
              />
              <p className="text-xs text-muted-foreground">
                Plain text will be converted to HTML. Line breaks will be preserved.
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test Email
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    testEmail: adminEmail,
                    subject: "",
                    message: "",
                    selectedTemplate: "",
                  });
                }}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};