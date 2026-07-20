import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { MapPin, Receipt } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { addresses, orderItems, orderStatusHistory, orders } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  const session = await auth();
  const userId = Number(session?.user?.id);

  if (!Number.isInteger(orderId) || orderId <= 0) notFound();

  const [row] = await db
    .select({ order: orders, address: addresses })
    .from(orders)
    .innerJoin(addresses, eq(orders.addressId, addresses.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!row || row.order.userId !== userId) notFound();

  const [items, statusHistory] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.changedAt)),
  ]);

  const { order, address } = row;
  const statusMeta = ORDER_STATUS_META[order.status as OrderStatus];

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div
          className={cn(
            "overflow-hidden rounded-2xl border bg-card shadow-sm",
            "relative",
          )}
        >
          <div className={cn("h-1.5 w-full", statusMeta?.solid.split(" ")[0])} />
          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Order</p>
              <h1 className="font-heading text-2xl font-semibold">#{order.id}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on{" "}
                {new Date(order.placedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <OrderStatusBadge status={order.status} />
              <p className="mt-2 font-heading text-xl font-semibold text-primary">
                {formatPaise(order.totalPaise)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border bg-card p-6 lg:col-span-2">
            <h2 className="font-heading text-lg font-semibold">Order progress</h2>
            <div className="mt-6">
              <OrderTimeline currentStatus={order.status} statusHistory={statusHistory} />
            </div>
          </section>

          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <Receipt className="size-4 text-primary" />
                Summary
              </h2>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                {items.map((item) => (
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
              <div className="mt-4 flex flex-col gap-1.5 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPaise(order.subtotalPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {order.deliveryFeePaise === 0 ? "Free" : formatPaise(order.deliveryFeePaise)}
                  </span>
                </div>
                {order.discountPaise > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Coupon ({order.couponCode})</span>
                    <span>-{formatPaise(order.discountPaise)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-heading text-lg font-semibold">
                <span>Total</span>
                <span>{formatPaise(order.totalPaise)}</span>
              </div>
            </section>

            <section className="rounded-2xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
                <MapPin className="size-4 text-primary" />
                Delivery address
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {address.label && (
                  <span className="font-medium text-foreground">{address.label} — </span>
                )}
                {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
                {address.city}, {address.state} - {address.pincode}
                <br />
                Phone: {address.phone}
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
