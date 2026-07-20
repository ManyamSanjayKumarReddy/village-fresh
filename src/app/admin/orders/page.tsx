import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";
import { Mail, MapPin } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";
import { OrderDetailsDialog } from "@/components/admin/order-details-dialog";
import { db } from "@/db";
import { addresses, orderItems, orders, users } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { ORDER_STAGE_SEQUENCE, ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  ...ORDER_STAGE_SEQUENCE.map((s) => ({ key: s, label: ORDER_STATUS_META[s].label })),
  { key: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeFilter = status && FILTERS.some((f) => f.key === status) ? status : "all";

  const filters =
    activeFilter === "all" ? [] : [eq(orders.status, activeFilter as OrderStatus)];

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
    .where(and(...filters))
    .orderBy(desc(orders.id));

  const orderIds = rows.map((r) => r.order.id);
  const items = orderIds.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds))
    : [];
  const itemsByOrder = new Map<number, typeof items>();
  for (const item of items) {
    const list = itemsByOrder.get(item.orderId) ?? [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              activeFilter === f.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No orders here yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {rows.map(({ order, customerName, customerEmail, city, pincode }) => {
            const statusMeta = ORDER_STATUS_META[order.status as OrderStatus];
            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm"
              >
                <div className={cn("h-1 w-full", statusMeta?.solid.split(" ")[0])} />
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">Order #{order.id}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="size-3.5" />
                        {customerName} ({customerEmail})
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-3.5" />
                        {city}, {pincode}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(order.placedAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-lg font-semibold text-primary">
                        {formatPaise(order.totalPaise)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                        <OrderDetailsDialog orderId={order.id} />
                      </div>
                    </div>
                  </div>

                  <ul className="mt-3 flex flex-col gap-1 border-t pt-3 text-sm text-muted-foreground">
                    {(itemsByOrder.get(order.id) ?? []).map((item) => (
                      <li key={item.id}>
                        {item.productNameSnapshot} ({item.variantLabelSnapshot}) &times;{" "}
                        {item.quantity}
                        {item.extraSpicy && (
                          <span className="ml-1 font-medium text-primary">🌶️ extra spicy</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
