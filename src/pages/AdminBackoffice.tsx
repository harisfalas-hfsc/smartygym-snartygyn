import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Calendar, Settings, Users, Mail, FileText, Shield, BarChart3, BookOpen } from "lucide-react";
import { WorkoutsManager } from "@/components/admin/WorkoutsManager";
import { ProgramsManager } from "@/components/admin/ProgramsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { EmailTemplatesManager } from "@/components/admin/EmailTemplatesManager";
import { ModerationDashboard } from "@/components/admin/ModerationDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { BlogManager } from "@/components/admin/BlogManager";

export default function AdminBackoffice() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminRole();
  const [activeTab, setActiveTab] = useState("workouts");

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
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:max-w-6xl lg:grid-cols-10 gap-1">
              <TabsTrigger value="workouts" className="flex items-center gap-1 whitespace-nowrap">
                <Dumbbell className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Workouts</span>
              </TabsTrigger>
              <TabsTrigger value="programs" className="flex items-center gap-1 whitespace-nowrap">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Programs</span>
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center gap-1 whitespace-nowrap">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 whitespace-nowrap">
                <Users className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1 whitespace-nowrap">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-1 whitespace-nowrap">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-1 whitespace-nowrap">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Newsletter</span>
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-1 whitespace-nowrap">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Moderation</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 whitespace-nowrap">
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 whitespace-nowrap">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workouts" className="mt-6">
            <WorkoutsManager />
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <ProgramsManager />
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
