import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses, orderItems, orderStatusHistory, orders, users } from "@/db/schema";
import { apiError, unexpectedApiError } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return apiError("INVALID_ORDER_ID", "Invalid order id.", 400);
  }

  try {
    const [row] = await db
      .select({ order: orders, address: addresses, customer: users })
      .from(orders)
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .innerJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!row) {
      return apiError("ORDER_NOT_FOUND", "Order not found.", 404);
    }

    const [items, statusHistory] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
      db
        .select()
        .from(orderStatusHistory)
        .where(eq(orderStatusHistory.orderId, orderId))
        .orderBy(asc(orderStatusHistory.changedAt)),
    ]);

    return NextResponse.json({
      order: row.order,
      address: row.address,
      customer: { name: row.customer.name, email: row.customer.email, phone: row.customer.phone },
      items,
      statusHistory,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
