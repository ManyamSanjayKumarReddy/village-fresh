import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderProgressBar } from "@/components/orders/order-progress-bar";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatPaise } from "@/lib/money";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";
import { cn } from "@/lib/utils";

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
            {items.map((order) => {
              const statusMeta = ORDER_STATUS_META[order.status as OrderStatus];
              return (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={cn("h-1 w-full", statusMeta?.solid.split(" ")[0])} />
                  <div className="flex items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
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
                      <span className="font-heading font-semibold">
                        {formatPaise(order.totalPaise)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <OrderProgressBar status={order.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
