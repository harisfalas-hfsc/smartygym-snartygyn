import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Dumbbell, Calendar, Settings, Users, Mail, FileText, Shield } from "lucide-react";
import { WorkoutsManager } from "@/components/admin/WorkoutsManager";
import { ProgramsManager } from "@/components/admin/ProgramsManager";
import { UsersManager } from "@/components/admin/UsersManager";
import { EmailComposer } from "@/components/admin/EmailComposer";
import { EmailTemplatesManager } from "@/components/admin/EmailTemplatesManager";
import { ModerationDashboard } from "@/components/admin/ModerationDashboard";

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
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Backoffice</h1>
              <p className="text-muted-foreground">Manage your workouts and training programs</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/migrate")}
          >
            Import Content
          </Button>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-5xl grid-cols-7">
            <TabsTrigger value="workouts" className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden lg:inline">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Programs</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden lg:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden lg:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-6">
            <WorkoutsManager />
          </TabsContent>

          <TabsContent value="programs" className="mt-6">
            <ProgramsManager />
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

          <TabsContent value="moderation" className="mt-6">
            <ModerationDashboard />
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
