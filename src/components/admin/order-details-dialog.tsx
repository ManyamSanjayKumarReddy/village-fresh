"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { formatPaise } from "@/lib/money";

type OrderDetail = {
  order: {
    id: number;
    status: string;
    subtotalPaise: number;
    deliveryFeePaise: number;
    totalPaise: number;
    placedAt: string;
  };
  address: {
    label: string | null;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  customer: { name: string; email: string; phone: string | null };
  items: {
    id: number;
    productNameSnapshot: string;
    variantLabelSnapshot: string;
    quantity: number;
    lineTotalPaise: number;
    extraSpicy: boolean;
  }[];
  statusHistory: { id: number; status: string; note: string | null; changedAt: string }[];
};

export function OrderDetailsDialog({ orderId }: { orderId: number }) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`);
      if (!res.ok) throw new Error("Could not load order.");
      return res.json() as Promise<OrderDetail>;
    },
    enabled: open,
  });

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Order #{orderId}</DialogTitle>
          </DialogHeader>

          {isLoading || !data ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <OrderStatusBadge status={data.order.status} />
                <p className="font-heading text-lg font-semibold text-primary">
                  {formatPaise(data.order.totalPaise)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Customer</h3>
                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                  <p>{data.customer.name}</p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    {data.customer.email}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    {data.address.phone}
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {data.address.label && (
                        <span className="font-medium text-foreground">
                          {data.address.label} —{" "}
                        </span>
                      )}
                      {data.address.line1}
                      {data.address.line2 ? `, ${data.address.line2}` : ""},{" "}
                      {data.address.city}, {data.address.state} - {data.address.pincode}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Items</h3>
                <div className="mt-2 flex flex-col gap-1.5 text-sm">
                  {data.items.map((item) => (
                    <div key={item.id} className="flex justify-between gap-2">
                      <span className="text-muted-foreground">
                        {item.productNameSnapshot} ({item.variantLabelSnapshot}) &times;{" "}
                        {item.quantity}
                        {item.extraSpicy && <span className="ml-1">🌶️</span>}
                      </span>
                      <span className="shrink-0 font-medium">
                        {formatPaise(item.lineTotalPaise)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-1 border-t pt-3 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPaise(data.order.subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {data.order.deliveryFeePaise === 0
                        ? "Free"
                        : formatPaise(data.order.deliveryFeePaise)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Progress</h3>
                <div className="mt-3">
                  <OrderTimeline
                    currentStatus={data.order.status}
                    statusHistory={data.statusHistory}
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
