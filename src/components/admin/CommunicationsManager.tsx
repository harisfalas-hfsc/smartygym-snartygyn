import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomatedMessagesManager } from "./AutomatedMessagesManager";
import { ScheduledNotificationsManager } from "./ScheduledNotificationsManager";
import { MassNotificationManager } from "./MassNotificationManager";
import { TestMessageSender } from "./TestMessageSender";
import { UnifiedAnnouncementSender } from "./UnifiedAnnouncementSender";
import { AutomationRulesManager } from "./AutomationRulesManager";
import { MessagingMonitoringDashboard } from "./MessagingMonitoringDashboard";
import { MessageSquare, Calendar, Bell, Send, Megaphone, Settings, BarChart3 } from "lucide-react";

export const CommunicationsManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Communications Center
        </CardTitle>
        <CardDescription>
          Manage all messaging, notifications, and automated communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="monitoring" className="w-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2">
            <TabsList className="inline-flex w-auto min-w-full lg:grid lg:w-full lg:grid-cols-7 gap-1">
              <TabsTrigger value="monitoring" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <BarChart3 className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Monitoring</span>
                <span className="lg:hidden">Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="automation-rules" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <Settings className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Automation Rules</span>
                <span className="lg:hidden">Rules</span>
              </TabsTrigger>
              <TabsTrigger value="automated" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <MessageSquare className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Message Templates</span>
                <span className="lg:hidden">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Manual Scheduled</span>
                <span className="lg:hidden">Scheduled</span>
              </TabsTrigger>
              <TabsTrigger value="mass" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <Bell className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Mass Notifications</span>
                <span className="lg:hidden">Mass</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <Megaphone className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Content Announcements</span>
                <span className="lg:hidden">Announce</span>
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-1 lg:gap-2 whitespace-nowrap text-xs lg:text-sm px-2 lg:px-3">
                <Send className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Test Messages</span>
                <span className="lg:hidden">Test</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="monitoring">
            <MessagingMonitoringDashboard />
          </TabsContent>
          
          <TabsContent value="automation-rules">
            <AutomationRulesManager />
          </TabsContent>
          
          <TabsContent value="automated">
            <AutomatedMessagesManager />
          </TabsContent>
          
          <TabsContent value="scheduled">
            <ScheduledNotificationsManager />
          </TabsContent>
          
          <TabsContent value="mass">
            <MassNotificationManager />
          </TabsContent>

          <TabsContent value="announcements">
            <UnifiedAnnouncementSender />
          </TabsContent>
          
          <TabsContent value="test">
            <TestMessageSender />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
