import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomatedMessagesManager } from "./AutomatedMessagesManager";
import { ScheduledNotificationsManager } from "./ScheduledNotificationsManager";
import { MassNotificationManager } from "./MassNotificationManager";
import { TestMessageSender } from "./TestMessageSender";
import { UnifiedAnnouncementSender } from "./UnifiedAnnouncementSender";
import { AutomationRulesManager } from "./AutomationRulesManager";
import { MessagingMonitoringDashboard } from "./MessagingMonitoringDashboard";
import { MobileAppPushManager } from "./MobileAppPushManager";
import { MessageSquare, Calendar, Bell, Send, Megaphone, Settings, BarChart3, Smartphone } from "lucide-react";

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
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-2 -mx-1 px-1">
            <TabsList className="inline-flex flex-nowrap w-max gap-1 p-1">
              <TabsTrigger value="monitoring" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span>Monitor</span>
              </TabsTrigger>
              <TabsTrigger value="mobile-push" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Smartphone className="w-4 h-4 flex-shrink-0" />
                <span>Mobile Push</span>
              </TabsTrigger>
              <TabsTrigger value="automation-rules" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Auto Messages</span>
              </TabsTrigger>
              <TabsTrigger value="automated" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="scheduled" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>Scheduled</span>
              </TabsTrigger>
              <TabsTrigger value="mass" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Bell className="w-4 h-4 flex-shrink-0" />
                <span>Mass</span>
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Megaphone className="w-4 h-4 flex-shrink-0" />
                <span>Announce</span>
              </TabsTrigger>
              <TabsTrigger value="test" className="flex-shrink-0 flex items-center gap-2 whitespace-nowrap text-xs px-3 py-2">
                <Send className="w-4 h-4 flex-shrink-0" />
                <span>Test</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="monitoring">
            <MessagingMonitoringDashboard />
          </TabsContent>

          <TabsContent value="mobile-push">
            <MobileAppPushManager />
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
