import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Download, Eye } from "lucide-react";
import { format } from "date-fns";

interface NotificationAuditLog {
  id: string;
  notification_type: string;
  message_type: string;
  sent_by: string | null;
  recipient_filter: string | null;
  recipient_count: number;
  success_count: number;
  failed_count: number;
  subject: string;
  content: string;
  sent_at: string;
  metadata: any;
}

export const NotificationHistoryManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<NotificationAuditLog | null>(null);

  // Fetch distinct notification types for the filter dropdown
  const { data: notificationTypes } = useQuery({
    queryKey: ['notification-types-distinct'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_audit_log')
        .select('notification_type')
        .order('notification_type');
      
      if (error) throw error;
      
      // Get unique types
      const types = [...new Set(data?.map(d => d.notification_type) || [])];
      return types;
    }
  });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['notification-audit-logs', filterType],
    queryFn: async () => {
      let query = supabase
        .from('notification_audit_log')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(100);

      if (filterType !== 'all') {
        query = query.eq('notification_type', filterType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NotificationAuditLog[];
    }
  });

  const filteredLogs = auditLogs?.filter(log =>
    log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.message_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    if (!filteredLogs) return;

    const headers = ['Date', 'Type', 'Message Type', 'Subject', 'Recipients', 'Success', 'Failed'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.sent_at), 'yyyy-MM-dd HH:mm'),
      log.notification_type,
      log.message_type,
      log.subject,
      log.recipient_count,
      log.success_count,
      log.failed_count
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notification-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wod_notification': return 'bg-orange-500/10 text-orange-500';
      case 'daily_ritual': return 'bg-purple-500/10 text-purple-500';
      case 'monday_motivation': return 'bg-pink-500/10 text-pink-500';
      case 'automated': return 'bg-green-500/10 text-green-500';
      case 'manual': return 'bg-blue-500/10 text-blue-500';
      case 'scheduled': return 'bg-indigo-500/10 text-indigo-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatTypeName = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSuccessRate = (log: NotificationAuditLog) => {
    if (log.recipient_count === 0) return 0;
    return Math.round((log.success_count / log.recipient_count) * 100);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Notification History & Analytics
          </CardTitle>
          <CardDescription>
            Complete audit log of all sent notifications with delivery metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject, content, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {notificationTypes?.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline" disabled={!filteredLogs?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notification history...</div>
          ) : !filteredLogs?.length ? (
            <div className="text-center py-8 text-muted-foreground">No notifications found</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Message Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Recipients</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm whitespace-nowrap">
                        {format(new Date(log.sent_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(log.notification_type)}>
                          {formatTypeName(log.notification_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTypeName(log.message_type)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.subject}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{log.recipient_count}</span>
                          <span className="text-xs text-muted-foreground">
                            {log.recipient_filter || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-medium ${getSuccessRate(log) === 100 ? 'text-green-500' : getSuccessRate(log) > 80 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {getSuccessRate(log)}%
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.success_count}/{log.recipient_count}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
            <DialogDescription>
              Complete information about this notification
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sent At</p>
                  <p className="text-sm">{format(new Date(selectedLog.sent_at), 'PPpp')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge className={getTypeColor(selectedLog.notification_type)}>
                    {formatTypeName(selectedLog.notification_type)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Message Type</p>
                  <p className="text-sm">{formatTypeName(selectedLog.message_type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Recipient Filter</p>
                  <p className="text-sm">{selectedLog.recipient_filter || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Recipients</p>
                  <p className="text-2xl font-bold">{selectedLog.recipient_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-500">Successful</p>
                  <p className="text-2xl font-bold text-green-500">{selectedLog.success_count}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-500">Failed</p>
                  <p className="text-2xl font-bold text-red-500">{selectedLog.failed_count}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Subject</p>
                <p className="text-sm bg-muted p-3 rounded">{selectedLog.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Content</p>
                <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                  {selectedLog.content}
                </div>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Additional Metadata</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
