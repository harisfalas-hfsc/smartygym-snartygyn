import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Folder, Users, Mail, FileText, Settings, BarChart3, BookOpen, MessageSquare, Inbox, Image } from "lucide-react";
import { ContentManager } from "@/components/admin/ContentManager";
import { CommunicationsManager } from "@/components/admin/CommunicationsManager";
import { EmailManager } from "@/components/admin/EmailManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { ModerationDashboard } from "@/components/admin/ModerationDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { BlogManager } from "@/components/admin/BlogManager";
import { ContactManager } from "@/components/admin/ContactManager";
import { InstagramImageGenerator } from "@/components/admin/InstagramImageGenerator";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { CommentModerationPanel } from "@/components/admin/CommentModerationPanel";
import { supabase } from "@/integrations/supabase/client";

export default function AdminBackoffice() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminRole();
  const [activeTab, setActiveTab] = useState("content");
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
              <h1 className="text-2xl sm:text-4xl font-bold">Admin Backoffice</h1>
              <p className="text-xs sm:text-base text-muted-foreground">Manage your platform</p>
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
          <TabsList className="w-full h-auto p-1 sm:p-2 flex flex-nowrap overflow-x-auto gap-0.5 sm:gap-1 bg-background border border-border rounded-lg">
            <TabsTrigger value="content" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Folder className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            
            <TabsTrigger value="community" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            
            <TabsTrigger value="contact" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0 relative">
              <Inbox className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Contact</span>
              {newContactCount > 0 && (
                <Badge variant="destructive" className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full p-0 flex items-center justify-center text-[8px] sm:text-[10px]">
                  {newContactCount}
                </Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="communications" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Comms</span>
            </TabsTrigger>
            
            <TabsTrigger value="email" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            
            <TabsTrigger value="users" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            
            <TabsTrigger value="blog" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            
            <TabsTrigger value="instagram" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Image className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            
            <TabsTrigger value="analytics" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="flex items-center justify-center gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 py-2 sm:py-2.5 whitespace-nowrap flex-shrink-0">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="content" className="mt-0">
              <ContentManager />
            </TabsContent>

            <TabsContent value="community" className="mt-0">
              <Tabs defaultValue="moderation" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="moderation">Moderation</TabsTrigger>
                  <TabsTrigger value="comments">Comments & Flags</TabsTrigger>
                </TabsList>
                <TabsContent value="moderation" className="mt-4">
                  <ModerationDashboard />
                </TabsContent>
                <TabsContent value="comments" className="mt-4">
                  <CommentModerationPanel />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="contact" className="mt-0">
              <ContactManager />
            </TabsContent>

            <TabsContent value="communications" className="mt-0">
              <CommunicationsManager />
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <EmailManager />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <UsersManager />
            </TabsContent>

            <TabsContent value="blog" className="mt-0">
              <BlogManager />
            </TabsContent>

            <TabsContent value="instagram" className="mt-0">
              <InstagramImageGenerator />
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <SettingsManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
