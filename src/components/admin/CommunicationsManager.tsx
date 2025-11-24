import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AutomatedMessagesManager } from "./AutomatedMessagesManager";
import { ScheduledNotificationsManager } from "./ScheduledNotificationsManager";
import { MassNotificationManager } from "./MassNotificationManager";
import { TestMessageSender } from "./TestMessageSender";
import { UnifiedAnnouncementSender } from "./UnifiedAnnouncementSender";
import { MessageSquare, Calendar, Bell, Send, Megaphone } from "lucide-react";

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
        <Tabs defaultValue="automated" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="automated" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Automated Messages
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="mass" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Mass Notifications
            </TabsTrigger>
            <TabsTrigger value="announcements" className="flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Content Announcements
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Test Messages
            </TabsTrigger>
          </TabsList>
          
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
