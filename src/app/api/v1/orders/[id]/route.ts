import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { addresses, orderItems, orderStatusHistory, orders } from "@/db/schema";
import { apiError, unexpectedApiError } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Sign in required.", 401);
  }

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return apiError("INVALID_ORDER_ID", "Invalid order id.", 400);
  }

  try {
    const [order] = await db
      .select({
        order: orders,
        address: addresses,
      })
      .from(orders)
      .innerJoin(addresses, eq(orders.addressId, addresses.id))
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order || order.order.userId !== Number(session.user.id)) {
      return apiError("ORDER_NOT_FOUND", "Order not found.", 404);
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const statusHistory = await db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.changedAt));

    return NextResponse.json({
      order: order.order,
      address: order.address,
      items,
      statusHistory,
    });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
