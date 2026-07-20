import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderStatusHistory } from "@/db/schema";
import { updateOrderStatusSchema } from "@/lib/validations/admin";
import { apiError, zodApiError, unexpectedApiError } from "@/lib/api-error";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    return apiError("INVALID_ORDER_ID", "Invalid order id.", 400);
  }

  const body = await request.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return zodApiError(parsed.error);
  }

  try {
    const [order] = await db
      .update(orders)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    if (!order) {
      return apiError("ORDER_NOT_FOUND", "Order not found.", 404);
    }

    await db.insert(orderStatusHistory).values({
      orderId,
      status: parsed.data.status,
      note: parsed.data.note,
    });

    return NextResponse.json({ order });
  } catch (error) {
    return unexpectedApiError(error);
  }
}
