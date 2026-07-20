"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin, Receipt, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { formatPaise } from "@/lib/money";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

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

  const statusMeta = data ? ORDER_STATUS_META[data.order.status as OrderStatus] : null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        View details
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg gap-0 overflow-y-auto p-0">
          <DialogTitle className="sr-only">Order #{orderId} details</DialogTitle>

          {isLoading || !data ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className={cn("h-1.5 w-full", statusMeta?.solid.split(" ")[0])} />

              <div className="flex items-center justify-between gap-3 px-6 pt-5 pb-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Order
                  </p>
                  <h2 className="font-heading text-xl font-semibold">#{data.order.id}</h2>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={data.order.status} />
                  <p className="mt-1.5 font-heading text-lg font-semibold text-primary">
                    {formatPaise(data.order.totalPaise)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 px-6 pb-6">
                <section className="rounded-xl border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold">{data.customer.name}</h3>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Mail className="size-3.5 shrink-0" />
                      {data.customer.email}
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      {data.address.phone}
                    </p>
                    <p className="flex items-start gap-2">
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
                </section>

                <section className="rounded-xl border p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Receipt className="size-4 text-primary" />
                    Items
                  </h3>
                  <div className="mt-3 flex flex-col gap-2 text-sm">
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
                </section>

                <section className="rounded-xl border p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Route className="size-4 text-primary" />
                    Progress
                  </h3>
                  <div className="mt-4">
                    <OrderTimeline
                      currentStatus={data.order.status}
                      statusHistory={data.statusHistory}
                    />
                  </div>
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
