import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface OrderProps {
  userId: string;
}

export function MyOrders({ userId }: OrderProps) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_purchases")
        .select("*")
        .eq("user_id", userId)
        .eq("content_type", "shop_product")
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status: string): "outline" | "secondary" | "default" | "destructive" => {
    switch (status) {
      case "pending":
        return "outline";
      case "processing":
        return "secondary";
      case "shipped":
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No shop orders yet</p>
          <p className="text-sm mt-2">Your product orders will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{order.content_name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Ordered: {new Date(order.purchased_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.fulfillment_status || "pending")}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(order.fulfillment_status || "pending")}
                  {order.fulfillment_status || "pending"}
                </span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-semibold">€{order.price?.toFixed(2)}</span>
              </div>
              
              {order.shipping_address && typeof order.shipping_address === 'object' && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Shipping Address:</p>
                  <p>{(order.shipping_address as unknown as ShippingAddress).line1}</p>
                  {(order.shipping_address as unknown as ShippingAddress).line2 && (
                    <p>{(order.shipping_address as unknown as ShippingAddress).line2}</p>
                  )}
                  <p>
                    {(order.shipping_address as unknown as ShippingAddress).city},{" "}
                    {(order.shipping_address as unknown as ShippingAddress).state}{" "}
                    {(order.shipping_address as unknown as ShippingAddress).postal_code}
                  </p>
                  <p>{(order.shipping_address as unknown as ShippingAddress).country}</p>
                </div>
              )}

              {order.tracking_info && (
                <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Tracking Information:
                  </p>
                  <p className="font-mono text-sm">{order.tracking_info}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
