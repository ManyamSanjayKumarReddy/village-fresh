import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { Navbar } from "@/components/layout/navbar";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { addresses, orderItems, orderStatusHistory, orders } from "@/db/schema";
import { formatPaise } from "@/lib/money";

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

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Placed on{" "}
          {new Date(order.placedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-semibold">Status timeline</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {statusHistory.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 text-sm">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-medium capitalize">{entry.status.replace(/_/g, " ")}</p>
                  {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.changedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-semibold">Items</h2>
          <div className="mt-3 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productNameSnapshot} ({item.variantLabelSnapshot}) &times;{" "}
                  {item.quantity}
                  {item.extraSpicy && (
                    <span className="ml-1 text-xs text-muted-foreground">🌶️ extra spicy</span>
                  )}
                </span>
                <span>{formatPaise(item.lineTotalPaise)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-3 text-sm text-muted-foreground">
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
          </div>
          <div className="mt-2 flex justify-between border-t pt-3 font-heading text-lg font-semibold">
            <span>Total</span>
            <span>{formatPaise(order.totalPaise)}</span>
          </div>
        </section>

        <section className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg font-semibold">Delivery address</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {address.label && <span className="font-medium text-foreground">{address.label} — </span>}
            {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
            {address.city}, {address.state} - {address.pincode}
            <br />
            Phone: {address.phone}
          </p>
        </section>
      </main>
    </div>
  );
}
