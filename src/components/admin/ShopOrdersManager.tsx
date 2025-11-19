import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const ShopOrdersManager = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const [trackingInfo, setTrackingInfo] = useState("");
  const queryClient = useQueryClient();

  // Real-time subscription for order updates
  useEffect(() => {
    const channel = supabase
      .channel('shop_orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_purchases',
        filter: 'content_type=eq.shop_product'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["shop-orders"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["shop-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_purchases")
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq("content_type", "shop_product")
        .order("purchased_at", { ascending: false });

      if (error) throw error;

      // Get user emails
      const enrichedOrders = await Promise.all(
        data.map(async (order) => {
          const { data: { user } } = await supabase.auth.admin.getUserById(order.user_id);
          return {
            ...order,
            user_email: user?.email,
          };
        })
      );

      return enrichedOrders;
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status, tracking }: { id: string; status: string; tracking: string }) => {
      const { error } = await supabase
        .from("user_purchases")
        .update({
          fulfillment_status: status,
          tracking_info: tracking,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-orders"] });
      toast.success("Order updated successfully");
      setSelectedOrder(null);
      setFulfillmentStatus("");
      setTrackingInfo("");
    },
    onError: (error) => {
      toast.error("Failed to update order: " + error.message);
    },
  });

  const handleUpdateOrder = () => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      id: selectedOrder.id,
      status: fulfillmentStatus,
      tracking: trackingInfo,
    });
  };

  const openOrderDialog = (order: any) => {
    setSelectedOrder(order);
    setFulfillmentStatus(order.fulfillment_status || "pending");
    setTrackingInfo(order.tracking_info || "");
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: "outline",
      processing: "secondary",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    const icons: any = {
      pending: <Package className="w-3 h-3 mr-1" />,
      processing: <Package className="w-3 h-3 mr-1" />,
      shipped: <Truck className="w-3 h-3 mr-1" />,
      delivered: <CheckCircle className="w-3 h-3 mr-1" />,
      cancelled: <XCircle className="w-3 h-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {icons[status]}
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Shop Orders</h2>
        <p className="text-muted-foreground">Manage direct product sales and fulfillment</p>
      </div>

      {isLoading ? (
        <p>Loading orders...</p>
      ) : orders && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order: any) => (
            <Card key={order.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{order.content_name}</h3>
                      {getStatusBadge(order.fulfillment_status || "pending")}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Customer: {order.profiles?.[0]?.full_name || "Unknown"}</p>
                      <p>Email: {order.user_email}</p>
                      <p>Price: €{order.price?.toFixed(2)}</p>
                      <p>Purchased: {new Date(order.purchased_at).toLocaleDateString()}</p>
                      {order.shipping_address && (
                        <div className="text-xs mt-1 p-2 bg-muted/50 rounded">
                          <p className="font-semibold">Shipping Address:</p>
                          <p>{order.shipping_address.line1}</p>
                          {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                          <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      )}
                      {order.tracking_info && (
                        <p className="font-mono text-xs">Tracking: {order.tracking_info}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openOrderDialog(order)}
                  >
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No shop orders yet. Orders will appear here when customers purchase direct sale products.
          </CardContent>
        </Card>
      )}

      {/* Update Order Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update fulfillment status and tracking information for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Fulfillment Status</Label>
              <Select value={fulfillmentStatus} onValueChange={setFulfillmentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tracking">Tracking Information (optional)</Label>
              <Input
                id="tracking"
                value={trackingInfo}
                onChange={(e) => setTrackingInfo(e.target.value)}
                placeholder="Tracking number or notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder} disabled={updateOrderMutation.isPending}>
              {updateOrderMutation.isPending ? "Updating..." : "Update Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};