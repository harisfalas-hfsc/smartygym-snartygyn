import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  active: boolean;
  subscribed_at: string;
}

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubscriberEmail, setNewSubscriberEmail] = useState("");
  const [newSubscriberName, setNewSubscriberName] = useState("");

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;

      setSubscribers(data || []);
      setFilteredSubscribers(data || []);
    } catch (error) {
      console.error('Error fetching newsletter subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredSubscribers(
        subscribers.filter(sub =>
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredSubscribers(subscribers);
    }
  }, [searchTerm, subscribers]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Subscriber removed');
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to remove subscriber');
    } finally {
      setSubscriberToDelete(null);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newSubscriberEmail || !newSubscriberName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Use the edge function to add subscriber
      const { error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email: newSubscriberEmail, name: newSubscriberName }
      });

      if (error) throw error;

      toast.success('Subscriber added successfully');
      setIsAddDialogOpen(false);
      setNewSubscriberEmail("");
      setNewSubscriberName("");
      fetchSubscribers();
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast.error('Failed to add subscriber');
    }
  };

  const exportToCSV = () => {
    const headers = ["Email", "Name", "Status", "Subscribed Date"];
    const rows = filteredSubscribers.map(sub => [
      sub.email,
      sub.name,
      sub.active ? 'Active' : 'Inactive',
      format(new Date(sub.subscribed_at), 'yyyy-MM-dd HH:mm'),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredSubscribers.length} subscribers`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Newsletter Subscribers</CardTitle>
              <CardDescription>Manage your newsletter subscriber list</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Subscriber
              </Button>
              <Button onClick={fetchSubscribers} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
              <p className="text-2xl font-bold">{subscribers.length}</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
              <p className="text-2xl font-bold">
                {subscribers.filter(s => s.active).length}
              </p>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.name}</TableCell>
                      <TableCell>
                        <Badge variant={subscriber.active ? 'default' : 'secondary'}>
                          {subscriber.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSubscriberToDelete(subscriber.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!subscriberToDelete} onOpenChange={() => setSubscriberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Subscriber</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this subscriber? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => subscriberToDelete && handleDelete(subscriberToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Newsletter Subscriber</DialogTitle>
            <DialogDescription>
              Manually add a new subscriber to your newsletter list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="subscriber@example.com"
                value={newSubscriberEmail}
                onChange={(e) => setNewSubscriberEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Subscriber Name"
                value={newSubscriberName}
                onChange={(e) => setNewSubscriberName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriber}>
              Add Subscriber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
