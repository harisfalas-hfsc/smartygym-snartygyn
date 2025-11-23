import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailComposer } from "./EmailComposer";
import { EmailTemplatesManager } from "./EmailTemplatesManager";
import { ScheduledEmailsManager } from "./ScheduledEmailsManager";
import { TestEmailSender } from "./TestEmailSender";
import { Mail, FileText, Calendar, Send } from "lucide-react";

export const EmailManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Campaigns
        </CardTitle>
        <CardDescription>
          Manage email templates, schedule automated emails, send mass emails, and test delivery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="mass" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Mass Email
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Test Email
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates">
            <EmailTemplatesManager />
          </TabsContent>
          
          <TabsContent value="scheduled">
            <ScheduledEmailsManager />
          </TabsContent>
          
          <TabsContent value="mass">
            <EmailComposer />
          </TabsContent>
          
          <TabsContent value="test">
            <TestEmailSender />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
