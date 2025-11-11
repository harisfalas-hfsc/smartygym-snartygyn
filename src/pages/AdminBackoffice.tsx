import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Dumbbell, Calendar, Settings, Users, Mail, FileText, Shield, BarChart3, BookOpen, MessageSquare, Zap } from "lucide-react";
import { WorkoutsManager } from "@/components/admin/WorkoutsManager";
import { ProgramsManager } from "@/components/admin/ProgramsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { EmailTemplatesManager } from "@/components/admin/EmailTemplatesManager";
import { ModerationDashboard } from "@/components/admin/ModerationDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { BlogManager } from "@/components/admin/BlogManager";
import { PersonalTrainingManager } from "@/components/admin/PersonalTrainingManager";
import { ContactManager } from "@/components/admin/ContactManager";
import { AutomatedMessagesManager } from "@/components/admin/AutomatedMessagesManager";
import { MassNotificationManager } from "@/components/admin/MassNotificationManager";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBackoffice() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminRole();
  const [activeTab, setActiveTab] = useState("workouts");
  const [newContactCount, setNewContactCount] = useState(0);

  useEffect(() => {
    if (isAdmin) {
      fetchNewContactCount();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('contact_messages_admin')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'contact_messages'
          },
          () => {
            fetchNewContactCount();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'contact_messages'
          },
          () => {
            fetchNewContactCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchNewContactCount = async () => {
    const { count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    
    setNewContactCount(count || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this area.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Admin Backoffice</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Manage your workouts and training programs
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/migrate")}
            className="w-full sm:w-auto text-sm"
          >
            Import Content
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex flex-wrap gap-1 h-auto p-2 justify-start">
            <TabsTrigger value="workouts" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Dumbbell className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="personal-training" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">PT</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto relative">
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Contact</span>
              {newContactCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {newContactCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="automated" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Auto Messages</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Newsletter</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Moderate</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 text-xs px-2 py-1.5 h-auto">
              <Settings className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-6">
            <WorkoutsManager />
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <ProgramsManager />
          </TabsContent>

          <TabsContent value="personal-training" className="mt-6">
            <PersonalTrainingManager />
          </TabsContent>

          <TabsContent value="contact" className="mt-6">
            <ContactManager />
          </TabsContent>

          <TabsContent value="automated" className="mt-6">
            <AutomatedMessagesManager />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <MassNotificationManager />
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <BlogManager />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UsersManager />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailComposer />
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <EmailTemplatesManager />
          </TabsContent>

          <TabsContent value="newsletter" className="mt-6">
            <NewsletterManager />
          </TabsContent>

          <TabsContent value="moderation" className="mt-6">
            <ModerationDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your backoffice preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
