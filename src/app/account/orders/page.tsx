import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Navbar } from "@/components/layout/navbar";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatPaise } from "@/lib/money";

export default async function OrdersPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);

  const items = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.id));

  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold">Your orders</h1>

        {items.length === 0 ? (
          <p className="mt-8 text-muted-foreground">
            No orders yet —{" "}
            <Link href="/" className="text-primary hover:underline">
              start shopping
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {items.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-primary"
              >
                <div>
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{formatPaise(order.totalPaise)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
