import { desc, eq } from "drizzle-orm";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { db } from "@/db";
import { addresses, orders, users } from "@/db/schema";
import { formatPaise } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const rows = await db
    .select({
      order: orders,
      customerName: users.name,
      customerEmail: users.email,
      city: addresses.city,
      pincode: addresses.pincode,
    })
    .from(orders)
    .innerJoin(users, eq(orders.userId, users.id))
    .innerJoin(addresses, eq(orders.addressId, addresses.id))
    .orderBy(desc(orders.id));

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Orders</h1>

      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {rows.map(({ order, customerName, customerEmail, city, pincode }) => (
            <div key={order.id} className="rounded-xl border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    Order #{order.id} — {formatPaise(order.totalPaise)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customerName} ({customerEmail}) — {city}, {pincode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
